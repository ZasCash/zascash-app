import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import PageTitle from '@/components/shared/PageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Mail, Clock, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/shared/AlertDialog";

const InviteEmployeeDialog = ({ selectedLocal, onInvitationSent }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email || !selectedLocal?.id) {
        toast({ title: 'Error', description: 'No se ha seleccionado un local válido.', variant: 'destructive' });
        return;
    }
    setLoading(true);

    try {
      const response = await supabase.functions.invoke('invite-employee', {
        body: JSON.stringify({
          email: email,
          local_id: selectedLocal.id,
        }),
      });

      if (response.error) throw new Error(response.error.message);
      
      const responseData = response.data;
      if (responseData.error) {
        throw new Error(responseData.error);
      }
      
      toast({
        title: '✅ ¡Invitación enviada!',
        description: `Invitación enviada correctamente a ${email}. El empleado podrá completar su registro desde el enlace recibido.`,
      });
      onInvitationSent();
      setOpen(false);
      setEmail('');
    } catch (error) {
      toast({
        title: 'Error al invitar',
        description: error.message || 'Ocurrió un error inesperado. Revisa la consola para más detalles.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><PlusCircle className="mr-2 h-4 w-4" /> Invitar nuevo empleado</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar Nuevo Empleado</DialogTitle>
          <DialogDescription>
            Introduce el email del empleado para enviarle una invitación y que pueda unirse a tu local: {selectedLocal?.nombre_local || ''}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite}>
          <div className="py-4">
            <Label htmlFor="email">Email del empleado</Label>
            <Input
              id="email"
              type="email"
              placeholder="empleado@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading || !email}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Invitación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EmpleadosPage = ({ selectedLocal }) => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchEmployeesAndInvitations = useCallback(async () => {
    if (!selectedLocal) return;
    setLoading(true);
    
    const { data: employeesData, error: employeesError } = await supabase
      .from('profiles')
      .select('id, full_name, role, email')
      .eq('local_id', selectedLocal.id);

    if (employeesError) toast({ title: 'Error', description: 'No se pudieron cargar los empleados.', variant: 'destructive' });
    else setEmployees(employeesData.filter(e => e.role === 'empleado'));

    const { data: invitationsData, error: invitationsError } = await supabase
      .from('invitaciones')
      .select('*')
      .eq('local_id', selectedLocal.id)
      .eq('estado', 'pendiente');
    
    if (invitationsError) toast({ title: 'Error', description: 'No se pudieron cargar las invitaciones.', variant: 'destructive' });
    else setInvitations(invitationsData);

    setLoading(false);
  }, [selectedLocal, toast]);

  useEffect(() => {
    fetchEmployeesAndInvitations();
  }, [fetchEmployeesAndInvitations]);

  const handleDelete = async (id, type) => {
    setDeletingId(id);
    try {
      const functionName = type === 'employee' ? 'delete-employee' : 'delete-invitation';
      const body = type === 'employee' ? { user_id_to_delete: id } : { invitation_id_to_delete: id };
      
      const { error } = await supabase.functions.invoke(functionName, { body: JSON.stringify(body) });

      if (error) throw new Error(error.message);
      toast({ title: `${type === 'employee' ? 'Empleado' : 'Invitación'} eliminado/a`, description: `Se ha eliminado correctamente.` });
      fetchEmployeesAndInvitations();
    } catch (error) {
      toast({ title: 'Error al eliminar', description: error.message || 'Ocurrió un error inesperado.', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Helmet><title>Empleados - ZasCash</title></Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex justify-between items-center mb-6">
          <PageTitle title="Gestión de Empleados" description={`Gestiona el personal de ${selectedLocal?.nombre_local || 'tu local'}.`} />
          {selectedLocal && <InviteEmployeeDialog selectedLocal={selectedLocal} onInvitationSent={fetchEmployeesAndInvitations} />}
        </div>
        
        {loading ? <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Equipo Actual</CardTitle>
                <CardDescription>Empleados activos en este local.</CardDescription>
              </CardHeader>
              <CardContent>
                {employees.length > 0 ? (
                  <ul className="space-y-2">
                    {employees.map(emp => (
                      <li key={emp.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                        <div className="flex flex-col">
                          <span className="font-medium">{emp.full_name}</span>
                          <span className="text-sm text-muted-foreground">{emp.email}</span>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={deletingId === emp.id}>
                              {deletingId === emp.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Seguro que quieres eliminar a este empleado?</AlertDialogTitle>
                              <AlertDialogDescription>Esta acción es irreversible. Se eliminará el empleado y se revocará su acceso permanentemente.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(emp.id, 'employee')} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="border rounded-lg p-8 text-center"><p className="text-muted-foreground">No tienes empleados registrados.</p></div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invitaciones Pendientes</CardTitle>
                <CardDescription>Invitaciones enviadas que aún no han sido aceptadas.</CardDescription>
              </CardHeader>
              <CardContent>
                {invitations.length > 0 ? (
                  <ul className="space-y-2">
                    {invitations.map(inv => (
                      <li key={inv.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{inv.email_destinatario}</span>
                        </div>
                         <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground"><Clock className="inline h-4 w-4 mr-1" />Pendiente</span>
                          <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={deletingId === inv.id}>
                              {deletingId === inv.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Seguro que quieres eliminar esta invitación?</AlertDialogTitle>
                              <AlertDialogDescription>El usuario no podrá registrarse con este enlace. Podrás invitarlo de nuevo más tarde.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(inv.id, 'invitation')} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="border rounded-lg p-8 text-center"><p className="text-muted-foreground">No hay invitaciones pendientes.</p></div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default EmpleadosPage;