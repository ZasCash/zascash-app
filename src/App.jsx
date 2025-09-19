
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

import Layout from '@/components/layout/Layout';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import SelectLocalPage from '@/pages/SelectLocalPage';
import DashboardPage from '@/pages/DashboardPage';
import MiTurnoPage from '@/pages/MiTurnoPage';
import TodosLosTurnosPage from '@/pages/TodosLosTurnosPage';
import TurnoDetallePage from '@/pages/TurnoDetallePage';
import LocalesPage from '@/pages/LocalesPage';
import EmpleadosPage from '@/pages/EmpleadosPage';
import GastosPage from '@/pages/GastosPage';
import ProveedoresPage from '@/pages/ProveedoresPage';
import InformesPage from '@/pages/InformesPage';
import ConfiguracionPage from '@/pages/ConfiguracionPage';
import NotFoundPage from '@/pages/NotFoundPage';
import SetPasswordPage from '@/pages/SetPasswordPage';
import { supabase } from '@/lib/customSupabaseClient';

const ProtectedRoute = ({ children, roles }) => {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
      return (
      <div className="flex items-center justify-center h-screen bg-secondary/40">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (profile && profile.role === 'empleado' && window.location.pathname !== '/mi-turno' && window.location.pathname !== '/select-local') {
    return <Navigate to="/mi-turno" replace />;
  }

  if (profile === null && user) {
    return <Navigate to="/select-local" replace />;
  }

  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to="/mi-turno" replace />;
  }
  
  return children;
};

const AppLayout = ({ selectedLocal, setSelectedLocal }) => (
  <ProtectedRoute>
    <Layout selectedLocal={selectedLocal} setSelectedLocal={setSelectedLocal}>
      <Outlet context={{ selectedLocal, setSelectedLocal }} />
    </Layout>
  </ProtectedRoute>
);

const ManagerRoute = ({ children }) => (
  <ProtectedRoute roles={['gerente']}>{children}</ProtectedRoute>
);

const AuthRedirect = () => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (profile) {
        navigate('/select-local');
      }
    }
  }, [profile, loading, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-secondary/40">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
    </div>
  );
};

function App() {
  const { user, loading } = useAuth();
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
         navigate('/set-password');
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const type = searchParams.get('type');
    const error = searchParams.get('error_description');
    if (type === 'recovery' && error) {
      toast({
        title: 'Error',
        description: 'El enlace de recuperación ha expirado o no es válido.',
        variant: 'destructive',
      });
    }
  }, [searchParams, toast]);

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
        <title>ZasCash - Control de Caja</title>
        <meta name="description" content="Control de caja para hostelería." />
      </Helmet>
      <Routes>
        <Route path="/" element={!user ? <LandingPage /> : <AuthRedirect />} />
        <Route path="/login" element={!user ? <LoginPage /> : <AuthRedirect />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <AuthRedirect />} />
        <Route path="/set-password" element={<SetPasswordPage />} />

        <Route path="/select-local" element={
          <ProtectedRoute>
            <SelectLocalPage setSelectedLocal={setSelectedLocal} />
          </ProtectedRoute>
        } />

        <Route element={<AppLayout selectedLocal={selectedLocal} setSelectedLocal={setSelectedLocal} />}>
          <Route path="/mi-negocio/:localId?" element={
            <ManagerRoute>
              {selectedLocal ? <DashboardPage selectedLocal={selectedLocal} /> : <Navigate to="/select-local" />}
            </ManagerRoute>
          } />
          <Route path="/mi-turno" element={selectedLocal ? <MiTurnoPage selectedLocal={selectedLocal} /> : <Navigate to="/select-local" />} />
          <Route path="/todos-los-turnos" element={
            <ManagerRoute>
              {selectedLocal ? <TodosLosTurnosPage selectedLocal={selectedLocal} /> : <Navigate to="/select-local" />}
            </ManagerRoute>
          } />
           <Route path="/turno/:id" element={
            <ManagerRoute>
              {selectedLocal ? <TurnoDetallePage /> : <Navigate to="/select-local" />}
            </ManagerRoute>
          } />
          <Route path="/locales" element={
            <ManagerRoute>
              <LocalesPage selectedLocal={selectedLocal} setSelectedLocal={setSelectedLocal} />
            </ManagerRoute>
          } />
          <Route path="/empleados" element={<ManagerRoute>{selectedLocal ? <EmpleadosPage selectedLocal={selectedLocal} /> : <Navigate to="/select-local" />}</ManagerRoute>} />
          <Route path="/gastos" element={<ManagerRoute>{selectedLocal ? <GastosPage /> : <Navigate to="/select-local" />}</ManagerRoute>} />
          <Route path="/proveedores" element={<ManagerRoute>{selectedLocal ? <ProveedoresPage /> : <Navigate to="/select-local" />}</ManagerRoute>} />
          <Route path="/informes" element={<ManagerRoute>{selectedLocal ? <InformesPage selectedLocal={selectedLocal} /> : <Navigate to="/select-local" />}</ManagerRoute>} />
          <Route path="/configuracion" element={<ManagerRoute>{selectedLocal ? <ConfiguracionPage /> : <Navigate to="/select-local" />}</ManagerRoute>} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
