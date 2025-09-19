
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageTitle from '@/components/shared/PageTitle';
import { Edit, CheckCircle, Loader2, ArrowLeft, ArrowRight, Minus } from 'lucide-react';

const TurnoReview = ({ turno, arqueoInicial, arqueoFinal, ingresos, gastos, onEdit, onConfirm, isSaving }) => {
  const totalIngresos = useMemo(() =>
    (Number(ingresos.efectivo) || 0) + (Number(ingresos.tpv) || 0) + (Number(ingresos.bizum) || 0),
    [ingresos]
  );

  const totalGastos = useMemo(() =>
    gastos.reduce((acc, g) => acc + (Number(g.importe) || 0), 0),
    [gastos]
  );

  const cajaNeta = useMemo(() => totalIngresos - totalGastos, [totalIngresos, totalGastos]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onEdit}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageTitle title="Revisar y Confirmar Turno" description="Comprueba que todos los datos son correctos antes de cerrar." />
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
        <CardHeader><CardTitle>Resumen del Turno</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-muted-foreground">Arqueo Inicial</p><p className="font-bold text-lg">€{arqueoInicial?.total?.toFixed(2) || '0.00'}</p></div>
            <div><p className="text-muted-foreground">Arqueo Final</p><p className="font-bold text-lg">€{arqueoFinal?.total?.toFixed(2) || '0.00'}</p></div>
            <div><p className="text-muted-foreground">Ingresos Efectivo</p><p className="font-bold text-lg">€{Number(ingresos.efectivo).toFixed(2)}</p></div>
            <div><p className="text-muted-foreground">Ingresos TPV</p><p className="font-bold text-lg">€{Number(ingresos.tpv).toFixed(2)}</p></div>
            <div><p className="text-muted-foreground">Ingresos Bizum</p><p className="font-bold text-lg">€{Number(ingresos.bizum).toFixed(2)}</p></div>
            <div><p className="font-bold text-primary">Total Ingresos</p><p className="font-bold text-lg text-primary">€{totalIngresos.toFixed(2)}</p></div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Gastos desde Caja ({gastos.length})</h4>
            {gastos.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {gastos.map(f => (
                  <li key={f.id} className="flex justify-between">
                    <span>{f.proveedor?.nombre || 'Proveedor'}</span>
                    <span>-€{f.importe.toFixed(2)}</span>
                  </li>
                ))}
                <li className="flex justify-between font-bold pt-2 border-t text-destructive">
                  <span>Total Gastos</span>
                  <span>-€{totalGastos.toFixed(2)}</span>
                </li>
              </ul>
            ) : <p className="text-sm text-muted-foreground">Ninguno.</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="outline" onClick={onEdit}><Edit className="mr-2 h-4 w-4" /> Editar Datos</Button>
          <Button variant="action" size="lg" onClick={onConfirm} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Confirmar y Cerrar Turno
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default TurnoReview;
