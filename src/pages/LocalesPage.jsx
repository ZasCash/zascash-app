
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import PageTitle from '@/components/shared/PageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Store, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/shared/AlertDialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LocalesPage = ({ selectedLocal, setSelectedLocal }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [locales, setLocales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newLocalName, setNewLocalName] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchLocales = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('locales')
        .select('*')
        .eq('gerente_id', user.id);
      if (error) throw error;
      setLocales(data);
    } catch (error) {
      toast({ title: 'Error al cargar locales', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchLocales();
  }, [fetchLocales]);
  
  const handleCreateLocal = async (e) => {
    e.preventDefault();
    if (!newLocalName.trim()) {
        toast({ title: 'El nombre no puede estar vacío', variant: 'destructive' });
        return;
    }
    setIsCreating(true);
    const { data, error } = await supabase
      .from('locales')
      .insert([{ nombre_local: newLocalName, gerente_id: user.id }])
      .select('id, nombre_local')
      .single();

    if (error) {
      toast({ title: 'Error al crear el local', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '¡Local creado!', description: `El local "${data.nombre_local}" ha sido creado.` });
      setNewLocalName('');
      fetchLocales();
    }
    setIsCreating(false);
  };

  const handleSelectLocal = (local) => {
    setSelectedLocal({ id: local.id, nombre: local.nombre_local });
    toast({ title: `Local cambiado a "${local.nombre_local}"` });
    navigate(`/mi-negocio/${local.id}`);
  };

  const handleDeleteLocal = async (localId) => {
    setDeletingId(localId);
    try {
      // Basic check, RLS should be the main guard
      const localToDelete = locales.find(l => l.id === localId);
      if (localToDelete.gerente_id !== user.id) {
        throw new Error("No tienes permiso para eliminar este local.");
      }

      const { error } = await supabase.from('locales').delete().eq('id', localId);
      if (error) throw error;

      toast({ title: 'Local eliminado con éxito' });
      if (selectedLocal?.id === localId) {
        setSelectedLocal(null);
        navigate('/select-local');
      } else {
        fetchLocales();
      }
    } catch (error) {
      toast({ title: 'Error al eliminar el local', description: error.message, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Helmet><title>Locales - ZasCash</title></Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageTitle title="Gestión de Locales" description="Cambia de local, añade uno nuevo o elimínalo." />
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Mis Locales</CardTitle>
            <CardDescription>Selecciona un local para ver su información o gestionarlos.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : locales.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locales.map(local => (
                  <motion.div key={local.id} whileHover={{ scale: 1.03 }} className="flex flex-col">
                    <Card className={`flex-grow cursor-pointer transition-all ${selectedLocal?.id === local.id ? 'border-primary ring-2 ring-primary' : 'hover:border-primary/50'}`}>
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-4 h-48">
                        <Store className="h-10 w-10 text-primary" />
                        <p className="font-semibold text-lg flex-grow">{local.nombre_local}</p>
                        {selectedLocal?.id === local.id ? (
                          <div className="flex items-center gap-2 text-green-600 font-semibold">
                            <CheckCircle className="h-5 w-5" />
                            <span>Seleccionado</span>
                          </div>
                        ) : (
                          <Button onClick={() => handleSelectLocal(local)}>Seleccionar</Button>
                        )}
                      </CardContent>
                      <CardFooter className="p-2 border-t justify-end">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={deletingId === local.id}>
                               {deletingId === local.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Seguro que quieres eliminar "{local.nombre_local}"?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminarán permanentemente todos los datos asociados a este local (turnos, gastos, etc.).
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteLocal(local.id)} className="bg-destructive hover:bg-destructive/90">
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">No tienes locales registrados.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Añadir Nuevo Local</CardTitle>
                <CardDescription>Crea un nuevo local para tu negocio.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCreateLocal} className="w-full flex flex-col sm:flex-row items-end gap-4">
                   <div className="w-full sm:flex-grow">
                        <Label htmlFor="new-local">Nombre del nuevo local</Label>
                        <Input
                            id="new-local"
                            placeholder="Ej: La Parada Constantina"
                            value={newLocalName}
                            onChange={(e) => setNewLocalName(e.target.value)}
                            disabled={isCreating}
                        />
                   </div>
                   <Button type="submit" disabled={isCreating || !newLocalName.trim()}>
                        {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                        {isCreating ? 'Creando...' : 'Crear Local'}
                    </Button>
                </form>
            </CardContent>
        </Card>

      </motion.div>
    </>
  );
};

export default LocalesPage;
