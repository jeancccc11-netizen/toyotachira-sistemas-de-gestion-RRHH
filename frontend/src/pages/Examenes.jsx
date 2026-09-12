import { useState, useEffect } from 'react';
import { Plus, Trash2, Clipboard } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import useRole from '../hooks/useRole';
import useConfirm from '../hooks/useConfirm';
import usePagination from '../hooks/usePagination';
import { useToast } from '../context/ToastContext';

export default function Examenes() {
  const [examenes, setExamenes] = useState([]);
  const [reposos, setReposos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ empleado_id: '', tipo_registro: 'Examen Ocupacional', diagnostico: '', medico_responsable: '', observaciones: '' });
  const { canWrite, canDelete } = useRole();
  const toast = useToast();
  const { confirm, state: cState, handleConfirm, handleCancel } = useConfirm();
  const { page, totalPages, items, goTo } = usePagination(examenes);

  const load = async () => {
    const [ex, r, e] = await Promise.all([api.get('/examenes/reposos-activos'), api.get('/examenes/reposos-activos'), api.get('/empleados?limit=100')]);
    setExamenes(ex.data); setReposos(r.data); setEmpleados(e.data); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await api.post('/examenes', { ...form, empleado_id: parseInt(form.empleado_id) }); toast.success('Examen registrado'); setShowForm(false); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };
  const handleReintegro = async (id) => {
    const fecha = prompt('Fecha de reintegro (YYYY-MM-DD):');
    if (!fecha) return;
    try { await api.put(`/examenes/${id}/reintegro`, { fecha_reintegro: fecha }); toast.success('Reintegrado'); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };
  const handleDelete = async (id) => {
    const ok = await confirm('¿Eliminar registro?');
    if (!ok) return;
    try { await api.delete(`/examenes/${id}`); toast.success('Eliminado'); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      {cState.show && <ConfirmDialog message={cState.message} onConfirm={handleConfirm} onCancel={handleCancel} />}
      <PageHeader title="Exámenes Médicos y Reposos" action={canWrite && (
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700"><Plus size={16} /> Nuevo</button>
      )} />
      {reposos.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-sm text-amber-800 mb-2">⚠️ Reposos Activos ({reposos.length})</h3>
          {reposos.map((r) => <div key={r.id} className="flex items-center justify-between py-1"><span className="text-sm">{r.nombre_completo} — desde {r.fecha_inicio}</span>{canWrite && <button onClick={() => handleReintegro(r.id)} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">Reintegrar</button>}</div>)}
        </div>
      )}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <select value={form.empleado_id} onChange={(e) => setForm({ ...form, empleado_id: e.target.value })} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="">Empleado...</option>{empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre_completo}</option>)}</select>
            <select value={form.tipo_registro} onChange={(e) => setForm({ ...form, tipo_registro: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">{['Examen Ocupacional', 'Laboratorio', 'Reposo Médico', 'Control Periódico'].map((t) => <option key={t}>{t}</option>)}</select>
            <input placeholder="Diagnóstico" value={form.diagnostico} onChange={(e) => setForm({ ...form, diagnostico: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Médico responsable" value={form.medico_responsable} onChange={(e) => setForm({ ...form, medico_responsable: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm border rounded-lg">Cancelar</button>
            <button type="submit" className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg">Crear</button>
          </div>
        </form>
      )}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-4 py-3 border-b"><h2 className="font-semibold flex items-center gap-2"><Clipboard size={16} /> Registros ({examenes.length})</h2></div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left"><tr><th className="px-4 py-3">Tipo</th><th>Empleado</th><th>Fecha</th><th>Diagnóstico</th><th>Estado</th><th></th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((ex) => <tr key={ex.id} className="hover:bg-gray-50"><td className="px-4 py-3"><Badge value={ex.tipo_registro} /></td><td>{ex.nombre_completo}</td><td className="text-gray-500">{ex.fecha_registro?.split('T')[0]}</td><td className="text-gray-500">{ex.diagnostico || '—'}</td><td>{ex.fecha_reintegro ? <span className="text-green-600 text-xs">Reintegrado {ex.fecha_reintegro}</span> : <span className="text-amber-600 text-xs">Activo</span>}</td><td className="text-right flex gap-1 justify-end">{canWrite && !ex.fecha_reintegro && <button onClick={() => handleReintegro(ex.id)} className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">Reintegrar</button>}{canDelete && <button onClick={() => handleDelete(ex.id)} className="p-1 text-red-500"><Trash2 size={14} /></button>}</td></tr>)}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPageChange={goTo} />
      </div>
    </div>
  );
}
