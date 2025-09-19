import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PiggyBank, CheckCircle, Loader2 } from 'lucide-react';

const IngresosCard = ({ ingresos, setIngresos, onConfirm, isSaving, disabled }) => {
  const totalCaja = useMemo(
    () =>
      (Number(ingresos.efectivo) || 0) +
      (Number(ingresos.tpv) || 0) +
      (Number(ingresos.bizum) || 0),
    [ingresos]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="text-primary" /> Registro de Ingresos
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="efectivo">Efectivo</Label>
          <Input
            id="efectivo"
            type="number"
            placeholder="0.00"
            value={ingresos.efectivo ?? ''}
            onChange={e => setIngresos({ ...ingresos, efectivo: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tpv">TPV (Tarjeta)</Label>
          <Input
            id="tpv"
            type="number"
            placeholder="0.00"
            value={ingresos.tpv ?? ''}
            onChange={e => setIngresos({ ...ingresos, tpv: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bizum">Bizum</Label>
          <Input
            id="bizum"
            type="number"
            placeholder="0.00"
            value={ingresos.bizum ?? ''}
            onChange={e => setIngresos({ ...ingresos, bizum: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label>Total Ingresos del Turno</Label>
          <div className="p-3 h-10 flex items-center bg-secondary rounded-md font-bold text-lg">
            €{totalCaja.toFixed(2)}
          </div>
        </div>
      </CardContent>
      {!disabled && (
        <CardFooter className="justify-end">
          <Button onClick={onConfirm} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Confirmar Ingresos
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default IngresosCard;
