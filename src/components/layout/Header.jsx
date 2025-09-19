import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { managerNav, employeeNav } from '@/components/layout/Sidebar';
import Logo from '@/components/shared/Logo';

const Header = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const navItems = profile?.role === 'gerente' ? managerNav : employeeNav;

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const renderNavLink = ({ to, icon: Icon, text }) => (
    <NavLink
      key={to}
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-4 rounded-lg px-3 py-2 text-white/80 transition-all hover:text-white',
          isActive && 'bg-black/20 text-white font-semibold'
        )
      }
    >
      <Icon className="h-5 w-5" />
      {text}
    </NavLink>
  );

  return (
    <header className="bg-orange-600 text-white shadow-lg flex items-center justify-between p-4 border-b border-orange-700/50 h-16">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden hover:bg-black/20 text-white">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col bg-orange-600 text-white border-r-0">
            <div className="p-3 border-b border-white/20 mb-4">
              <Link to="/mi-negocio">
                <Logo className="h-10" />
              </Link>
            </div>
            <nav className="grid gap-2 text-lg font-medium">
              {navItems.map(renderNavLink)}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="hidden sm:block">
          <Link to="/mi-negocio">
            <Logo className="h-10" />
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold text-sm">{profile?.full_name}</p>
          <p className="text-xs text-white/80 capitalize">{profile?.role}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-black/20">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;