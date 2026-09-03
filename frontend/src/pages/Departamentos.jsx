import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Departamentos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const load = async () => {
    const res = await api.get('/departamentos');
    setDepartamentos(res.data); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = { nombre, descripcion };
    editing ? await api.put(`/departamentos/${editing.id}`, body) : await api.post('/departamentos', body);
    setShowForm(false); setEditing(null); setNombre(''); setDescripcion(''); load();
  };

  const handleEdit = (d) => { setEditing(d); setNombre(d.nombre); setDescripcion(d.descripcion || ''); setShowForm(true); };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar departamento?')) return;
    await api.delete(`/departamentos/${id}`); load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Departamentos"
        action={<button onClick={() => { setShowForm(!showForm); setEditing(null); setNombre(''); setDescripcion(''); }} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700"><Plus size={16} /> Nuevo</button>} />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 mb-6">
          <h3 className="font-semibold text-sm mb-3">{editing ? 'Editar' : 'Nuevo'} Departamento</h3>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Descripción (opcional)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm border rounded-lg">Cancelar</button>
            <button type="submit" className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg">{editing ? 'Actualizar' : 'Crear'}</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left"><tr><th className="px-4 py-3">ID</th><th>Nombre</th><th>Descripción</th><th className="text-right">Acciones</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {departamentos.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{d.id}</td>
                <td className="font-medium">{d.nombre}</td>
                <td className="text-gray-500">{d.descripcion || '—'}</td>
                <td className="text-right flex items-center justify-end gap-2">
                  <button onClick={() => handleEdit(d)} className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(d.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
