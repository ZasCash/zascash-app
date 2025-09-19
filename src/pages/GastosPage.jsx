
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import PageTitle from '@/components/shared/PageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar as CalendarIcon, FileText, MoreVertical, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import AddGastoGeneralDialog from '@/components/shared/AddGastoGeneralDialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useOutletContext } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/shared/AlertDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown';
import EditGastoGeneralDialog from '@/components/shared/EditGastoGeneralDialog';

const GastosPage = () => {
  const { selectedLocal } = useOutletContext();
  const { toast } = useToast();
  const [gastos, setGastos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGasto, setEditingGasto] = useState(null);

  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = subMonths(today, i);
      options.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy', { locale: es }),
      });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);

  const fetchGastosAndProveedores = useCallback(async () => {
    if (!selectedLocal) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const from = format(startOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
      const to = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');

      const [gastosRes, proveedoresRes] = await Promise.all([
        supabase
          .from('gastos')
          .select('*, proveedor:proveedor_id(nombre)')
          .eq('local_id', selectedLocal.id)
          .gte('fecha', from)
          .lte('fecha', to)
          .order('fecha', { ascending: false }),
        supabase
          .from('proveedores')
          .select('*')
          .eq('local_id', selectedLocal.id)
      ]);

      if (gastosRes.error) throw gastosRes.error;
      if (proveedoresRes.error) throw proveedoresRes.error;

      setGastos(gastosRes.data || []);
      setProveedores(proveedoresRes.data || []);
    } catch (error) {
      toast({ title: 'Error al cargar los datos', description: error.message, variant: 'destructive' });
      setGastos([]);
      setProveedores([]);
    } finally {
      setLoading(false);
    }
  }, [selectedLocal, selectedMonth, toast]);

  useEffect(() => {
    fetchGastosAndProveedores();
  }, [fetchGastosAndProveedores]);
  
  const handleDeleteGasto = async (gasto) => {
    if (gasto.tipo === 'caja') {
        toast({ title: 'Acción no permitida', description: 'Los gastos de caja solo se pueden gestionar desde el turno correspondiente.', variant: 'destructive' });
        return;
    }
    try {
      const { error } = await supabase.from('gastos').delete().eq('id', gasto.id);
      if (error) throw error;
      toast({ title: "Gasto eliminado" });
      fetchGastosAndProveedores();
    } catch(error) {
       toast({ title: 'Error al eliminar el gasto', description: error.message, variant: 'destructive' });
    }
  }

  const handleEditGasto = (gasto) => {
    if (gasto.tipo === 'caja') {
        toast({ title: 'Acción no permitida', description: 'Los gastos de caja solo se pueden gestionar desde el turno correspondiente.', variant: 'destructive' });
        return;
    }
    setEditingGasto(gasto);
  }

  return (
    <>
      <Helmet><title>Historial de Gastos - ZasCash</title></Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageTitle title="Historial de Gastos" description="Consulta todos los gastos generales y de caja de tu local." />
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Filtrar Gastos</CardTitle>
                <CardDescription>Selecciona un mes para ver los gastos.</CardDescription>
              </div>
              <div className="flex items-end gap-4 w-full md:w-auto">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="month">Mes</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-full sm:w-[200px]" id="month">
                      <SelectValue placeholder="Selecciona un mes" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedLocal && <AddGastoGeneralDialog localId={selectedLocal.id} proveedores={proveedores} onGastoAdded={fetchGastosAndProveedores} />}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : gastos.length > 0 ? (
              <div className="space-y-4">
                {gastos.map(gasto => (
                  <Card key={gasto.id} className={`bg-secondary/50 ${gasto.tipo === 'caja' ? 'border-dashed border-primary/50' : ''}`}>
                    <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-4 text-sm items-center">
                      <div className="flex items-center gap-2">
                         {gasto.tipo === 'caja' ? <span className="text-xs font-semibold uppercase text-primary bg-primary/10 px-2 py-1 rounded-full">Caja</span> : <FileText className="h-4 w-4 text-muted-foreground" /> }
                        <span className="font-semibold">{gasto.concepto}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(gasto.fecha), 'PPP', { locale: es })}</span>
                      </div>
                      <div className="flex items-center gap-2 justify-self-start sm:justify-self-end">
                        <span className="font-bold text-lg text-destructive">-€{gasto.importe.toFixed(2)}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleEditGasto(gasto)} disabled={gasto.tipo === 'caja'}>
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={gasto.tipo === 'caja'} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" /> 
                                  <span>Eliminar</span>
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Seguro que quieres eliminar este gasto?</AlertDialogTitle>
                                  <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteGasto(gasto)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">No se encontraron gastos para el mes seleccionado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      {editingGasto && (
        <EditGastoGeneralDialog
          gasto={editingGasto}
          open={!!editingGasto}
          setOpen={() => setEditingGasto(null)}
          localId={selectedLocal.id}
          proveedores={proveedores}
          onGastoUpdated={() => {
            setEditingGasto(null);
            fetchGastosAndProveedores();
          }}
        />
      )}
    </>
  );
};

export default GastosPage;
