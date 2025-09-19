import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { DollarSign, Receipt, TrendingUp, Loader2, Clock, Users, Truck } from 'lucide-react';
import PageTitle from '@/components/shared/PageTitle';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const QuickAccessCard = ({ title, to, icon: Icon }) => (
  <Link to={to}>
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Card className="hover:bg-primary/5 hover:border-primary/50 transition-all">
        <CardContent className="pt-6 flex flex-col items-center justify-center text-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardContent>
      </Card>
    </motion.div>
  </Link>
);

const DashboardPage = ({ selectedLocal }) => {
  const { toast } = useToast();
  const [stats, setStats] = useState({ ingresos: 0, gastos: 0, margen: 0 });
  const [loading, setLoading] = useState(true);
  
  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = subMonths(today, i);
      options.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy', { locale: es }),
      });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);

  const fetchDashboardData = useCallback(async () => {
    if (!selectedLocal || !selectedMonth) return;
    setLoading(true);
    
    const [year, month] = selectedMonth.split('-').map(Number);

    try {
      const { data, error } = await supabase.rpc('get_monthly_summary', {
        local_id_in: selectedLocal.id,
        year_in: year,
        month_in: month,
      });

      if (error) throw error;

      const summary = data[0] || { total_ingresos: 0, total_gastos: 0 };
      setStats({
        ingresos: summary.total_ingresos,
        gastos: summary.total_gastos,
        margen: summary.total_ingresos - summary.total_gastos,
      });

    } catch (error) {
      toast({ title: "Error al cargar el resumen", description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [selectedLocal, selectedMonth, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    { title: "Ingresos del Mes", value: stats.ingresos, icon: DollarSign },
    { title: "Gastos del Mes", value: stats.gastos, icon: Receipt },
    { title: "Margen Neto", value: stats.margen, icon: TrendingUp },
  ];

  const quickAccessItems = [
    { title: "Mi Turno", to: "/mi-turno", icon: Clock },
    { title: "Empleados", to: "/empleados", icon: Users },
    { title: "Proveedores", to: "/proveedores", icon: Truck },
    { title: "Gastos", to: "/gastos", icon: Receipt },
  ];

  return (
    <>
      <Helmet>
        <title>Mi Negocio - {selectedLocal?.nombre}</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <PageTitle title="Mi Negocio" description={`Resumen financiero de ${selectedLocal?.nombre || 'tu local'}.`} />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Selecciona un mes" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {statCards.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{Number(stat.value).toFixed(2)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div>
          <h3 className="text-xl font-bold mb-4">Accesos Rápidos</h3>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {quickAccessItems.map(item => <QuickAccessCard key={item.to} {...item} />)}
          </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Gráfico de Evolución</CardTitle>
                <CardDescription>Evolución de ingresos y gastos para {monthOptions.find(m => m.value === selectedMonth)?.label}.</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center bg-secondary/30 rounded-lg">
                <p className="text-muted-foreground">🚧 Gráfico en construcción 🚧</p>
            </CardContent>
        </Card>

      </motion.div>
    </>
  );
};

export default DashboardPage;