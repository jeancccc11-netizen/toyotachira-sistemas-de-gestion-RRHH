import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import useRole from '../hooks/useRole';
import useConfirm from '../hooks/useConfirm';
import usePagination from '../hooks/usePagination';
import { useToast } from '../context/ToastContext';

export default function Departamentos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const { canWrite, canDelete } = useRole();
  const toast = useToast();
  const { confirm, state: cState, handleConfirm, handleCancel } = useConfirm();
  const { page, totalPages, items, goTo } = usePagination(departamentos, 20);

  const load = async () => {
    const res = await api.get('/departamentos');
    setDepartamentos(res.data); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = { nombre, descripcion };
      editing ? await api.put(`/departamentos/${editing.id}`, body) : await api.post('/departamentos', body);
      toast.success(editing ? 'Departamento actualizado' : 'Departamento creado');
      setShowForm(false); setEditing(null); setNombre(''); setDescripcion(''); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const handleEdit = (d) => { setEditing(d); setNombre(d.nombre); setDescripcion(d.descripcion || ''); setShowForm(true); };
  const handleDelete = async (id) => {
    const ok = await confirm('¿Eliminar departamento?');
    if (!ok) return;
    try { await api.delete(`/departamentos/${id}`); toast.success('Departamento eliminado'); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      {cState.show && <ConfirmDialog message={cState.message} onConfirm={handleConfirm} onCancel={handleCancel} />}
      <PageHeader title="Departamentos" action={canWrite && (
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setNombre(''); setDescripcion(''); }} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700"><Plus size={16} /> Nuevo</button>
      )} />
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 mb-6">
          <h3 className="font-semibold text-sm mb-3">{editing ? 'Editar' : 'Nuevo'} Departamento</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Descripción (opcional)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm border rounded-lg">Cancelar</button>
            <button type="submit" className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg">{editing ? 'Actualizar' : 'Crear'}</button>
          </div>
        </form>
      )}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm min-w-[560px] whitespace-nowrap rwd">
          <thead className="bg-gray-50 text-left"><tr><th className="px-4 py-3">ID</th><th>Nombre</th><th>Descripción</th><th className="text-right">Acciones</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{d.nombre}</td>
                <td data-label="ID" className="text-gray-500">{d.id}</td>
                <td data-label="Descripción" className="text-gray-500">{d.descripcion || '—'}</td>
                <td data-label="Acciones" className="text-right">
                  <div className="flex items-center justify-end gap-2">
                  {canWrite && <button onClick={() => handleEdit(d)} className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"><Pencil size={14} /></button>}
                  {canDelete && <button onClick={() => handleDelete(d.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 size={14} /></button>}
                </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPageChange={goTo} />
      </div>
    </div>
  );
}
