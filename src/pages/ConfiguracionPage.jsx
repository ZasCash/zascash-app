import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import PageTitle from '@/components/shared/PageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ConfiguracionPage = () => {
  const { toast } = useToast();
  const showToast = () => {
    toast({
      title: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀"
    });
  };

  return (
    <>
      <Helmet><title>Configuración - ZasCash</title></Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageTitle title="Configuración" description="Ajusta los datos de tu negocio y las preferencias de la app." />
        <Card>
          <CardHeader>
            <CardTitle>Datos del Negocio</CardTitle>
            <CardDescription>Modifica la información de tu local principal.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={showToast}>Guardar Cambios</Button>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default ConfiguracionPage;