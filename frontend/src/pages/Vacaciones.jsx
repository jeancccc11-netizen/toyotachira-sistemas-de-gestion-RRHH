import { useState, useEffect } from 'react';
import { Check, X, Plus } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import useRole from '../hooks/useRole';
import useConfirm from '../hooks/useConfirm';
import { useToast } from '../context/ToastContext';

export default function Vacaciones() {
  const [tab, setTab] = useState('pendientes');
  const [pendientes, setPendientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ empleado_id: '', fecha_salida: '', fecha_regreso: '', motivo: '' });
  const [error, setError] = useState('');
  const { canWrite } = useRole();
  const toast = useToast();
  const { confirm, state: cState, handleConfirm, handleCancel } = useConfirm();

  const load = async () => {
    const [p, e] = await Promise.all([api.get('/vacaciones/solicitudes/pendientes'), api.get('/empleados?limit=100')]);
    setPendientes(p.data); setEmpleados(e.data); setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const ap = async (id) => {
    const ok = await confirm('¿Aprobar solicitud?');
    if (!ok) return;
    try { await api.put(`/vacaciones/solicitudes/${id}/aprobar`); toast.success('Solicitud aprobada'); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };
  const re = async (id) => {
    const ok = await confirm('¿Rechazar solicitud?');
    if (!ok) return;
    try { await api.put(`/vacaciones/solicitudes/${id}/rechazar`); toast.success('Solicitud rechazada'); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };
  const submit = async (e) => {
    e.preventDefault(); setError('');
    try { await api.post('/vacaciones/solicitudes', form); toast.success('Solicitud creada'); setForm({ empleado_id: '', fecha_salida: '', fecha_regreso: '', motivo: '' }); setShowForm(false); load(); }
    catch (err) { setError(err.response?.data?.error || 'Error'); }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      {cState.show && <ConfirmDialog message={cState.message} onConfirm={handleConfirm} onCancel={handleCancel} />}
      <PageHeader title="Vacaciones" action={canWrite && <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700"><Plus size={16} /> Nueva Solicitud</button>} />
      <div className="flex gap-2 mb-4">
        {[['pendientes', 'Pendientes'], ['historial', 'Historial']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === k ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{l}</button>
        ))}
      </div>
      {tab === 'historial' && <div className="space-y-4"><div className="bg-white rounded-xl shadow p-4"><h3 className="font-semibold text-sm mb-3">Historial de Vacaciones</h3><p className="text-sm text-gray-500">Próximamente: historial completo por empleado</p></div></div>}
      {tab === 'pendientes' && (<>
        {showForm && <form onSubmit={submit} className="bg-white rounded-xl shadow p-4 mb-6">
          {error && <div className="bg-red-50 text-red-600 text-sm p-2 rounded mb-3">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <select value={form.empleado_id} onChange={(e) => setForm({ ...form, empleado_id: e.target.value })} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="">Empleado...</option>{empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre_completo}</option>)}</select>
            <input placeholder="Motivo (opcional)" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <div><label className="block text-xs text-gray-500 mb-1">Fecha Salida</label><input type="date" value={form.fecha_salida} onChange={(e) => setForm({ ...form, fecha_salida: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Fecha Regreso</label><input type="date" value={form.fecha_regreso} onChange={(e) => setForm({ ...form, fecha_regreso: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          </div>
          <div className="flex gap-2 mt-3"><button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm border rounded-lg">Cancelar</button><button type="submit" className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg">Enviar</button></div>
        </form>}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-4 py-3 border-b"><h2 className="font-semibold">Pendientes ({pendientes.length})</h2></div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left"><tr><th className="px-4 py-3">Empleado</th><th>Cédula</th><th>Depto.</th><th>Salida</th><th>Regreso</th><th>Días</th><th className="text-right">Acciones</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {pendientes.map((s) => (<tr key={s.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">{s.nombre_completo}</td><td className="text-gray-500">{s.cedula}</td><td>{s.departamento}</td><td>{new Date(s.fecha_salida).toLocaleDateString('es-VE')}</td><td>{new Date(s.fecha_regreso).toLocaleDateString('es-VE')}</td><td className="text-center">{s.dias_solicitados}</td><td className="text-right flex gap-2 justify-end">{canWrite && <><button onClick={() => ap(s.id)} className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"><Check size={16} /></button><button onClick={() => re(s.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><X size={16} /></button></>}</td></tr>))}
            </tbody>
          </table>
        </div>
      </>)}
    </div>
  );
}
