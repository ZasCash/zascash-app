import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  Briefcase,
  Clock, 
  Store, 
  Users, 
  Receipt, 
  Truck, 
  BarChart2, 
  Settings,
  Calendar
} from 'lucide-react';
import Logo from '@/components/shared/Logo';

export const managerNav = [
  { to: '/mi-negocio', icon: Briefcase, text: 'Mi Negocio' },
  { to: '/mi-turno', icon: Clock, text: 'Mi Turno' },
  { to: '/todos-los-turnos', icon: Calendar, text: 'Todos los turnos' },
  { to: '/locales', icon: Store, text: 'Locales' },
  { to: '/empleados', icon: Users, text: 'Empleados' },
  { to: '/gastos', icon: Receipt, text: 'Gastos' },
  { to: '/proveedores', icon: Truck, text: 'Proveedores' },
  { to: '/informes', icon: BarChart2, text: 'Informes' },
  { to: '/configuracion', icon: Settings, text: 'Configuración' },
];

export const employeeNav = [
  { to: '/mi-turno', icon: Clock, text: 'Mi Turno' },
];

const Sidebar = () => {
  const { profile } = useAuth();
  const navItems = profile?.role === 'gerente' ? managerNav : employeeNav;

  const renderNavLink = ({ to, icon: Icon, text }) => (
    <NavLink
      key={to}
      to={to}
      end={to === '/mi-negocio' || to === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
          isActive && 'bg-primary/10 text-primary'
        )
      }
    >
      <Icon className="h-4 w-4" />
      {text}
    </NavLink>
  );

  return (
    <aside className="hidden w-64 flex-col border-r bg-card p-4 md:flex">
      <div className="p-3 mb-4">
        <Logo className="h-10" />
      </div>
      <div className="flex-1">
        <nav className="grid items-start gap-1 text-sm font-medium">
          {navItems.map(renderNavLink)}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;