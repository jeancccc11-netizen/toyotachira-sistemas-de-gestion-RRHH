import { useState } from 'react';

const today = () => new Date().toISOString().split('T')[0];

export default function ExamenForm({ empleados, onSubmit, onClose }) {
  const [form, setForm] = useState({
    empleado_id: '', tipo_registro: 'Examen Ocupacional',
    fecha_registro: today(), fecha_inicio: today(),
    diagnostico: '', medico_responsable: '', observaciones: ''
  });
  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, empleado_id: parseInt(form.empleado_id) });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select value={form.empleado_id} onChange={setF('empleado_id')}
          required className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Empleado...</option>
          {empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre_completo}</option>)}
        </select>
        <select value={form.tipo_registro} onChange={setF('tipo_registro')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          {['Examen Ocupacional', 'Laboratorio', 'Reposo Médico', 'Control Periódico'].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fecha Registro</label>
          <input type="date" value={form.fecha_registro} onChange={setF('fecha_registro')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fecha Inicio</label>
          <input type="date" value={form.fecha_inicio} onChange={setF('fecha_inicio')}
            required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <input placeholder="Diagnóstico" value={form.diagnostico} onChange={setF('diagnostico')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Médico responsable" value={form.medico_responsable}
          onChange={setF('medico_responsable')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="flex gap-2 mt-3">
        <button type="button" onClick={onClose}
          className="px-3 py-1.5 text-sm border rounded-lg">Cancelar</button>
        <button type="submit"
          className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg">Crear</button>
      </div>
    </form>
  );
}
