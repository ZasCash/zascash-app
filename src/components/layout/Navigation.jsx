import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, BarChart3, Package, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { id: 'pos', label: 'Punto de Venta', icon: ShoppingCart },
  { id: 'reports', label: 'Reportes', icon: BarChart3 },
  { id: 'products', label: 'Productos', icon: Package },
  { id: 'settings', label: 'Configuración', icon: Settings }
];

const Navigation = ({ activeTab, setActiveTab }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl p-2 mb-6"
    >
      <div className="flex flex-wrap gap-2">
        {navItems.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              className={`flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Navigation;