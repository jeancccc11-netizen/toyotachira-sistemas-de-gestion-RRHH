import { useState, useEffect } from 'react';
import { Plus, Table } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PeriodoSelector from '../components/nomina/PeriodoSelector';
import PeriodoForm from '../components/nomina/PeriodoForm';
import DetalleForm from '../components/nomina/DetalleForm';
import DetalleTable from '../components/nomina/DetalleTable';
import downloadFile from '../utils/download';

const fmt = (v) => parseFloat(v || 0).toFixed(2);
const emptyDetalle = {
  empleado_id: '', sueldo_base: '', comision_mensual: '0', bonificacion: '0',
  asignacion_vacaciones: '0', asignacion_bonos: '0', asignacion_extra: '0',
  deduccion_seguro_social: '0', deduccion_paro: '0', deduccion_inces: '0',
  deduccion_islr: '0', deduccion_urosalud: '0', deduccion_anticipos: '0', deduccion_otros: '0',
};

export default function Nomina() {
  const [periodos, setPeriodos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [total, setTotal] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPeriodo, setShowPeriodo] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [editing, setEditing] = useState(null);
  const [periodoForm, setPeriodoForm] = useState({ quincena: '1', mes: '8', anio: '2026', fecha_inicio: '', fecha_fin: '', estatus: 'Borrador' });
  const [detalleForm, setDetalleForm] = useState(emptyDetalle);
  const [error, setError] = useState('');

  const load = async () => {
    const [p, e] = await Promise.all([api.get('/nomina/periodos'), api.get('/empleados?limit=100')]);
    setPeriodos(p.data); setEmpleados(e.data); setLoading(false);
    if (p.data.length && !selected) setSelected(p.data[0]);
  };
  const loadDetalles = async (per) => {
    if (!per) return;
    const [d, t] = await Promise.all([api.get(`/nomina/${per.id}/detalles`), api.get(`/nomina/${per.id}/total`)]);
    setDetalles(d.data); setTotal(t.data);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { loadDetalles(selected); }, [selected]);

  const handleCreatePeriodo = async (e) => {
    e.preventDefault(); setError('');
    try {
      const body = { ...periodoForm, quincena: +periodoForm.quincena, mes: +periodoForm.mes, anio: +periodoForm.anio };
      const res = await api.post('/nomina/periodos', body);
      setShowPeriodo(false); await load(); setSelected(res.data);
    } catch (err) { setError(err.response?.data?.error || 'Error'); }
  };
  const openDetalle = (d = null) => { setEditing(d); setDetalleForm(d ? { ...d } : emptyDetalle); setShowDetalle(true); };
  const handleSaveDetalle = async (e) => {
    e.preventDefault(); setError('');
    try {
      const body = {};
      for (const [k, v] of Object.entries(detalleForm)) body[k] = k === 'empleado_id' ? parseInt(v) : parseFloat(v || 0);
      await api.put(`/nomina/${selected.id}/detalles`, body);
      setShowDetalle(false); setEditing(null); loadDetalles(selected);
    } catch (err) { setError(err.response?.data?.error || 'Error'); }
  };
  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Nómina" action={<div className="flex gap-2">
        <button onClick={() => setShowPeriodo(true)} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700"><Plus size={16} /> Nuevo Período</button>
        {selected && <button onClick={() => downloadFile(`/api/nomina/${selected.id}/export/excel`, `nomina-${selected.id}.xlsx`)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"><Table size={16} /> Exportar Excel</button>}
      </div>} />
      {showPeriodo && <PeriodoForm form={periodoForm} setForm={setPeriodoForm} error={error} onSubmit={handleCreatePeriodo} onClose={() => setShowPeriodo(false)} />}
      <PeriodoSelector periodos={periodos} selected={selected} onSelect={setSelected} />
      {showDetalle && <DetalleForm form={detalleForm} setForm={setDetalleForm} empleados={empleados} editing={editing} error={error} onSubmit={handleSaveDetalle} onClose={() => { setShowDetalle(false); setEditing(null); }} />}
      {total && <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 text-center"><p className="text-xs text-gray-500">Empleados</p><p className="text-2xl font-bold">{total.total_empleados}</p></div>
        <div className="bg-white rounded-xl shadow p-4 text-center"><p className="text-xs text-gray-500">Total Asignaciones</p><p className="text-2xl font-bold text-green-600">{fmt(total.total_asignaciones)}</p></div>
        <div className="bg-white rounded-xl shadow p-4 text-center"><p className="text-xs text-gray-500">Total Neto</p><p className="text-2xl font-bold text-primary-600">{fmt(total.total_neto)}</p></div>
      </div>}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Detalles ({detalles.length})</h2>
          {selected && <button onClick={() => openDetalle()} className="flex items-center gap-1 text-sm text-primary-600 hover:underline"><Plus size={14} /> Agregar Empleado</button>}
        </div>
        <DetalleTable detalles={detalles} periodoId={selected?.id} onEdit={openDetalle} />
      </div>
    </div>
  );
}
