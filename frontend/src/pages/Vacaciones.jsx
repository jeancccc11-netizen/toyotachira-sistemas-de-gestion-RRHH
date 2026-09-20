import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import SolicitudForm from '../components/vacaciones/SolicitudForm';
import PendientesTable from '../components/vacaciones/PendientesTable';
import HistorialTable from '../components/vacaciones/HistorialTable';
import useRole from '../hooks/useRole';
import useConfirm from '../hooks/useConfirm';
import usePagination from '../hooks/usePagination';
import { useToast } from '../context/ToastContext';

export default function Vacaciones() {
  const [tab, setTab] = useState('pendientes');
  const [pendientes, setPendientes] = useState([]);
  const [todas, setTodas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ empleado_id: '', fecha_salida: '', fecha_regreso: '', motivo: '' });
  const [error, setError] = useState('');
  const { canWrite } = useRole();
  const toast = useToast();
  const { confirm, state: cs, handleConfirm, handleCancel } = useConfirm();
  const pag = usePagination(todas);

  const load = async () => {
    const [p, t, e] = await Promise.all([
      api.get('/vacaciones/solicitudes/pendientes'), api.get('/vacaciones/historial/todas'),
      api.get('/empleados?limit=100')
    ]);
    setPendientes(p.data); setTodas(t.data); setEmpleados(e.data); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const aprobar = async (id) => {
    const ok = await confirm('¿Aprobar?'); if (!ok) return;
    try { await api.put(`/vacaciones/solicitudes/${id}/aprobar`); toast.success('Aprobada'); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };
  const rechazar = async (id) => {
    const ok = await confirm('¿Rechazar?'); if (!ok) return;
    try { await api.put(`/vacaciones/solicitudes/${id}/rechazar`); toast.success('Rechazada'); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };
  const submit = async (e) => {
    e.preventDefault(); setError('');
    try { await api.post('/vacaciones/solicitudes', form); toast.success('Creada'); setForm({ empleado_id: '', fecha_salida: '', fecha_regreso: '', motivo: '' }); setShowForm(false); load(); }
    catch (err) { setError(err.response?.data?.error || 'Error'); }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      {cs.show && <ConfirmDialog message={cs.message} onConfirm={handleConfirm} onCancel={handleCancel} />}
      <PageHeader title="Vacaciones" action={canWrite && <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700"><Plus size={16} /> Nueva</button>} />
      <div className="flex gap-2 mb-4">
        {[['pendientes', 'Pendientes'], ['historial', 'Historial']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === k ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{l}</button>
        ))}
      </div>
      {tab === 'historial' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-4 py-3 border-b"><h2 className="font-semibold text-sm">Historial ({todas.length})</h2></div>
          <HistorialTable items={pag.items} />
          <Pagination page={pag.page} totalPages={pag.totalPages} onPageChange={pag.goTo} />
        </div>
      )}
      {tab === 'pendientes' && (<>
        {showForm && <SolicitudForm empleados={empleados} form={form} setForm={setForm} error={error} onSubmit={submit} onClose={() => setShowForm(false)} />}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-4 py-3 border-b"><h2 className="font-semibold text-sm">Pendientes ({pendientes.length})</h2></div>
          <PendientesTable items={pendientes} canWrite={canWrite} onAprobar={aprobar} onRechazar={rechazar} />
        </div>
      </>)}
    </div>
  );
}
