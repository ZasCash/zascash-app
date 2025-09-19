import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import PageTitle from '@/components/shared/PageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const InformesPage = () => {
  return (
    <>
      <Helmet><title>Informes - ZasCash</title></Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageTitle title="Informes y Estadísticas" description="Visualiza la evolución de tu negocio." />
        <Card>
          <CardHeader>
            <CardTitle>Evolución Mensual</CardTitle>
            <CardDescription>Aquí verás gráficos sobre tus ingresos, gastos y márgenes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-8 text-center h-64 flex items-center justify-center bg-secondary/30">
              <p className="text-muted-foreground">🚧 Gráficos en construcción 🚧</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default InformesPage;