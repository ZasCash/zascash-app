import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const denominations = [
  { value: 500, type: 'b_500', label: '500€' }, { value: 200, type: 'b_200', label: '200€' },
  { value: 100, type: 'b_100', label: '100€' }, { value: 50, type: 'b_50', label: '50€' },
  { value: 20, type: 'b_20', label: '20€' }, { value: 10, type: 'b_10', label: '10€' },
  { value: 5, type: 'b_5', label: '5€' }, { value: 2, type: 'm_2', label: '2€' },
  { value: 1, type: 'm_1', label: '1€' }, { value: 0.50, type: 'm_050', label: '0.50€' },
  { value: 0.20, type: 'm_020', label: '0.20€' }, { value: 0.10, type: 'm_010', label: '0.10€' },
  { value: 0.05, type: 'm_005', label: '0.05€' }, { value: 0.02, type: 'm_002', label: '0.02€' },
  { value: 0.01, type: 'm_001', label: '0.01€' },
];

const ArqueoDetalle = ({ title, detalle, total }) => {
  if (!detalle) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No hay datos de arqueo disponibles.</p>
        </CardContent>
      </Card>
    );
  }

  const hasEntries = Object.values(detalle).some(val => val > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasEntries ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
            {denominations.filter(d => detalle[d.type] > 0).map(d => (
              <div key={d.type} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{d.label} x {detalle[d.type]}</span>
                <span className="font-medium">€{(d.value * detalle[d.type]).toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No se registraron billetes ni monedas.</p>
        )}
        <div className="border-t mt-4 pt-4 flex justify-between items-center">
          <span className="font-bold">Total</span>
          <span className="font-bold text-xl text-primary">€{Number(total || 0).toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArqueoDetalle;