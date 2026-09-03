import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../api/client';
import FormField from '../components/ui/FormField';
import ErrorAlert from '../components/ui/ErrorAlert';

const empty = { nro: '', cedula: '', nombre_completo: '', departamento_id: '', posicion_cargo: '', fecha_ingreso: '', salario_base: '', estado_operativo: 'Activo', tipo_tasa: 'Bs', email: '', telefono: '', direccion: '' };

export default function EmpleadoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(empty);
  const [departamentos, setDepartamentos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/departamentos').then((r) => setDepartamentos(r.data));
    if (isEdit) api.get(`/empleados/${id}`).then((r) => {
      const e = r.data;
      setForm({ nro: e.nro, cedula: e.cedula, nombre_completo: e.nombre_completo, departamento_id: e.departamento_id, posicion_cargo: e.posicion_cargo || '', fecha_ingreso: e.fecha_ingreso?.split('T')[0] || '', salario_base: e.salario_base, estado_operativo: e.estado_operativo, tipo_tasa: e.tipo_tasa || 'Bs', email: e.email || '', telefono: e.telefono || '', direccion: e.direccion || '' });
    }).catch(() => navigate('/empleados'));
  }, [id, isEdit, navigate]);

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const body = { ...form, nro: parseInt(form.nro), departamento_id: parseInt(form.departamento_id), salario_base: parseFloat(form.salario_base) };
      isEdit ? await api.put(`/empleados/${id}`, body) : await api.post('/empleados', body);
      navigate('/empleados');
    } catch (err) { setError(err.response?.data?.error || 'Error al guardar'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl">
      <Link to="/empleados" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4"><ArrowLeft size={16} /> Volver</Link>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Editar Empleado' : 'Nuevo Empleado'}</h1>
      <ErrorAlert message={error} />
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="N° Empleado" type="number" value={form.nro} onChange={set('nro')} required />
          <FormField label="Cédula" value={form.cedula} onChange={set('cedula')} required placeholder="V-XX.XXX.XXX" />
          <FormField label="Nombre Completo" value={form.nombre_completo} onChange={set('nombre_completo')} required className="col-span-2" />
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label><select value={form.departamento_id} onChange={set('departamento_id')} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="">Seleccionar...</option>{departamentos.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}</select></div>
          <FormField label="Cargo" value={form.posicion_cargo} onChange={set('posicion_cargo')} />
          <FormField label="Fecha de Ingreso" type="date" value={form.fecha_ingreso} onChange={set('fecha_ingreso')} required />
          <FormField label="Salario Base (Bs)" type="number" step="0.01" value={form.salario_base} onChange={set('salario_base')} required />
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Estado</label><select value={form.estado_operativo} onChange={set('estado_operativo')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>Activo</option><option>Vacaciones</option><option>Reposo</option><option>Egreso</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tipo Tasa</label><select value={form.tipo_tasa} onChange={set('tipo_tasa')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option>Bs</option><option>USD</option></select></div>
          <FormField label="Email" type="email" value={form.email} onChange={set('email')} />
          <FormField label="Teléfono" value={form.telefono} onChange={set('telefono')} />
          <FormField label="Dirección" value={form.direccion} onChange={set('direccion')} className="col-span-2" />
        </div>
        <div className="flex gap-3 pt-4 border-t">
          <button type="button" onClick={() => navigate('/empleados')} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"><Save size={16} /> {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}</button>
        </div>
      </form>
    </div>
  );
}
