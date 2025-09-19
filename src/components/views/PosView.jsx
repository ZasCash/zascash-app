import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ShoppingCart, Plus, Minus, Trash2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { iconMap } from '@/lib/icons';

const PosView = ({ products, addToCart, cart, updateQuantity, removeFromCart, total, completeSale }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Package className="h-6 w-6" />
            Productos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map((product) => {
              const IconComponent = iconMap[product.icon];
              return (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 card-hover cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                      {IconComponent && <IconComponent className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{product.name}</h3>
                      <p className="text-sm text-white/70">{product.category}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">€{product.price.toFixed(2)}</span>
                    <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-effect rounded-2xl p-6 sticky top-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Carrito
          </h2>
          
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/10 rounded-lg p-3 border border-white/20"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-white text-sm">{item.name}</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-6 w-6 p-0 text-white hover:bg-white/20"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-6 w-6 p-0 text-white hover:bg-white/20"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="text-white font-bold">€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {cart.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/60">Carrito vacío</p>
            </div>
          )}

          <div className="border-t border-white/20 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold text-white">Total:</span>
              <span className="text-2xl font-bold text-white">€{total.toFixed(2)}</span>
            </div>
            <Button
              onClick={completeSale}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3"
              disabled={cart.length === 0}
            >
              <Receipt className="h-5 w-5 mr-2" />
              Completar Venta
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PosView;