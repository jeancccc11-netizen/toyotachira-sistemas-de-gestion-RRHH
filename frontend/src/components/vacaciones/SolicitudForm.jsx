import { fechaISO, rangoFechas } from '../../utils/validation';

export default function SolicitudForm({ empleados, form, setForm, error, onSubmit, onClose }) {
  const errSalida = form.fecha_salida ? fechaISO(form.fecha_salida, 'La fecha de salida') : null;
  const errRango = form.fecha_salida && form.fecha_regreso
    ? rangoFechas(form.fecha_salida, form.fecha_regreso, 'La fecha de salida', 'La fecha de regreso')
    : null;
  const dias = form.fecha_salida && form.fecha_regreso && !errRango
    ? Math.ceil((new Date(form.fecha_regreso) - new Date(form.fecha_salida)) / 86400000)
    : null;

  const inputCls = (err) => `w-full border rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary-500 ${err ? 'border-red-400 bg-red-50/40' : 'border-gray-300'}`;

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-4 mb-6 animate-rise" noValidate>
      {error && <div className="bg-red-50 text-red-600 text-sm p-2 rounded mb-3">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select value={form.empleado_id}
          onChange={(e) => setForm({ ...form, empleado_id: e.target.value })}
          required className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-colors">
          <option value="">Empleado...</option>
          {empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre_completo}</option>)}
        </select>
        <input placeholder="Motivo (opcional)" value={form.motivo} maxLength={300}
          onChange={(e) => setForm({ ...form, motivo: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-colors" />
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fecha Salida</label>
          <input type="date" value={form.fecha_salida}
            onChange={(e) => setForm({ ...form, fecha_salida: e.target.value })}
            required className={inputCls(errSalida)} />
          {errSalida && <p className="text-xs text-red-600 mt-1">{errSalida}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fecha Regreso</label>
          <input type="date" value={form.fecha_regreso}
            onChange={(e) => setForm({ ...form, fecha_regreso: e.target.value })}
            required className={inputCls(errRango)} />
          {errRango && <p className="text-xs text-red-600 mt-1">{errRango}</p>}
        </div>
      </div>
      {dias !== null && (
        <p className="text-xs text-gray-500 mt-2">
          Días solicitados: <span className="font-semibold text-gray-700">{dias}</span>
        </p>
      )}
      <div className="flex flex-col-reverse sm:flex-row gap-2 mt-3 sm:justify-end">
        <button type="button" onClick={onClose}
          className="w-full sm:w-auto px-3 py-2.5 sm:py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
        <button type="submit" disabled={!!errSalida || !!errRango}
          className="w-full sm:w-auto px-3 py-2.5 sm:py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-all active:scale-[0.98]">Enviar</button>
      </div>
    </form>
  );
}
