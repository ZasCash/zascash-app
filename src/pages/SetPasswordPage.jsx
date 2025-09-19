import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Logo from '@/components/shared/Logo';

const SetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Supabase magic link for password recovery / invitation sets the session
    // and emits a PASSWORD_RECOVERY event. We listen for that.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          if (session?.user) {
            setEmail(session.user.email);
          }
        }
        // Handle case where link is expired or invalid from the start
        if (location.hash.includes('error_description')) {
            const params = new URLSearchParams(location.hash.substring(1));
            const errorDesc = params.get('error_description');
            setError(errorDesc || 'Enlace inválido o expirado.');
            toast({
                title: 'Error de enlace',
                description: errorDesc || 'El enlace que has usado no es válido o ha expirado. Por favor, solicita uno nuevo.',
                variant: 'destructive',
            });
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [location, toast]);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (!password || !fullName) {
      toast({ title: 'Todos los campos son requeridos', variant: 'destructive' });
      return;
    }
    setLoading(true);

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: { full_name: fullName } // This updates raw_user_meta_data
      });
  
      if (updateError) throw updateError;

      // The handle_new_user trigger should have already created the profile on sign-up.
      // Here we just ensure the full_name is updated if it wasn't set during invite.
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', data.user.id);

      if (profileError) {
        console.warn("Could not update profile name, it might have been set already:", profileError.message);
      }
      
      toast({
        title: '¡Cuenta activada!',
        description: 'Tu perfil ha sido actualizado. Ya puedes iniciar sesión.',
      });
      await supabase.auth.signOut();
      navigate('/login');

    } catch (error) {
       toast({
        title: 'Error al actualizar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (error) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary/40 p-4">
            <Card className="w-full max-w-sm text-center">
                <CardHeader>
                    <CardTitle className="text-destructive">Error</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link to="/login">Volver a Inicio de Sesión</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
  }

  return (
    <>
      <Helmet><title>Configura tu Cuenta - ZasCash</title></Helmet>
      <div className="flex items-center justify-center min-h-screen bg-secondary/40 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-sm shadow-2xl shadow-primary/10">
            <CardHeader className="text-center">
              <Link to="/" className="mx-auto mb-4">
                <Logo />
              </Link>
              <CardTitle className="text-3xl font-bold gradient-text">¡Bienvenido/a!</CardTitle>
              <CardDescription>Completa tu perfil para activar tu cuenta de empleado.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSetPassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} disabled />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input id="fullName" type="text" placeholder="Tu nombre y apellidos" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva Contraseña</Label>
                  <Input id="password" type="password" placeholder="Mínimo 6 caracteres" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading || !password || !fullName || !email}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Guardando...' : 'Activar mi Cuenta'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default SetPasswordPage;