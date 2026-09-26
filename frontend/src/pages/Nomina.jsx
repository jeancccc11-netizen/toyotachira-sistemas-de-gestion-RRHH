import { useState, useEffect } from 'react';
import { Plus, Table, History } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PeriodoSelector from '../components/nomina/PeriodoSelector';
import PeriodoForm from '../components/nomina/PeriodoForm';
import DetalleForm from '../components/nomina/DetalleForm';
import DetalleTable from '../components/nomina/DetalleTable';
import ImportarForm from '../components/nomina/ImportarForm';
import HistorialPeriodo from '../components/nomina/HistorialPeriodo';
import useRole from '../hooks/useRole';
import { useToast } from '../context/ToastContext';
import downloadFile from '../utils/download';

const fmt = (v) => parseFloat(v || 0).toFixed(2);
const emptyDetalle = {
  empleado_id: '', sueldo_base: '', comision_mensual: '0', bonificacion: '0',
  asignacion_vacaciones: '0', asignacion_bonos: '0', asignacion_extra: '0',
  deduccion_seguro_social: '0', deduccion_paro: '0', deduccion_inces: '0',
  deduccion_islr: '0', deduccion_urosalud: '0', deduccion_anticipos: '0', deduccion_otros: '0',
};
const pf = { quincena: '1', mes: '8', anio: '2026', fecha_inicio: '', fecha_fin: '', estatus: 'Borrador' };

export default function Nomina() {
  const [periodos, setPeriodos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [total, setTotal] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState({ periodo: false, detalle: false, import: false, historial: false });
  const [editing, setEditing] = useState(null);
  const [periodoForm, setPeriodoForm] = useState(pf);
  const [detalleForm, setDetalleForm] = useState(emptyDetalle);
  const [error, setError] = useState('');
  const { canWrite } = useRole();
  const toast = useToast();
  const toggle = (k) => setShow((s) => ({ ...s, [k]: !s[k] }));

  const load = async () => {
    const [p, e] = await Promise.all([api.get('/nomina/periodos'), api.get('/empleados?limit=100')]);
    setPeriodos(p.data); setEmpleados(e.data); setLoading(false);
    if (p.data.length && !selected) setSelected(p.data[0]);
  };
  const loadDet = async (per) => {
    if (!per) return;
    const [d, t] = await Promise.all([api.get(`/nomina/${per.id}/detalles`), api.get(`/nomina/${per.id}/total`)]);
    setDetalles(d.data); setTotal(t.data);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { loadDet(selected); }, [selected]);

  const createPeriodo = async (e) => {
    e.preventDefault(); setError('');
    try {
      const body = { ...periodoForm, quincena: +periodoForm.quincena, mes: +periodoForm.mes, anio: +periodoForm.anio };
      const res = await api.post('/nomina/periodos', body);
      toast.success('Período creado'); setShow((s) => ({ ...s, periodo: false })); await load(); setSelected(res.data);
    } catch (err) { setError(err.response?.data?.error || 'Error'); }
  };
  const openDetalle = (d = null) => { setEditing(d); setDetalleForm(d ? { ...d } : emptyDetalle); setShow((s) => ({ ...s, detalle: true })); };
  const saveDetalle = async (e) => {
    e.preventDefault(); setError('');
    try {
      const body = {};
      for (const [k, v] of Object.entries(detalleForm)) body[k] = k === 'empleado_id' ? parseInt(v) : parseFloat(v || 0);
      await api.put(`/nomina/${selected.id}/detalles`, body);
      toast.success('Detalle guardado'); setShow((s) => ({ ...s, detalle: false })); setEditing(null); loadDet(selected);
    } catch (err) { setError(err.response?.data?.error || 'Error'); }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <PageHeader title="Nómina" action={<div className="flex flex-wrap gap-2">
        {canWrite && <button onClick={() => toggle('periodo')} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700"><Plus size={16} /> Nuevo Período</button>}
        {canWrite && selected && <button onClick={() => toggle('import')} className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"><Table size={16} /> Importar</button>}
        {selected && <button onClick={() => downloadFile(`/api/nomina/${selected.id}/export/excel`, `nomina-${selected.id}.xlsx`)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"><Table size={16} /> Exportar</button>}
        <button onClick={() => toggle('historial')} className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-100"><History size={16} /> Historial</button>
      </div>} />
      {show.periodo && <PeriodoForm form={periodoForm} setForm={setPeriodoForm} error={error} onSubmit={createPeriodo} onClose={() => toggle('periodo')} />}
      {show.import && selected && <ImportarForm nominaId={selected.id} onDone={() => { loadDet(selected); toggle('import'); }} />}
      {show.historial && <HistorialPeriodo onSelect={(p) => { const per = periodos.find((x) => x.id === p.id); if (per) setSelected(per); toggle('historial'); }} />}
      <PeriodoSelector periodos={periodos} selected={selected} onSelect={setSelected} onRefresh={load} />
      {show.detalle && <DetalleForm form={detalleForm} setForm={setDetalleForm} empleados={empleados} editing={editing} error={error} onSubmit={saveDetalle} onClose={() => { toggle('detalle'); setEditing(null); }} />}
      {total && <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 text-center"><p className="text-xs text-gray-500">Empleados</p><p className="text-2xl font-bold">{total.total_empleados}</p></div>
        <div className="bg-white rounded-xl shadow p-4 text-center"><p className="text-xs text-gray-500">Total Asignaciones</p><p className="text-2xl font-bold text-green-600">{fmt(total.total_asignaciones)}</p></div>
        <div className="bg-white rounded-xl shadow p-4 text-center"><p className="text-xs text-gray-500">Total Neto</p><p className="text-2xl font-bold text-primary-600">{fmt(total.total_neto)}</p></div>
      </div>}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-sm">Detalles ({detalles.length})</h2>
          {canWrite && selected && <button onClick={() => openDetalle()} className="flex items-center gap-1 text-sm text-primary-600 hover:underline"><Plus size={14} /> Agregar Empleado</button>}
        </div>
        <DetalleTable detalles={detalles} periodoId={selected?.id} onEdit={openDetalle} /></div>
    </div>
  );
}
