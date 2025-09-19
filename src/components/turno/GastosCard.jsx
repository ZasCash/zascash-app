
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Loader2, FileImage, Camera } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const AddGastoDialog = ({ turnoId, localId, proveedores, onGastoAdded, disabled }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importe, setImporte] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [facturaFile, setFacturaFile] = useState(null);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFacturaFile(event.target.files[0]);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!importe || !proveedorId) {
      toast({ title: 'Campos requeridos', description: 'Importe y proveedor son obligatorios.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      let imageUrl = null;
      if (facturaFile) {
        const fileName = `${Date.now()}_${facturaFile.name}`;
        const filePath = `${localId}/${turnoId}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('facturas').upload(filePath, facturaFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('facturas').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('facturas_caja').insert({
        turno_id: turnoId,
        tipo: 'gasto',
        importe: parseFloat(importe),
        motivo: `Factura de proveedor`,
        metodo_pago: 'efectivo',
        proveedor_id: proveedorId,
        imagen_url: imageUrl,
        fecha: new Date().toISOString(),
      });
      if (error) throw error;

      toast({ title: 'Gasto registrado con éxito' });
      onGastoAdded();
      setOpen(false);
      setImporte('');
      setProveedorId('');
      setFacturaFile(null);
    } catch (error) {
      toast({ title: 'Error al registrar gasto', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}><PlusCircle className="mr-2 h-4 w-4" /> Añadir Gasto</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Gasto desde Caja</DialogTitle>
          <DialogDescription>Añade una factura pagada en metálico durante el turno.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <Label htmlFor="importe-factura">Importe (€)</Label>
            <Input id="importe-factura" type="number" step="0.01" value={importe} onChange={(e) => setImporte(e.target.value)} placeholder="0.00" required />
          </div>
          <div>
            <Label htmlFor="proveedor-factura">Proveedor</Label>
            <Select value={proveedorId} onValueChange={setProveedorId} required>
              <SelectTrigger id="proveedor-factura"><SelectValue placeholder="Selecciona un proveedor" /></SelectTrigger>
              <SelectContent>
                {proveedores.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Imagen del justificante (opcional)</Label>
            <Input id="factura-file" type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
            <div className="flex gap-2 mt-2">
              <Button type="button" variant="outline" onClick={() => { fileInputRef.current.capture = 'environment'; fileInputRef.current.click(); }}>
                <Camera className="mr-2 h-4 w-4" /> Tomar Foto
              </Button>
              <Button type="button" variant="outline" onClick={() => { fileInputRef.current.removeAttribute('capture'); fileInputRef.current.click(); }}>
                <FileImage className="mr-2 h-4 w-4" /> Subir Archivo
              </Button>
            </div>
            {facturaFile && <p className="text-sm text-muted-foreground mt-2">Archivo seleccionado: {facturaFile.name}</p>}
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

const GastosCard = ({ turnoId, localId, proveedores, gastos, onGastoAdded, disabled }) => {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle>Gastos desde Caja</CardTitle>
          <CardDescription>Facturas pagadas en metálico durante el turno.</CardDescription>
        </div>
        <AddGastoDialog turnoId={turnoId} localId={localId} proveedores={proveedores} onGastoAdded={onGastoAdded} disabled={disabled} />
      </CardHeader>
      <CardContent>
        {gastos.length > 0 ? (
          <ul className="space-y-2">
            {gastos.map(g => (
              <li key={g.id} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <p>{g.proveedor?.nombre || 'Proveedor no especificado'}</p>
                <span className="font-bold text-destructive">-€{g.importe.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No hay gastos registrados en este turno.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default GastosCard;
