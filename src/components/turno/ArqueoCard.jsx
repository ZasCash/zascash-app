
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Coins, Edit } from 'lucide-react';

const ArqueoCard = ({ arqueoInicial, arqueoFinal, onOpenModal, isSaving, ingresosConfirmados }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="text-primary" /> Arqueo de Caja
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label>Arqueo Inicial</Label>
          <div className="mt-2">
            {arqueoInicial ? (
              <div className="flex items-center justify-between p-3 bg-secondary rounded-md">
                <span className="font-bold text-lg">€{arqueoInicial.total?.toFixed(2) || '0.00'}</span>
                <Button variant="outline" size="sm" onClick={() => onOpenModal('inicial')}>
                  <Edit className="mr-2 h-4 w-4" /> Ver / Editar
                </Button>
              </div>
            ) : (
              <Button onClick={() => onOpenModal('inicial')} disabled={isSaving}>
                Iniciar Arqueo
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <Label>Arqueo Final</Label>
          <div className="mt-2">
            {arqueoFinal ? (
              <div className="flex items-center justify-between p-3 bg-secondary rounded-md">
                <span className="font-bold text-lg">€{arqueoFinal.total?.toFixed(2) || '0.00'}</span>
                <Button variant="outline" size="sm" onClick={() => onOpenModal('final')}>
                  <Edit className="mr-2 h-4 w-4" /> Ver / Editar
                </Button>
              </div>
            ) : (
              <Button onClick={() => onOpenModal('final')} disabled={isSaving || !ingresosConfirmados}>
                Finalizar Arqueo
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArqueoCard;
