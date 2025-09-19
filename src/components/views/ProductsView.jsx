import React from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { iconMap } from '@/lib/icons';

const ProductsView = ({ products, toast }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="h-6 w-6" />
          Gestión de Productos
        </h2>
        <Button
          onClick={() => toast({
            title: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀"
          })}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Añadir Producto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const IconComponent = iconMap[product.icon];
          return (
            <div key={product.id} className="bg-white/10 rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  {IconComponent && <IconComponent className="h-5 w-5 text-white" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{product.name}</h3>
                  <p className="text-sm text-white/70">{product.category}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-white">€{product.price.toFixed(2)}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toast({
                      title: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀"
                    })}
                    className="text-white hover:bg-white/20"
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toast({
                      title: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀"
                    })}
                    className="text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ProductsView;