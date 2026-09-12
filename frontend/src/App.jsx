import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Empleados from './pages/Empleados';
import EmpleadoForm from './pages/EmpleadoForm';
import EmpleadoDetail from './pages/EmpleadoDetail';
import Departamentos from './pages/Departamentos';
import Examenes from './pages/Examenes';
import Vacaciones from './pages/Vacaciones';
import Urosalud from './pages/Urosalud';
import Nomina from './pages/Nomina';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="empleados" element={<Empleados />} />
          <Route path="empleados/new" element={<EmpleadoForm />} />
          <Route path="empleados/:id/edit" element={<EmpleadoForm />} />
          <Route path="empleados/:id" element={<EmpleadoDetail />} />
          <Route path="departamentos" element={<Departamentos />} />
          <Route path="examenes" element={<Examenes />} />
          <Route path="vacaciones" element={<Vacaciones />} />
          <Route path="urosalud" element={<Urosalud />} />
          <Route path="nomina" element={<Nomina />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
