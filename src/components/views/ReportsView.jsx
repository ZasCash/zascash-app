import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, DollarSign, Receipt, TrendingUp } from 'lucide-react';

const ReportsView = ({ sales, todaysRevenue, todaysSalesCount, averageTicket }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-effect rounded-2xl p-6 text-center">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-fit mx-auto mb-4">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Ingresos Hoy</h3>
          <p className="text-3xl font-bold text-white">€{todaysRevenue.toFixed(2)}</p>
        </div>

        <div className="glass-effect rounded-2xl p-6 text-center">
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full w-fit mx-auto mb-4">
            <Receipt className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Ventas Hoy</h3>
          <p className="text-3xl font-bold text-white">{todaysSalesCount}</p>
        </div>

        <div className="glass-effect rounded-2xl p-6 text-center">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-full w-fit mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Ticket Promedio</h3>
          <p className="text-3xl font-bold text-white">€{averageTicket.toFixed(2)}</p>
        </div>
      </div>

      <div className="glass-effect rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Historial de Ventas
        </h2>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {sales.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/60">No hay ventas registradas</p>
            </div>
          ) : (
            sales.slice().reverse().map((sale) => (
              <div key={sale.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-white font-semibold">Venta #{sale.id}</p>
                    <p className="text-white/70 text-sm">{sale.timestamp}</p>
                  </div>
                  <span className="text-xl font-bold text-white">€{sale.total.toFixed(2)}</span>
                </div>
                <div className="space-y-1">
                  {sale.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-white/80">{item.quantity}x {item.name}</span>
                      <span className="text-white/80">€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ReportsView;