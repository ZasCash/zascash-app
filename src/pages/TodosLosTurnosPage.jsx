import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import PageTitle from '@/components/shared/PageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Clock, CheckCircle, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const TodosLosTurnosPage = ({ selectedLocal }) => {
  const { toast } = useToast();
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchTurnos = useCallback(async () => {
    if (!selectedLocal || !dateRange.from || !dateRange.to) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('turnos')
      .select('*, profile:empleado_id(full_name)')
      .eq('local_id', selectedLocal.id)
      .gte('fecha', dateRange.from)
      .lte('fecha', dateRange.to)
      .order('inicio_turno', { ascending: false });

    if (error) {
      toast({ title: 'Error al cargar los turnos', description: error.message, variant: 'destructive' });
    } else {
      setTurnos(data);
    }
    setLoading(false);
  }, [selectedLocal, dateRange, toast]);

  useEffect(() => {
    fetchTurnos();
  }, [fetchTurnos]);

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return format(new Date(dateTime), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  return (
    <>
      <Helmet><title>Todos los Turnos - ZasCash</title></Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageTitle title="Todos los Turnos" description={`Historial de turnos para ${selectedLocal?.nombre}`} />
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Filtrar Turnos</CardTitle>
                <CardDescription>Selecciona un rango de fechas para ver los turnos.</CardDescription>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="from">Desde</Label>
                  <Input type="date" id="from" name="from" value={dateRange.from} onChange={handleDateChange} />
                </div>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="to">Hasta</Label>
                  <Input type="date" id="to" name="to" value={dateRange.to} onChange={handleDateChange} />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : turnos.length > 0 ? (
              <div className="space-y-4">
                {turnos.map(turno => (
                  <Card key={turno.id} className="bg-secondary/50">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Turno del {format(new Date(turno.inicio_turno), 'PPP', { locale: es })}</CardTitle>
                           <span className={`mt-1 inline-block px-2 py-1 text-xs rounded-full ${turno.estado === 'cerrado' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                            {turno.estado.charAt(0).toUpperCase() + turno.estado.slice(1)}
                          </span>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/turno/${turno.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{turno.profile?.full_name || 'Empleado no encontrado'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Inicio: {formatDateTime(turno.inicio_turno)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span>Fin: {formatDateTime(turno.fin_turno)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">No se encontraron turnos para el rango de fechas seleccionado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default TodosLosTurnosPage;