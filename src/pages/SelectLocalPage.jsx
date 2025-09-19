import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Loader2, PlusCircle, Store } from 'lucide-react';

const SelectLocalPage = ({ setSelectedLocal }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [locales, setLocales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLocalName, setNewLocalName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const handleUserFlow = async () => {
      if (!user || !profile) return;

      setLoading(true);

      if (profile.role === 'empleado') {
        if (profile.local_id) {
          const { data: local, error } = await supabase
            .from('locales')
            .select('id, nombre_local')
            .eq('id', profile.local_id)
            .single();
          
          if (error) {
            toast({ title: 'Error', description: 'No se pudo cargar tu local asignado.', variant: 'destructive' });
            setLoading(false);
          } else {
            setSelectedLocal({ id: local.id, nombre: local.nombre_local });
            navigate('/mi-turno');
          }
        } else {
          toast({ title: 'Sin local', description: 'No estás asignado a ningún local. Contacta a tu gerente.', variant: 'destructive' });
          setLoading(false);
        }
      } else if (profile.role === 'gerente') {
        const { data, error } = await supabase
          .from('locales')
          .select('id, nombre_local')
          .eq('gerente_id', user.id);
        
        if (error) {
          toast({ title: 'Error al cargar locales', description: error.message, variant: 'destructive' });
        } else {
          setLocales(data.map(l => ({ id: l.id, nombre: l.nombre_local })));
        }
        setLoading(false);
      }
    };

    handleUserFlow();
  }, [user, profile, toast, navigate, setSelectedLocal]);

  const handleSelectLocal = (local) => {
    setSelectedLocal(local);
    navigate('/mi-negocio');
  };

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
      const newLocalData = { id: data.id, nombre: data.nombre_local };
      setLocales([...locales, newLocalData]);
      setNewLocalName('');
      if (locales.length === 0) {
        handleSelectLocal(newLocalData);
      }
    }
    setIsCreating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary/40">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Seleccionar Local - ZasCash</title>
      </Helmet>
      <div className="flex items-center justify-center min-h-screen bg-secondary/40 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl"
        >
          <Card className="shadow-2xl shadow-primary/10">
            <CardHeader>
              <CardTitle className="text-3xl font-bold gradient-text">Selecciona tu Local</CardTitle>
              <CardDescription>Elige el local con el que quieres trabajar hoy.</CardDescription>
            </CardHeader>
            <CardContent>
              {locales.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {locales.map((local) => (
                    <motion.div
                      key={local.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-24 text-lg flex flex-col gap-2"
                        onClick={() => handleSelectLocal(local)}
                      >
                        <Store className="h-6 w-6 text-primary" />
                        <span>{local.nombre}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Parece que aún no has creado ningún local.</p>
                  <p className="text-muted-foreground">¡Crea uno para empezar a gestionar tu negocio!</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
                <form onSubmit={handleCreateLocal} className="w-full flex flex-col sm:flex-row items-center gap-4 pt-4 border-t">
                   <div className="w-full sm:flex-grow">
                        <Label htmlFor="new-local" className="sr-only">Nombre del nuevo local</Label>
                        <Input
                            id="new-local"
                            placeholder="Nombre de tu nuevo local"
                            value={newLocalName}
                            onChange={(e) => setNewLocalName(e.target.value)}
                            disabled={isCreating}
                        />
                   </div>
                   <Button type="submit" disabled={isCreating || !newLocalName.trim()} className="w-full sm:w-auto">
                        {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                        {isCreating ? 'Creando...' : 'Crear Local'}
                    </Button>
                </form>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default SelectLocalPage;