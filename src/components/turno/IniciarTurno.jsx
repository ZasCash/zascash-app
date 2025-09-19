import React from 'react';
import PageTitle from '@/components/shared/PageTitle';
import { Button } from '@/components/ui/button';
import { Loader2, PlayCircle } from 'lucide-react';

const IniciarTurno = ({ onIniciar, isSaving }) => {
  return (
    <div className="text-center py-16 flex flex-col items-center justify-center h-full">
      <PageTitle title="Iniciar Turno" description="No tienes ningún turno activo. ¡Empecemos!" />
      <Button size="lg" onClick={onIniciar} disabled={isSaving}>
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
        Iniciar Mi Turno
      </Button>
    </div>
  );
};

export default IniciarTurno;