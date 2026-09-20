import { useState, useEffect } from 'react';
import { Plus, UserCheck, UserX } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';
import UserForm from '../components/admin/UserForm';
import useRole from '../hooks/useRole';
import { useToast } from '../context/ToastContext';

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', rol: 'consulta', empleado_id: '' });
  const { isAdmin } = useRole();
  const toast = useToast();

  const load = async () => {
    const [u, e] = await Promise.all([api.get('/usuarios'), api.get('/empleados?limit=100')]);
    setUsers(u.data); setEmpleados(e.data); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const body = { ...form };
      if (body.empleado_id) body.empleado_id = parseInt(body.empleado_id);
      else delete body.empleado_id;
      await api.post('/usuarios', body);
      toast.success('Usuario creado');
      setForm({ username: '', password: '', rol: 'consulta', empleado_id: '' });
      setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  if (!isAdmin) return <p className="text-red-500">Solo administradores</p>;
  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <PageHeader title="Administración de Usuarios" action={
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700">
          <Plus size={16} /> Nuevo Usuario</button>
      } />
      {showForm && <UserForm empleados={empleados} form={form} setForm={setForm} onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-4 py-3 border-b"><h2 className="font-semibold text-sm">Usuarios ({users.length})</h2></div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="px-4 py-3">Usuario</th><th>Rol</th><th>Último Acceso</th><th>Estado</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.username}</td>
                <td><Badge value={u.rol} /></td>
                <td className="text-gray-500">{u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleString('es-VE') : 'Nunca'}</td>
                <td>{u.activo ? <span className="text-green-600 flex items-center gap-1"><UserCheck size={14} /> Activo</span> : <span className="text-red-600 flex items-center gap-1"><UserX size={14} /> Inactivo</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
