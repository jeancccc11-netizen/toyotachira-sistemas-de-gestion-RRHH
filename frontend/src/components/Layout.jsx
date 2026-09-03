import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Building2, Clipboard, Calendar, Shield, FileText, LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/empleados', icon: Users, label: 'Empleados' },
  { to: '/departamentos', icon: Building2, label: 'Departamentos' },
  { to: '/examenes', icon: Clipboard, label: 'Exámenes' },
  { to: '/vacaciones', icon: Calendar, label: 'Vacaciones' },
  { to: '/urosalud', icon: Shield, label: 'Urosalud' },
  { to: '/nomina', icon: FileText, label: 'Nómina' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-gray-900 text-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-lg font-bold">SI-GHR</h1>
          <p className="text-xs text-gray-400">Toyotachira S.A.</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`
              }>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-2 truncate">{user?.username} ({user?.rol})</p>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-red-400 w-full">
            <LogOut size={16} /> Salir
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
