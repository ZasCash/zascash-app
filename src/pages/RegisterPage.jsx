
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import GoogleSignInButton from '@/components/shared/GoogleSignInButton';

const RegisterPage = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor, completa todos los campos.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);

    const { error } = await signUp(email, password, {
      data: { full_name: fullName, role: 'gerente' },
    });
    
    setLoading(false);

    if (!error) {
      toast({
        title: '¡Registro casi completo!',
        description: 'Hemos enviado un correo de confirmación. Por favor, revisa tu bandeja de entrada para activar tu cuenta.',
      });
      navigate('/login?message=check-email');
    }
  };

  const title = 'Crear Cuenta de Gerente';
  const description = 'Regístrate para empezar a gestionar tu negocio.';

  return (
    <>
      <Helmet>
        <title>{title} - ZasCash</title>
      </Helmet>
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
              <CardTitle className="text-3xl font-bold gradient-text">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Tu nombre y apellidos"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-4">
                <Button variant="action" size="xl" type="submit" className="w-full mt-4" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
                </Button>
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">O regístrate con</span>
                    </div>
                  </div>
                  <GoogleSignInButton setLoading={setLoading} />
                  <p className="text-center text-sm text-muted-foreground">
                    ¿Ya tienes una cuenta?{' '}
                    <Button variant="link" asChild className="p-0 h-auto">
                      <Link to="/login">Inicia sesión</Link>
                    </Button>
                  </p>
                </>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default RegisterPage;
