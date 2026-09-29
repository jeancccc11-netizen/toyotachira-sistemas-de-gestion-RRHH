import { useState, useEffect } from 'react';
import { Plus, UserCheck, UserX, Pencil, KeyRound, Trash2, Power } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import UserForm from '../components/admin/UserForm';
import useRole from '../hooks/useRole';
import { useAuth } from '../context/AuthContext';
import useConfirm from '../hooks/useConfirm';
import { useToast } from '../context/ToastContext';

const emptyForm = { username: '', password: '', rol: 'consulta', empleado_id: '', activo: true };

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState(null); // null | 'crear' | 'editar' | 'password'
  const [editUser, setEditUser] = useState(null);
  const { isAdmin } = useRole();
  const { user } = useAuth();
  const toast = useToast();
  const { confirm, state: cs, handleConfirm, handleCancel } = useConfirm();

  const load = async () => {
    try {
      const [u, e] = await Promise.all([api.get('/usuarios'), api.get('/empleados?limit=100')]);
      setUsers(u.data); setEmpleados(e.data);
    } catch {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const closeForm = () => { setMode(null); setEditUser(null); setForm(emptyForm); };
  const openCreate = () => { setForm(emptyForm); setEditUser(null); setMode('crear'); };
  const openEdit = (u) => {
    setEditUser(u);
    setForm({ username: u.username, password: '', rol: u.rol, empleado_id: u.empleado_id || '', activo: !!u.activo });
    setMode('editar');
  };
  const openPassword = (u) => { setEditUser(u); setForm({ ...emptyForm, username: u.username }); setMode('password'); };

  const handleCreate = async () => {
    const body = { ...form };
    if (body.empleado_id) body.empleado_id = parseInt(body.empleado_id);
    else delete body.empleado_id;
    await api.post('/usuarios', body);
    toast.success('Usuario creado');
    closeForm(); load();
  };

  const handleUpdate = async () => {
    const body = {
      username: form.username,
      rol: form.rol,
      empleado_id: form.empleado_id ? parseInt(form.empleado_id) : null,
      activo: !!form.activo,
    };
    await api.put(`/usuarios/${editUser.id}`, body);
    toast.success('Usuario actualizado');
    closeForm(); load();
  };

  const handlePassword = async () => {
    await api.put(`/usuarios/${editUser.id}/password`, { password: form.password });
    toast.success('Contraseña actualizada');
    closeForm();
  };

  const handleSubmit = (e) => {
    if (mode === 'crear') return handleCreate(e);
    if (mode === 'editar') return handleUpdate(e);
    if (mode === 'password') return handlePassword(e);
  };

  const toggleActivo = async (u) => {
    const ok = await confirm(`¿${u.activo ? 'Desactivar' : 'Activar'} al usuario ${u.username}?`);
    if (!ok) return;
    try {
      await api.put(`/usuarios/${u.id}/toggle`, { activo: !u.activo });
      toast.success(u.activo ? 'Usuario desactivado' : 'Usuario activado');
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (u) => {
    const ok = await confirm(`¿Eliminar al usuario ${u.username}? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      await api.delete(`/usuarios/${u.id}`);
      toast.success('Usuario eliminado');
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  if (!isAdmin) return <p className="text-red-500">Solo administradores</p>;
  if (loading) return <LoadingSpinner />;
  return (
    <div>
      {cs.show && <ConfirmDialog message={cs.message} onConfirm={handleConfirm} onCancel={handleCancel} />}
      <PageHeader title="Administración de Usuarios" action={
        <button onClick={() => (mode === 'crear' ? closeForm() : openCreate())} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700">
          <Plus size={16} /> Nuevo Usuario</button>
      } />
      {mode && (
        <UserForm
          empleados={empleados}
          form={form}
          setForm={setForm}
          mode={mode}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <div className="px-4 py-3 border-b"><h2 className="font-semibold text-sm">Usuarios ({users.length})</h2></div>
        <table className="w-full text-sm min-w-[640px] whitespace-nowrap rwd">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Usuario</th><th>Rol</th>
              <th>Último Acceso</th><th>Estado</th><th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => {
              const esYo = user?.username === u.username || user?.id === u.id;
              return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {u.username}
                    {esYo && <span className="ml-2 text-xs text-gray-400">(tú)</span>}
                  </td>
                  <td data-label="Rol"><Badge value={u.rol} /></td>
                  <td data-label="Último Acceso" className="text-gray-500">{u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleString('es-VE') : 'Nunca'}</td>
                  <td data-label="Estado">{u.activo ? <span className="text-green-600 flex items-center gap-1"><UserCheck size={14} /> Activo</span> : <span className="text-red-600 flex items-center gap-1"><UserX size={14} /> Inactivo</span>}</td>
                  <td data-label="Acciones" className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openPassword(u)} title="Cambiar contraseña"
                        className="p-1.5 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200"><KeyRound size={14} /></button>
                      <button onClick={() => openEdit(u)} title="Editar usuario"
                        className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"><Pencil size={14} /></button>
                      <button onClick={() => toggleActivo(u)} title={u.activo ? 'Desactivar' : 'Activar'}
                        className={`p-1.5 rounded-lg ${u.activo ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}><Power size={14} /></button>
                      <button onClick={() => handleDelete(u)} title="Eliminar usuario" disabled={esYo}
                        className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-30 disabled:cursor-not-allowed"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
