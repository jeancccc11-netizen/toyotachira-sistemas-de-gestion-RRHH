import { useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../ui/Modal';
import api from '../../api/client';
import useRole from '../../hooks/useRole';

export default function CargasModal({ sel, cargas, setCargas, onClose }) {
  if (!sel) return null;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nombre_completo: '', cedula_o_identificador: '',
    parentesco: 'Cónyuge', sexo: 'F', edad: ''
  });
  const { canWrite, canDelete } = useRole();

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/urosalud/cargas', { ...form, poliza_id: sel.id });
      const res = await api.get(`/urosalud/cargas/${sel.id}`);
      setCargas(res.data || []); setShowForm(false);
      setForm({ nombre_completo: '', cedula_o_identificador: '',
        parentesco: 'Cónyuge', sexo: 'F', edad: '' });
    } catch (err) { console.error(err); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar carga?')) return;
    try {
      await api.delete(`/urosalud/cargas/${id}`);
      const res = await api.get(`/urosalud/cargas/${sel.id}`);
      setCargas(res.data || []);
    } catch (err) { console.error(err); }
  };

  return (
    <Modal title={`Cargas — ${sel.nombre_completo}`} onClose={onClose}>
      {canWrite && (
        <button onClick={() => setShowForm(!showForm)}
          className="mb-3 text-sm text-primary-600 hover:underline flex items-center gap-1">
          <Plus size={14} /> Agregar
        </button>
      )}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
          <div className="flex gap-2">
            <input placeholder="Nombre" value={form.nombre_completo} required
              onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm flex-1" />
            <input placeholder="Cédula" value={form.cedula_o_identificador}
              onChange={(e) => setForm({ ...form, cedula_o_identificador: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm flex-1" />
          </div>
          <div className="flex gap-2">
            <select value={form.parentesco}
              onChange={(e) => setForm({ ...form, parentesco: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm">
              {['Cónyuge', 'Hijo/a', 'Padre', 'Madre', 'Abuelo', 'Abuela', 'Tío', 'Tía', 'Primo/a', 'Suegro/a', 'Yerno/Nuera', 'Otro'].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <button type="submit"
              className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm">Guardar</button>
          </div>
        </form>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-2">Nombre</th><th>Cédula</th>
            <th>Parentesco</th><th></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {cargas.map((c) => (
            <tr key={c.id}>
              <td className="py-2">{c.nombre_completo}</td>
              <td className="text-gray-500">{c.cedula_o_identificador || '—'}</td>
              <td>{c.parentesco}</td>
              <td className="text-right">
                {canDelete && (
                  <button onClick={() => handleDelete(c.id)}
                    className="text-red-500 text-xs hover:underline">Eliminar</button>
                )}
              </td>
            </tr>
          ))}
          {!cargas.length && (
            <tr><td colSpan={4} className="py-3 text-center text-gray-400 text-sm">
              Sin cargas</td></tr>
          )}
        </tbody>
      </table>
    </Modal>
  );
}
