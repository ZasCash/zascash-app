import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  return (
    <>
      <Helmet>
        <title>Bienvenido a ZasCash</title>
      </Helmet>
      <div className="relative h-screen w-full flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="absolute inset-0 w-full h-full object-cover"
            alt="Restaurante con ambiente acogedor"
            src="https://images.unsplash.com/photo-1599458353501-d8cc3a32b4c3" />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center text-center p-4"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 120 }}
          >
            <img
              src="https://storage.googleapis.com/hostinger-horizons-assets-prod/04c6e96a-41b3-44a3-9019-9ff2cd5a435e/e0326b607e912fa947aa3ea060f3781a.png"
              alt="Logo de ZasCash"
              className="w-48 h-auto md:w-64 mb-6"
            />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-shadow-lg">
            Controla tu caja.
            <br />
            <span className="gradient-text">Mejora tu negocio.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/90 mb-8 text-shadow">
            La herramienta definitiva para la gestión de efectivo en hostelería. Simple, potente y siempre a tu lado.
          </p>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Button asChild size="lg" className="text-lg font-bold">
              <Link to="/login">Comenzar</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default LandingPage;