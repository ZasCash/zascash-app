
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

const AddGastoGeneralDialog = ({ localId, proveedores, onGastoAdded }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gastoType, setGastoType] = useState('general');
  const [importe, setImporte] = useState('');
  const [concepto, setConcepto] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (gastoType === 'general' && (!concepto || !importe || !fecha)) {
      toast({ title: 'Campos requeridos', description: 'Concepto, importe y fecha son obligatorios.', variant: 'destructive' });
      return;
    }
    if (gastoType === 'proveedores' && (!proveedorId || !importe || !fecha)) {
      toast({ title: 'Campos requeridos', description: 'Proveedor, importe y fecha son obligatorios.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const gastoData = {
        local_id: localId,
        created_by: user.id,
        importe: parseFloat(importe),
        fecha,
        tipo: 'general',
        concepto: gastoType === 'general' ? concepto : (proveedores.find(p => p.id === proveedorId)?.nombre || 'Gasto proveedor'),
        proveedor_id: gastoType === 'proveedores' ? proveedorId : null,
      };

      const { error } = await supabase.from('gastos').insert(gastoData);
      if (error) throw error;

      toast({ title: 'Gasto registrado con éxito' });
      onGastoAdded();
      setOpen(false);
      setImporte('');
      setConcepto('');
      setProveedorId('');
      setGastoType('general');
      setFecha(format(new Date(), 'yyyy-MM-dd'));
    } catch (error) {
      toast({ title: 'Error al registrar gasto', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setImporte('');
    setConcepto('');
    setProveedorId('');
    setFecha(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><PlusCircle className="mr-2 h-4 w-4" /> Registrar Gasto</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Gasto General</DialogTitle>
          <DialogDescription>Añade un gasto general para el local.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <Label htmlFor="tipo-gasto">Tipo de Gasto</Label>
            <Select value={gastoType} onValueChange={(value) => { setGastoType(value); resetForm(); }}>
              <SelectTrigger id="tipo-gasto">
                <SelectValue placeholder="Selecciona el tipo de gasto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="proveedores">Proveedores</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {gastoType === 'general' && (
            <div>
              <Label htmlFor="concepto-gasto">Concepto</Label>
              <Input id="concepto-gasto" type="text" value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder="Ej: Factura de luz" required />
            </div>
          )}

          {gastoType === 'proveedores' && (
            <div>
              <Label htmlFor="proveedor-gasto">Proveedor</Label>
              <Select value={proveedorId} onValueChange={setProveedorId} required>
                <SelectTrigger id="proveedor-gasto"><SelectValue placeholder="Selecciona un proveedor" /></SelectTrigger>
                <SelectContent>
                  {proveedores.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="importe-gasto">Importe (€)</Label>
            <Input id="importe-gasto" type="number" step="0.01" value={importe} onChange={(e) => setImporte(e.target.value)} placeholder="0.00" required />
          </div>

          <div>
            <Label htmlFor="fecha-gasto">Fecha</Label>
            <Input id="fecha-gasto" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar Gasto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGastoGeneralDialog;
