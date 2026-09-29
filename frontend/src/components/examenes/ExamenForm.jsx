import { useState } from 'react';
import { fechaISO, rangoFechas } from '../../utils/validation';

const today = () => new Date().toISOString().split('T')[0];

export default function ExamenForm({ empleados, onSubmit, onClose }) {
  const [form, setForm] = useState({
    empleado_id: '', tipo_registro: 'Examen Ocupacional',
    fecha_registro: today(), fecha_inicio: today(),
    diagnostico: '', medico_responsable: '', observaciones: ''
  });
  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const errEmpleado = form.empleado_id ? null : 'Selecciona un empleado';
  const errFechaReg = fechaISO(form.fecha_registro, 'La fecha de registro');
  const errRango = rangoFechas(form.fecha_registro, form.fecha_inicio, 'La fecha de registro', 'La fecha de inicio');

  const inputCls = (err) => `w-full border rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary-500 ${err ? 'border-red-400 bg-red-50/40' : 'border-gray-300'}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (errEmpleado || errFechaReg || errRango) return;
    onSubmit({ ...form, empleado_id: parseInt(form.empleado_id) });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 mb-6 animate-rise" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <select value={form.empleado_id} onChange={setF('empleado_id')}
            className={inputCls(errEmpleado)}>
            <option value="">Empleado...</option>
            {empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre_completo}</option>)}
          </select>
          {errEmpleado && <p className="text-xs text-red-600 mt-1">{errEmpleado}</p>}
        </div>
        <select value={form.tipo_registro} onChange={setF('tipo_registro')}
          className="border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-colors">
          {['Examen Ocupacional', 'Laboratorio', 'Reposo Médico', 'Control Periódico'].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fecha Registro</label>
          <input type="date" value={form.fecha_registro} onChange={setF('fecha_registro')}
            className={inputCls(errFechaReg)} />
          {errFechaReg && <p className="text-xs text-red-600 mt-1">{errFechaReg}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fecha Inicio</label>
          <input type="date" value={form.fecha_inicio} onChange={setF('fecha_inicio')}
            className={inputCls(errRango)} />
          {errRango && <p className="text-xs text-red-600 mt-1">{errRango}</p>}
        </div>
        <input placeholder="Diagnóstico" value={form.diagnostico} onChange={setF('diagnostico')} maxLength={300}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-colors" />
        <input placeholder="Médico responsable" value={form.medico_responsable} maxLength={150}
          onChange={setF('medico_responsable')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-colors" />
      </div>
      <div className="flex flex-col-reverse sm:flex-row gap-2 mt-3 sm:justify-end">
        <button type="button" onClick={onClose}
          className="w-full sm:w-auto px-3 py-2.5 sm:py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
        <button type="submit" disabled={!!errEmpleado || !!errFechaReg || !!errRango}
          className="w-full sm:w-auto px-3 py-2.5 sm:py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-all active:scale-[0.98]">Crear</button>
      </div>
    </form>
  );
}
