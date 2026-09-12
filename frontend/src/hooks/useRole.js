import { useAuth } from '../context/AuthContext';

const ROLE_HIERARCHY = { admin: 3, operador: 2, consulta: 1 };

export default function useRole() {
  const { user } = useAuth();
  const rol = user?.rol || 'consulta';
  const level = ROLE_HIERARCHY[rol] || 1;

  return {
    rol,
    isAdmin: rol === 'admin',
    isOperador: level >= 2,
    canWrite: level >= 2,
    canDelete: level >= 3,
    minRole: (required) => level >= (ROLE_HIERARCHY[required] || 1),
  };
}
