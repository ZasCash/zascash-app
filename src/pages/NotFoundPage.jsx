import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-9xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Página no encontrada</h2>
      <p className="text-muted-foreground mt-2">Lo sentimos, la página que buscas no existe.</p>
      <Button asChild className="mt-6">
        <Link to="/">Volver al inicio</Link>
      </Button>
    </div>
  );
};

export default NotFoundPage;