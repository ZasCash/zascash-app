// pages/index.jsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/LoginPage'); // o la ruta que quieras como landing: /mi-negocio, /pos, etc.
  }, [router]);

  return null;
}


