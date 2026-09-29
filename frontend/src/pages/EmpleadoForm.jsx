import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../api/client';
import FormField from '../components/ui/FormField';
import ErrorAlert from '../components/ui/ErrorAlert';
import {
  required, cedulaVE, cuentaBancaria, telefono, email,
  montoPositivo, montoRazonable, enteroPositivo, fechaISO,
} from '../utils/validation';

const BANCOS = [
  'Banco de Venezuela', 'Banco Provincial', 'Banesco', 'Mercantil',
  'BBVA Provincial', 'Bancaribe', 'Banco Nacional de Crédito (BNC)',
  'Banco Exterior', 'Banco Sofitasa', 'Banco Activo', 'Banco del Tesoro',
  'Banco de la Gente (Bandes)', 'Mi Banco', 'Banco Plaza', 'Bancamiga',
  'Otro',
];

const empty = {
  nro: '', cedula: '', nombre_completo: '', departamento_id: '', posicion_cargo: '',
  fecha_ingreso: '', salario_base: '', estado_operativo: 'Activo', tipo_tasa: 'Bs',
  email: '', telefono: '', direccion: '', numero_cuenta: '', banco: '',
};

// Reglas de validación por campo: función (valor, formulario) => error|null
const RULES = {
  nro: (v) => enteroPositivo(v, 'El N° de empleado'),
  cedula: (v) => cedulaVE(v),
  nombre_completo: (v) => required(v, 'El nombre completo'),
  departamento_id: (v) => required(v, 'El departamento'),
  fecha_ingreso: (v) => fechaISO(v, 'La fecha de ingreso'),
  salario_base: (v) => montoPositivo(v, 'El salario base') || montoRazonable(v),
  email: (v) => email(v),
  telefono: (v) => telefono(v),
  numero_cuenta: (v) => cuentaBancaria(v),
};

export default function EmpleadoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(empty);
  const [departamentos, setDepartamentos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    api.get('/departamentos').then((r) => setDepartamentos(r.data));
    if (isEdit) api.get(`/empleados/${id}`).then((r) => {
      const e = r.data;
      setForm({
        nro: e.nro, cedula: e.cedula, nombre_completo: e.nombre_completo,
        departamento_id: e.departamento_id, posicion_cargo: e.posicion_cargo || '',
        fecha_ingreso: e.fecha_ingreso?.split('T')[0] || '',
        salario_base: e.salario_base, estado_operativo: e.estado_operativo,
        tipo_tasa: e.tipo_tasa || 'Bs', email: e.email || '', telefono: e.telefono || '',
        direccion: e.direccion || '', numero_cuenta: e.numero_cuenta || '', banco: e.banco || '',
      });
    }).catch(() => navigate('/empleados'));
  }, [id, isEdit, navigate]);

  const set = (f) => (e) => {
    setForm({ ...form, [f]: e.target.value });
    setTouched((t) => ({ ...t, [f]: true }));
  };

  // Errores calculados en vivo
  const errors = {};
  for (const [field, rule] of Object.entries(RULES)) {
    const err = rule(form[field], form);
    if (err) errors[field] = err;
  }
  const hayErrores = Object.keys(errors).length > 0;
  const showErr = (f) => (touched[f] ? errors[f] : undefined);
  const blur = (f) => () => setTouched((t) => ({ ...t, [f]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    setTouched(Object.keys(RULES).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    if (hayErrores) {
      setError('Revisa los campos marcados en rojo');
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    try {
      const body = {
        ...form,
        nro: parseInt(form.nro),
        departamento_id: parseInt(form.departamento_id),
        salario_base: parseFloat(form.salario_base),
      };
      isEdit ? await api.put(`/empleados/${id}`, body) : await api.post('/empleados', body);
      navigate('/empleados');
    } catch (err) { setError(err.response?.data?.error || 'Error al guardar'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl animate-rise">
      <Link to="/empleados" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4 transition-colors"><ArrowLeft size={16} /> Volver</Link>
      <h1 className="text-xl sm:text-2xl font-bold mb-6">{isEdit ? 'Editar Empleado' : 'Nuevo Empleado'}</h1>
      <ErrorAlert message={error} />
      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4 animate-rise">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="N° Empleado" type="number" value={form.nro} onChange={set('nro')} onBlur={blur('nro')} error={showErr('nro')} required min="1" />
          <FormField label="Cédula" value={form.cedula} onChange={set('cedula')} onBlur={blur('cedula')} error={showErr('cedula')} required placeholder="V-12345678" maxLength={15} />
          <FormField label="Nombre Completo" value={form.nombre_completo} onChange={set('nombre_completo')} onBlur={blur('nombre_completo')} error={showErr('nombre_completo')} required className="sm:col-span-2" maxLength={150} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento <span className="text-primary-600">*</span></label>
            <select value={form.departamento_id} onChange={set('departamento_id')} onBlur={blur('departamento_id')} required
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary-500 ${showErr('departamento_id') ? 'border-red-400 bg-red-50/40' : 'border-gray-300'}`}>
              <option value="">Seleccionar...</option>
              {departamentos.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
            {showErr('departamento_id') && <p className="text-xs text-red-600 mt-1">{errors.departamento_id}</p>}
          </div>
          <FormField label="Cargo" value={form.posicion_cargo} onChange={set('posicion_cargo')} maxLength={100} />
          <FormField label="Fecha de Ingreso" type="date" value={form.fecha_ingreso} onChange={set('fecha_ingreso')} onBlur={blur('fecha_ingreso')} error={showErr('fecha_ingreso')} required max="2100-12-31" />
          <FormField label="Salario Base (Bs)" type="number" step="0.01" min="0" value={form.salario_base} onChange={set('salario_base')} onBlur={blur('salario_base')} error={showErr('salario_base')} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select value={form.estado_operativo} onChange={set('estado_operativo')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors">
              <option>Activo</option><option>Vacaciones</option><option>Reposo</option><option>Egreso</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Tasa</label>
            <select value={form.tipo_tasa} onChange={set('tipo_tasa')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors">
              <option>Bs</option><option>USD</option>
            </select>
          </div>
          <FormField label="Email" type="email" value={form.email} onChange={set('email')} onBlur={blur('email')} error={showErr('email')} placeholder="correo@ejemplo.com" />
          <FormField label="Teléfono" type="tel" value={form.telefono} onChange={set('telefono')} onBlur={blur('telefono')} error={showErr('telefono')} placeholder="0414-1234567" maxLength={20} />
          <FormField label="N° de Cuenta" value={form.numero_cuenta} onChange={set('numero_cuenta')} onBlur={blur('numero_cuenta')} error={showErr('numero_cuenta')} hint="20 dígitos" placeholder="01050123456789012345" inputMode="numeric" maxLength={25} className="sm:col-span-2" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
            <select value={form.banco} onChange={set('banco')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors">
              <option value="">Seleccionar...</option>
              {BANCOS.map((b) => <option key={b}>{b}</option>)}
              {form.banco && !BANCOS.includes(form.banco) && <option value={form.banco}>{form.banco}</option>}
            </select>
          </div>
          <FormField label="Dirección" value={form.direccion} onChange={set('direccion')} className="sm:col-span-2" maxLength={300} />
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
          <button type="button" onClick={() => navigate('/empleados')} className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-all active:scale-[0.98]">
            <Save size={16} /> {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}
