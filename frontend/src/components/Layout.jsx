import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Building2, Clipboard, Calendar,
  Shield, FileText, LogOut, Settings,
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

const roleColors = {
  admin: 'bg-red-100 text-red-700',
  operador: 'bg-blue-100 text-blue-700',
  consulta: 'bg-gray-100 text-gray-600',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-slate-900 text-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold tracking-wide">SI-GHR</h1>
          <p className="text-xs text-slate-400">Toyotachira S.A.</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }>
              <Icon size={18} />{label}
            </NavLink>
          ))}
          {user?.rol === 'admin' && (
            <NavLink to="/usuarios"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }>
              <Settings size={18} />Usuarios
            </NavLink>
          )}
        </nav>
        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs text-slate-400 truncate">{user?.username}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleColors[user?.rol] || roleColors.consulta}`}>
              {user?.rol}
            </span>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-red-400 w-full">
            <LogOut size={16} /> Salir
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6"><Outlet /></div>
      </main>
    </div>
  );
}
