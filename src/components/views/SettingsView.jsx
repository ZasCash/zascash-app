import React from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SettingsView = ({ onClearData, toast }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl p-6"
    >
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Settings className="h-6 w-6" />
        Configuración
      </h2>
      
      <div className="space-y-6">
        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-3">Datos del Negocio</h3>
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/20"
              onClick={() => toast({
                title: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀"
              })}
            >
              Configurar información del restaurante
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/20"
              onClick={() => toast({
                title: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀"
              })}
            >
              Gestionar usuarios y permisos
            </Button>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-3">Datos y Backup</h3>
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/20"
              onClick={() => toast({
                title: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀"
              })}
            >
              Exportar datos de ventas
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/20"
              onClick={onClearData}
            >
              Limpiar todos los datos
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsView;