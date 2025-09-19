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

const LoginPage = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({
        title: 'Error al iniciar sesión',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: '¡Bienvenido de vuelta!',
      });
      navigate('/select-local');
    }
  };

  return (
    <>
      <Helmet>
        <title>Iniciar Sesión - ZasCash</title>
      </Helmet>
      <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-secondary/40">
        <div className="absolute inset-0 z-0">
          <img  class="w-full h-full object-cover" alt="Interior de un restaurante moderno y elegante" src="https://images.unsplash.com/photo-1684675144506-b181f5209c5a" />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative z-20"
        >
          <Card className="w-full max-w-sm shadow-2xl bg-card/80 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center">
              <Link to="/" className="mx-auto mb-4">
                <Logo />
              </Link>
              <CardTitle className="text-3xl font-bold gradient-text">Iniciar Sesión</CardTitle>
              <CardDescription>Accede a tu cuenta para gestionar tu negocio.</CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
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
                    placeholder="Tu contraseña"
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
                  {loading ? 'Iniciando...' : 'Entrar'}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">O continúa con</span>
                  </div>
                </div>
                <GoogleSignInButton setLoading={setLoading} />
                <p className="text-center text-sm text-muted-foreground">
                  ¿Eres nuevo?{' '}
                  <Button variant="link" asChild className="p-0 h-auto">
                    <Link to="/register">Regístrate como gerente</Link>
                  </Button>
                </p>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;