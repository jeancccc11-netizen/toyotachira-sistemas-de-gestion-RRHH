import { useState, useEffect } from 'react';
import { Shield, Plus, Users } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import useRole from '../hooks/useRole';
import useConfirm from '../hooks/useConfirm';
import usePagination from '../hooks/usePagination';
import { useToast } from '../context/ToastContext';

export default function Urosalud() {
  const [polizas, setPolizas] = useState([]);
  const [resumen, setResumen] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [sel, setSel] = useState(null);
  const [cargas, setCargas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showCarga, setShowCarga] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ empleado_id: '', numero_poliza: '', fecha_afiliacion: '', plan_contratado: '', monto_prima: '', asesor: '', moneda: 'Bs', estado: 'Activa' });
  const [cargaForm, setCargaForm] = useState({ nombre_completo: '', parentesco: 'Cónyuge', sexo: 'F' });
  const [error, setError] = useState('');
  const { canWrite, canDelete } = useRole();
  const toast = useToast();
  const { confirm, state: cState, handleConfirm, handleCancel } = useConfirm();
  const { page, totalPages, items, goTo } = usePagination(polizas);
  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = async () => {
    const [p, r, e] = await Promise.all([api.get('/urosalud/polizas'), api.get('/urosalud/resumen'), api.get('/empleados?limit=100')]);
    setPolizas(p.data); setResumen(r.data); setEmpleados(e.data); setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const openCargas = async (p) => { setSel(p); const res = await api.get(`/urosalud/cargas/${p.id}`); setCargas(res.data); };
  const handleCreate = async (e) => { e.preventDefault(); setError(''); try { await api.post('/urosalud/polizas', { ...form, empleado_id: parseInt(form.empleado_id), monto_prima: parseFloat(form.monto_prima) }); toast.success('Póliza creada'); setShowForm(false); load(); } catch (err) { toast.error(err.response?.data?.error || 'Error'); } };
  const handleCarga = async (e) => { e.preventDefault(); try { await api.post('/urosalud/cargas', { ...cargaForm, poliza_id: sel.id }); toast.success('Carga agregada'); setShowCarga(false); const res = await api.get(`/urosalud/cargas/${sel.id}`); setCargas(res.data); } catch (err) { toast.error(err.response?.data?.error || 'Error'); } };
  const handleDeleteCarga = async (id) => { const ok = await confirm('¿Eliminar carga?'); if (!ok) return; try { await api.delete(`/urosalud/cargas/${id}`); toast.success('Carga eliminada'); const res = await api.get(`/urosalud/cargas/${sel.id}`); setCargas(res.data); } catch (err) { toast.error(err.response?.data?.error || 'Error'); } };

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      {cState.show && <ConfirmDialog message={cState.message} onConfirm={handleConfirm} onCancel={handleCancel} />}
      <PageHeader title="Seguro Urosalud" action={canWrite && <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700"><Plus size={16} /> Nueva Póliza</button>} />
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow p-4 mb-6">
          {error && <div className="bg-red-50 text-red-600 text-sm p-2 rounded mb-3">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <select value={form.empleado_id} onChange={setF('empleado_id')} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="">Empleado...</option>{empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre_completo}</option>)}</select>
            <input placeholder="N° Póliza" value={form.numero_poliza} onChange={setF('numero_poliza')} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input type="date" value={form.fecha_afiliacion} onChange={setF('fecha_afiliacion')} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <select value={form.plan_contratado} onChange={setF('plan_contratado')} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="">Plan...</option><option>Plan Básico</option><option>Plan Plus</option><option>Plan Platinum 2</option></select>
            <input type="number" step="0.01" placeholder="Prima (Bs)" value={form.monto_prima} onChange={setF('monto_prima')} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Asesor" value={form.asesor} onChange={setF('asesor')} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm border rounded-lg">Cancelar</button>
            <button type="submit" className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg">Crear</button>
          </div>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {resumen.map((r, i) => <div key={i} className="bg-white rounded-xl shadow p-4"><div className="flex items-center gap-2 mb-2"><Shield size={16} className="text-primary-600" /><h3 className="font-medium text-sm">{r.plan_contratado}</h3></div><p className="text-2xl font-bold">{r.total}</p><p className="text-xs text-gray-500">{parseFloat(r.prima_total).toFixed(2)} Bs</p></div>)}
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-4 py-3 border-b"><h2 className="font-semibold">Pólizas ({polizas.length})</h2></div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left"><tr><th className="px-4 py-3">Empleado</th><th>Póliza</th><th>Plan</th><th>Prima</th><th>Cargas</th><th></th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((p) => <tr key={p.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">{p.nombre_completo}</td><td className="text-gray-500">{p.numero_poliza || '—'}</td><td>{p.plan_contratado}</td><td>{parseFloat(p.monto_prima).toFixed(2)} {p.moneda}</td><td className="text-center">{p.total_cargas}</td><td className="text-right"><button onClick={() => openCargas(p)} className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Users size={14} /></button></td></tr>)}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPageChange={goTo} />
      </div>
      {sel && (
        <Modal title={`Cargas - ${sel.nombre_completo}`} onClose={() => setSel(null)}>
          {canWrite && <button onClick={() => setShowCarga(true)} className="mb-3 text-sm text-primary-600 hover:underline flex items-center gap-1"><Plus size={14} /> Agregar</button>}
          {showCarga && (
            <form onSubmit={handleCarga} className="bg-gray-50 rounded-lg p-3 mb-3 flex gap-2">
              <input placeholder="Nombre" value={cargaForm.nombre_completo} onChange={(e) => setCargaForm({ ...cargaForm, nombre_completo: e.target.value })} required className="border rounded-lg px-3 py-2 text-sm flex-1" />
              <select value={cargaForm.parentesco} onChange={(e) => setCargaForm({ ...cargaForm, parentesco: e.target.value })} className="border rounded-lg px-3 py-2 text-sm"><option>Cónyuge</option><option>Hijo/a</option></select>
              <button type="submit" className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm">Guardar</button>
            </form>
          )}
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500"><th className="py-2">Nombre</th><th>Parentesco</th><th></th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {cargas.map((c) => <tr key={c.id}><td className="py-2">{c.nombre_completo}</td><td>{c.parentesco}</td><td className="text-right">{canDelete && <button onClick={() => handleDeleteCarga(c.id)} className="text-red-500 text-xs">Eliminar</button>}</td></tr>)}
            </tbody>
          </table>
        </Modal>
      )}
    </div>
  );
}
