import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Building2, Clipboard, Calendar,
  Shield, FileText, LogOut, Settings, Menu,
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
  admin: 'bg-primary-600 text-white',
  operador: 'bg-gray-700 text-white',
  consulta: 'bg-gray-100 text-gray-600',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const handleLogout = () => { logout(); navigate('/login'); };

  // Bloquea el scroll del fondo cuando el menú móvil está abierto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Fondo oscuro al abrir el menú en móvil */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-black text-white flex flex-col flex-shrink-0
          transition-transform duration-200 ease-out lg:static lg:translate-x-0
          ${open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
      >
        <div className="p-4 border-b border-white/10">
          <img src="/logo-toyotachira.png" alt="Toyotachira" className="w-full h-auto rounded bg-white px-1 py-1" />
          <h1 className="text-lg font-bold tracking-wide leading-tight mt-3">SI-GHR</h1>
          <p className="text-xs text-gray-400">Toyotachira S.A.</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={navClass}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
          {user?.rol === 'admin' && (
            <NavLink to="/usuarios" onClick={() => setOpen(false)} className={navClass}>
              <Settings size={18} />Usuarios
            </NavLink>
          )}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs text-gray-400 truncate">{user?.username}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleColors[user?.rol] || roleColors.consulta}`}>
              {user?.rol}
            </span>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-primary-600 w-full">
            <LogOut size={16} /> Salir
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {/* Barra superior solo en móvil/tablet */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 bg-black text-white px-4 py-3 shadow">
          <button type="button" onClick={() => setOpen(true)} aria-label="Abrir menú"
            className="p-1 -ml-1 hover:text-primary-600 transition-colors">
            <Menu size={22} />
          </button>
          <span className="h-6 w-1.5 rounded-full bg-primary-600" aria-hidden="true" />
          <span className="text-sm font-bold tracking-widest">TOYOTA</span>
        </header>

        <div className="p-4 sm:p-6"><Outlet /></div>
      </main>
    </div>
  );
}
