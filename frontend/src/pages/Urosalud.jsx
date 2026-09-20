import { useState, useEffect } from 'react';
import { Shield, Plus } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import PolizaForm from '../components/urosalud/PolizaForm';
import PolizaTable from '../components/urosalud/PolizaTable';
import CargasModal from '../components/urosalud/CargasModal';
import useRole from '../hooks/useRole';
import useConfirm from '../hooks/useConfirm';
import usePagination from '../hooks/usePagination';
import { useToast } from '../context/ToastContext';

const empty = { empleado_id: '', numero_poliza: '', fecha_afiliacion: '', plan_contratado: '', monto_prima: '', asesor: '', moneda: 'Bs', estado: 'Activa' };

export default function Urosalud() {
  const [polizas, setPolizas] = useState([]);
  const [resumen, setResumen] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [sel, setSel] = useState(null);
  const [cargas, setCargas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const { canWrite, canDelete } = useRole();
  const toast = useToast();
  const { confirm, state: cs, handleConfirm, handleCancel } = useConfirm();
  const pag = usePagination(polizas);
  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = async () => {
    try {
      const [p, r, e] = await Promise.all([api.get('/urosalud/polizas'), api.get('/urosalud/polizas/resumen'), api.get('/empleados?limit=100')]);
      setPolizas(p.data || []); setResumen(r.data || []); setEmpleados(e.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCargas = async (p) => { setSel(p); const res = await api.get(`/urosalud/cargas/${p.id}`); setCargas(res.data); };
  const openEdit = (p) => { setEdit(p); setForm({ ...p, fecha_afiliacion: p.fecha_afiliacion?.split('T')[0] || '' }); setShowForm(true); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = { ...form, empleado_id: parseInt(form.empleado_id), monto_prima: parseFloat(form.monto_prima) };
      if (edit) { await api.put(`/urosalud/polizas/${edit.id}`, body); toast.success('Actualizada'); }
      else { await api.post('/urosalud/polizas', body); toast.success('Creada'); }
      setShowForm(false); setEdit(null); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };
  const handleDelete = async (id) => { const ok = await confirm('¿Eliminar?'); if (!ok) return; await api.delete(`/urosalud/polizas/${id}`); toast.success('Eliminada'); load(); };
  const closeForm = () => { setForm(empty); setEdit(null); setShowForm(false); };

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      {cs.show && <ConfirmDialog message={cs.message} onConfirm={handleConfirm} onCancel={handleCancel} />}
      <PageHeader title="Seguro Urosalud" action={canWrite && <button onClick={() => { closeForm(); setShowForm(true); }} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700"><Plus size={16} /> Nueva Póliza</button>} />
      {showForm && <PolizaForm form={form} setF={setF} empleados={empleados} editPoliza={edit} onSubmit={handleSubmit} onClose={closeForm} />}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {resumen.map((r, i) => (<div key={i} className="bg-white rounded-xl shadow p-4"><div className="flex items-center gap-2 mb-2"><Shield size={16} className="text-primary-600" /><h3 className="font-medium text-sm">{r.plan_contratado}</h3></div><p className="text-2xl font-bold">{r.total}</p><p className="text-xs text-gray-500">{parseFloat(r.prima_total).toFixed(2)} Bs</p></div>))}
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-4 py-3 border-b"><h2 className="font-semibold text-sm">Pólizas ({polizas.length})</h2></div>
        <PolizaTable items={pag.items} canWrite={canWrite} canDelete={canDelete} onCargas={openCargas} onEdit={openEdit} onDelete={handleDelete} />
        <Pagination page={pag.page} totalPages={pag.totalPages} onPageChange={pag.goTo} />
      </div>
      {sel && <CargasModal sel={sel} cargas={cargas} setCargas={setCargas} onClose={() => setSel(null)} />}
    </div>
  );
}
