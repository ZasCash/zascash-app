import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, PiggyBank, Receipt, User, Calendar as CalendarIcon, Image as ImageIcon, Eye, Landmark, Wallet, Smartphone, ArrowRight, Minus } from 'lucide-react';
import PageTitle from '@/components/shared/PageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ArqueoModal from '@/components/shared/ArqueoModal';

const DetalleItem = ({ label, value, icon: Icon, isCurrency = true }) => (
  <div className="flex items-start gap-3">
    <Icon className="h-5 w-5 text-primary mt-1" />
    <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-bold text-lg">{isCurrency ? `€${Number(value || 0).toFixed(2)}` : value}</p>
    </div>
  </div>
);

const ArqueoDisplayCard = ({ title, arqueo, onOpenModal }) => {
  if (!arqueo) {
    return (
      <Card>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No registrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
            <span>{title}</span>
            <span className="text-2xl font-bold gradient-text">€{arqueo.total?.toFixed(2) || '0.00'}</span>
        </CardTitle>
      </CardHeader>
      <CardFooter>
          <Button variant="outline" className="w-full" onClick={onOpenModal}>
            <Eye className="mr-2 h-4 w-4" /> Ver Detalle
          </Button>
      </CardFooter>
    </Card>
  );
};

const TurnoDetallePage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [turno, setTurno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isArqueoModalOpen, setIsArqueoModalOpen] = useState(false);
  const [arqueoModalConfig, setArqueoModalConfig] = useState({});

  const totalIngresos = useMemo(() => {
    if (!turno) return 0;
    return (Number(turno.total_efectivo) || 0) + (Number(turno.total_tpv) || 0) + (Number(turno.total_bizum) || 0);
  }, [turno]);

  const totalGastos = useMemo(() => {
    if (!turno?.facturas_caja) return 0;
    return turno.facturas_caja.reduce((acc, g) => acc + (Number(g.importe) || 0), 0);
  }, [turno]);
  
  const cajaNeta = useMemo(() => totalIngresos - totalGastos, [totalIngresos, totalGastos]);

  const fetchTurnoDetalle = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('turnos')
        .select('*, profile:empleado_id(full_name), arqueo_inicio(*), arqueo_cierre(*), facturas_caja(*, proveedor:proveedores(nombre))')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTurno(data);
    } catch (error) {
      toast({ title: 'Error al cargar el detalle del turno', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchTurnoDetalle();
  }, [fetchTurnoDetalle]);

  const openArqueoModal = (tipo, arqueoData) => {
    setArqueoModalConfig({
        tipo,
        title: `Detalle Arqueo ${tipo === 'inicial' ? 'Inicial' : 'Final'}`,
        description: 'Desglose de billetes y monedas registrado.',
        initialData: arqueoData?.detalle_arqueo,
        isEditable: false,
    });
    setIsArqueoModalOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  if (!turno) {
    return <div className="text-center">No se encontró el turno.</div>;
  }

const arqueoInicial = turno.arqueo_inicio;
const arqueoFinal = turno.arqueo_cierre;


  return (
    <>
      <Helmet><title>Detalle del Turno - ZasCash</title></Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon"><Link to="/todos-los-turnos"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <PageTitle title="Detalle del Turno" description={`Resumen del turno del ${format(new Date(turno.inicio_turno), 'PPP', { locale: es })}`} />
        </div>

        <Card className="border-2 border-primary/50 shadow-lg shadow-primary/10">
          <CardHeader>
              <CardTitle className="text-center text-lg">Caja Neta del Turno</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
              <div className="flex items-center justify-center gap-4 text-2xl font-bold">
                  <span>€{totalIngresos.toFixed(2)}</span>
                  <Minus className="h-6 w-6 text-muted-foreground" />
                  <span>€{totalGastos.toFixed(2)}</span>
                  <ArrowRight className="h-6 w-6 text-primary" />
                  <span className="text-4xl gradient-text">€{cajaNeta.toFixed(2)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">(Total Ingresos - Total Gastos)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <DetalleItem label="Empleado" value={turno.profile?.full_name || 'N/A'} icon={User} isCurrency={false} />
            <DetalleItem label="Inicio" value={format(new Date(turno.inicio_turno), 'dd/MM/yy HH:mm', { locale: es })} icon={CalendarIcon} isCurrency={false} />
            <DetalleItem label="Fin" value={turno.fin_turno ? format(new Date(turno.fin_turno), 'dd/MM/yy HH:mm', { locale: es }) : 'En curso'} icon={CalendarIcon} isCurrency={false} />
          </CardContent>
        </Card>
        
        <div className="grid lg:grid-cols-2 gap-6">
            <ArqueoDisplayCard title="Arqueo Inicial" arqueo={arqueoInicial} onOpenModal={() => openArqueoModal('inicial', arqueoInicial)} />
            <ArqueoDisplayCard title="Arqueo Final" arqueo={arqueoFinal} onOpenModal={() => openArqueoModal('final', arqueoFinal)} />
        </div>

        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><PiggyBank className="text-primary" />Ingresos Registrados</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DetalleItem label="Efectivo" value={turno.total_efectivo} icon={Wallet} />
              <DetalleItem label="TPV" value={turno.total_tpv} icon={Landmark} />
              <DetalleItem label="Bizum" value={turno.total_bizum} icon={Smartphone} />
              <div className="md:col-span-2 lg:col-span-1 flex items-center justify-center bg-secondary rounded-lg p-4">
                 <div>
                    <p className="text-sm text-muted-foreground text-center">Total Ingresos</p>
                    <p className="font-bold text-2xl text-center">€{Number(totalIngresos || 0).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Receipt className="text-primary" />Gastos desde Caja</CardTitle></CardHeader>
          <CardContent>
            {turno.facturas_caja.length > 0 ? (
              <ul className="space-y-2">
                {turno.facturas_caja.map(g => (
                  <li key={g.id} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">{g.proveedor?.nombre || 'Gasto'}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(g.fecha), 'dd/MM/yy HH:mm')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {g.imagen_url && (
                        <Button asChild variant="outline" size="icon">
                          <a href={g.imagen_url} target="_blank" rel="noopener noreferrer">
                            <ImageIcon className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <span className="font-bold text-destructive text-lg">-€{g.importe.toFixed(2)}</span>
                    </div>
                  </li>
                ))}
                 <li className="flex justify-between font-bold pt-2 border-t mt-2">
                  <span>Total Gastos</span>
                  <span>-€{totalGastos.toFixed(2)}</span>
                </li>
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No hubo gastos en este turno.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
      <ArqueoModal
        open={isArqueoModalOpen}
        setOpen={setIsArqueoModalOpen}
        title={arqueoModalConfig.title}
        description={arqueoModalConfig.description}
        initialData={arqueoModalConfig.initialData}
        isEditable={false}
      />
    </>
  );
};

export default TurnoDetallePage;