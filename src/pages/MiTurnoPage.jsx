
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PageTitle from '@/components/shared/PageTitle';
import { Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ArqueoModal from '@/components/shared/ArqueoModal';
import IniciarTurno from '@/components/turno/IniciarTurno';
import ArqueoCard from '@/components/turno/ArqueoCard';
import IngresosCard from '@/components/turno/IngresosCard';
import GastosCard from '@/components/turno/GastosCard';
import TurnoReview from '@/components/turno/TurnoReview';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const MiTurnoPage = ({ selectedLocal }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [view, setView] = useState('loading'); // loading, no_turno, form, review
  const [turno, setTurno] = useState(null);
  const [arqueoInicial, setArqueoInicial] = useState(null);
  const [arqueoFinal, setArqueoFinal] = useState(null);
  const [ingresos, setIngresos] = useState({ efectivo: '', tpv: '', bizum: '' });
  const [gastos, setGastos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [saving, setSaving] = useState(false);
  const [isArqueoModalOpen, setIsArqueoModalOpen] = useState(false);
  const [arqueoModalConfig, setArqueoModalConfig] = useState({});

  const todayFormatted = useMemo(() => {
    const today = new Date();
    return format(today, "eeee, d 'de' LLLL 'de' yyyy", { locale: es });
  }, []);

  const fetchTurnoData = useCallback(async () => {
    if (!user || !selectedLocal) return;
    setView('loading');
    try {
      const { data: turnoData, error: turnoError } = await supabase
        .from('turnos')
        .select('*, arqueo_inicio(*), arqueo_cierre(*), facturas_caja(*, proveedor:proveedores(nombre))')
        .eq('local_id', selectedLocal.id)
        .eq('empleado_id', user.id)
        .eq('estado', 'abierto')
        .order('inicio_turno', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (turnoError) throw turnoError;

      if (turnoData) {
        setTurno(turnoData);
        setArqueoInicial(turnoData.arqueo_inicio?.[0] || null);
        setArqueoFinal(turnoData.arqueo_cierre?.[0] || null);
        setGastos(turnoData.facturas_caja || []);
        setIngresos({
        efectivo: turnoData.total_efectivo?.toString() ?? '',
        tpv: turnoData.total_tpv?.toString() ?? '',
        bizum: turnoData.total_bizum?.toString() ?? '',
        });

        setView('form');
      } else {
        setTurno(null);
        setView('no_turno');
      }

      const { data: provData, error: provError } = await supabase.from('proveedores').select('*').eq('local_id', selectedLocal.id);
      if (provError) throw provError;
      setProveedores(provData || []);

    } catch (error) {
      toast({ title: 'Error al cargar datos del turno', description: error.message, variant: 'destructive' });
      setView('no_turno');
    }
  }, [user, selectedLocal, toast]);

  useEffect(() => { fetchTurnoData(); }, [fetchTurnoData]);

  const handleIniciarTurno = async () => {
    setSaving(true);
    const { error } = await supabase.from('turnos').insert({
      local_id: selectedLocal.id,
      empleado_id: user.id,
      fecha: new Date().toISOString().slice(0, 10),
      inicio_turno: new Date().toISOString(),
      estado: 'abierto',
      estado_ingresos: 'pendiente',
    }).select().single();
    if (error) {
      toast({ title: 'Error al iniciar turno', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Turno iniciado con éxito' });
      await fetchTurnoData();
    }
    setSaving(false);
  };

  const openArqueoModal = (tipo) => {
    setArqueoModalConfig({
      tipo,
      title: `Arqueo ${tipo === 'inicial' ? 'Inicial' : 'Final'} de Caja`,
      description: 'Introduce el número de billetes y monedas.',
      initialData: tipo === 'inicial' ? arqueoInicial?.detalle_arqueo : arqueoFinal?.detalle_arqueo,
      isEditable: turno?.estado === 'abierto',
    });
    setIsArqueoModalOpen(true);
  };

  const handleGuardarArqueo = async (detalle_arqueo) => {
    const { tipo } = arqueoModalConfig;
    const table = tipo === 'inicial' ? 'arqueo_inicio' : 'arqueo_cierre';
    
    setSaving(true);
    try {
      const total = Object.entries(detalle_arqueo).reduce((acc, [key, count]) => {
        const denominationValue = {
          b_500: 500, b_200: 200, b_100: 100, b_50: 50, b_20: 20, b_10: 10, b_5: 5,
          m_2: 2, m_1: 1, m_050: 0.5, m_020: 0.2, m_010: 0.1, m_005: 0.05, m_002: 0.02, m_001: 0.01
        };
        return acc + (denominationValue[key] || 0) * (count || 0);
      }, 0);

      const dataToSave = { turno_id: turno.id, detalle_arqueo, total };
      
      const { error } = await supabase.from(table).upsert(dataToSave, { onConflict: 'turno_id' });

      if (error) throw error;
      toast({ title: `Arqueo ${tipo} guardado` });
      await fetchTurnoData();
      setIsArqueoModalOpen(false);
    } catch (error) {
      toast({ title: `Error al guardar arqueo ${tipo}`, description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmarIngresos = async () => {
    setSaving(true);
    const { error } = await supabase.from('turnos').update({
      total_efectivo: parseFloat(ingresos.efectivo) || 0,
      total_tpv: parseFloat(ingresos.tpv) || 0,
      total_bizum: parseFloat(ingresos.bizum) || 0,
      estado_ingresos: 'confirmado',
    }).eq('id', turno.id);

    if (error) {
      toast({ title: 'Error al confirmar ingresos', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Ingresos confirmados y guardados' });
      await fetchTurnoData();
    }
    setSaving(false);
  };
  
  const handleCerrarTurno = async () => {
  setSaving(true);

  try {
// Guardar solo los importes, sin confirmar ingresos
await supabase.from('turnos').update({
  total_efectivo: parseFloat(ingresos.efectivo) || 0,
  total_tpv: parseFloat(ingresos.tpv) || 0,
  total_bizum: parseFloat(ingresos.bizum) || 0,
}).eq('id', turno.id);


    // 2. Insertar gastos del turno en la tabla gastos (si no existen)
  // 👇 AÑADE ESTO justo antes de mapear gastos
const { data: userData, error: userError } = await supabase.auth.getUser();

if (userError || !userData?.user) {
  console.error("Error obteniendo el usuario:", userError);
  toast.error("No se pudo obtener el usuario. Revisa tu sesión.");
  return;
}

// 👇 ESTE ES EL NUEVO MAP
const gastosAGuardar = gastos.map((g) => {
  const proveedor = proveedores.find((p) => p.id === g.proveedor_id);

  return {
    proveedor_id: g.proveedor_id,
    importe: g.importe,
    concepto: g.concepto || proveedor?.nombre || 'Gasto registrado en turno',
    metodo_pago: 'caja',
    tipo: 'turno',
    turno_id: turno.id,
    fecha: new Date().toISOString(),
    created_by: userData.user.id,
  };
});


    // 3. Cerrar el turno
    const { error: cerrarError } = await supabase.from('turnos').update({
      fin_turno: new Date().toISOString(),
      estado: 'cerrado',
    }).eq('id', turno.id);

    if (cerrarError) throw cerrarError;

    toast({ title: '¡Turno cerrado con éxito!' });
    navigate(`/mi-negocio/${selectedLocal.id}`);
  } catch (error) {
    toast({
      title: 'Error al cerrar el turno',
      description: error.message,
      variant: 'destructive',
    });
  } finally {
    setSaving(false);
  }
};


  const handleReview = () => {
    setView('review');
  };

  if (view === 'loading') return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (view === 'no_turno') return <IniciarTurno onIniciar={handleIniciarTurno} isSaving={saving} />;
  
  if (view === 'review') {
    return (
      <TurnoReview
        turno={turno}
        arqueoInicial={arqueoInicial}
        arqueoFinal={arqueoFinal}
        ingresos={ingresos}
        gastos={gastos}
        onEdit={() => setView('form')}
        onConfirm={handleCerrarTurno}
        isSaving={saving}
      />
    );
  }

  const isTurnoActivo = turno?.estado === 'abierto';
  const areIngresosConfirmados = turno?.estado_ingresos === 'confirmado';

  return (
    <>
      <Helmet><title>Mi Turno - {profile?.full_name}</title></Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <PageTitle title="Mi Turno" description={`Registra la actividad de tu turno en ${selectedLocal?.nombre}.`} />
          <p className="text-muted-foreground mt-1 capitalize">Registro correspondiente al {todayFormatted}</p>
        </div>
        
        <ArqueoCard
          arqueoInicial={arqueoInicial}
          arqueoFinal={arqueoFinal}
          onOpenModal={openArqueoModal}
          isSaving={saving}
          ingresosConfirmados={areIngresosConfirmados}
        />

        <IngresosCard
          ingresos={ingresos}
          setIngresos={setIngresos}
          onConfirm={handleConfirmarIngresos}
          isSaving={saving}
          disabled={!isTurnoActivo}
        />

        <GastosCard
          turnoId={turno.id}
          localId={selectedLocal.id}
          proveedores={proveedores}
          gastos={gastos}
          onGastoAdded={fetchTurnoData}
          disabled={!isTurnoActivo}
        />

        <div className="flex justify-end pt-4">
          <Button variant="action" size="xl" onClick={handleReview} disabled={saving || !isTurnoActivo}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Revisar y Cerrar Turno
          </Button>
        </div>
      </motion.div>
      
      <ArqueoModal
        open={isArqueoModalOpen}
        setOpen={setIsArqueoModalOpen}
        onSave={handleGuardarArqueo}
        saving={saving}
        initialData={arqueoModalConfig.initialData}
        title={arqueoModalConfig.title}
        description={arqueoModalConfig.description}
        isEditable={isTurnoActivo}
      />
    </>
  );
};

export default MiTurnoPage;
