import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import PageTitle from '@/components/shared/PageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/customSupabaseClient';
import { useOutletContext } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/shared/AlertDialog";

const AddProveedorDialog = ({ localId, onProveedorAdded }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('proveedores').insert({ nombre, local_id: localId });
      if (error) throw error;
      toast({ title: 'Proveedor añadido con éxito' });
      onProveedorAdded();
      setOpen(false);
      setNombre('');
    } catch (error) {
      toast({ title: 'Error al añadir proveedor', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><PlusCircle className="mr-2 h-4 w-4" /> Nuevo proveedor</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Proveedor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAdd}>
          <div className="py-4">
            <Label htmlFor="nombre">Nombre del proveedor</Label>
            <Input id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading || !nombre}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Añadir
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ProveedoresPage = () => {
  const { selectedLocal } = useOutletContext();
  const { toast } = useToast();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProveedores = useCallback(async () => {
    if (!selectedLocal) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('proveedores').select('*').eq('local_id', selectedLocal.id).order('nombre');
      if (error) throw error;
      setProveedores(data);
    } catch (error) {
      toast({ title: 'Error al cargar proveedores', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [selectedLocal, toast]);

  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  const handleDelete = async (proveedorId) => {
    setDeletingId(proveedorId);
    try {
      const { error } = await supabase.rpc('delete_proveedor', { proveedor_id_in: proveedorId });
      if (error) throw error;
      toast({ title: 'Proveedor eliminado' });
      fetchProveedores();
    } catch (error) {
      toast({ title: 'Error al eliminar', description: error.message, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Helmet><title>Proveedores - ZasCash</title></Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex justify-between items-center mb-6">
          <PageTitle title="Gestión de Proveedores" description="Añade, edita o elimina los proveedores de tu negocio." />
          {selectedLocal && <AddProveedorDialog localId={selectedLocal.id} onProveedorAdded={fetchProveedores} />}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Lista de Proveedores</CardTitle>
            <CardDescription>Proveedores asociados a {selectedLocal?.nombre}.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : proveedores.length > 0 ? (
              <ul className="space-y-2">
                {proveedores.map(p => (
                  <li key={p.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <span className="font-medium">{p.nombre}</span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={deletingId === p.id}>
                          {deletingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará el proveedor permanentemente. No podrás eliminarlo si tiene gastos asociados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-destructive hover:bg-destructive/90">
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">No hay proveedores registrados. Añade uno para empezar.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default ProveedoresPage;