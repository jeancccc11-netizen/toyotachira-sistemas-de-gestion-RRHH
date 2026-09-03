import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../api/client';

export default function ExamenesTab({ examenes, empleadoId, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tipo_registro: 'Examen Ocupacional', diagnostico: '', medico_responsable: '' });

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/examenes', { ...form, empleado_id: parseInt(empleadoId) });
    setShowForm(false); onRefresh();
  };

  const handleReintegro = async (id) => {
    const fecha = prompt('Fecha de reintegro (YYYY-MM-DD):');
    if (!fecha) return;
    await api.put(`/examenes/${id}/reintegro`, { fecha_reintegro: fecha }); onRefresh();
  };

  const handleDelete = async (id) => { if (!confirm('¿Eliminar?')) return; await api.delete(`/examenes/${id}`); onRefresh(); };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Exámenes ({examenes.length})</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-sm text-primary-600 hover:underline"><Plus size={14} /> Nuevo</button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="grid grid-cols-2 gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
          <select value={form.tipo_registro} onChange={(e) => setForm({ ...form, tipo_registro: e.target.value })} className="border rounded-lg px-2 py-1 text-sm">
            {['Examen Ocupacional', 'Laboratorio', 'Reposo Médico', 'Control Periódico'].map((t) => <option key={t}>{t}</option>)}
          </select>
          <input placeholder="Diagnóstico" value={form.diagnostico} onChange={(e) => setForm({ ...form, diagnostico: e.target.value })} className="border rounded-lg px-2 py-1 text-sm" />
          <input placeholder="Médico" value={form.medico_responsable} onChange={(e) => setForm({ ...form, medico_responsable: e.target.value })} className="border rounded-lg px-2 py-1 text-sm" />
          <button type="submit" className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm">Crear</button>
        </form>
      )}
      {examenes.length === 0 ? <p className="text-gray-500 text-sm">No hay exámenes</p> : examenes.map((ex) => (
        <div key={ex.id} className="flex items-center justify-between py-2 border-b last:border-0">
          <div>
            <p className="text-sm font-medium">{ex.tipo_registro} — {ex.fecha_registro?.split('T')[0]}</p>
            <p className="text-xs text-gray-500">{ex.diagnostico || 'Sin diagnóstico'} {ex.fecha_reintegro ? `| Reintegrado: ${ex.fecha_reintegro}` : ''}</p>
          </div>
          <div className="flex gap-1">
            {!ex.fecha_reintegro && ex.tipo_registro === 'Reposo Médico' && <button onClick={() => handleReintegro(ex.id)} className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">Reintegrar</button>}
            <button onClick={() => handleDelete(ex.id)} className="p-1 text-red-500"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
