import ErrorAlert from '../ui/ErrorAlert';
import { montoPositivo, montoRazonable } from '../../utils/validation';

export default function PolizaForm({ form, setF, empleados, editPoliza, error, onSubmit, onClose }) {
  const errEmpleado = form.empleado_id ? null : 'Selecciona un empleado';
  const errPrima = montoPositivo(form.monto_prima, 'La prima') || montoRazonable(form.monto_prima);

  const inputCls = (err) => `border rounded-lg px-3 py-2 text-sm w-full outline-none transition-colors focus:ring-2 focus:ring-primary-500 ${err ? 'border-red-400 bg-red-50/40' : 'border-gray-300'}`;
  const selectCls = (err) => `border rounded-lg px-3 py-2.5 sm:py-2 text-sm w-full outline-none transition-colors focus:ring-2 focus:ring-primary-500 ${err ? 'border-red-400 bg-red-50/40' : 'border-gray-300'}`;

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-4 mb-6 animate-rise" noValidate>
      {error && <ErrorAlert message={error} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <select value={form.empleado_id} onChange={setF('empleado_id')}
            className={selectCls(errEmpleado)}>
            <option value="">Empleado...</option>
            {empleados.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre_completo}</option>
            ))}
          </select>
          {errEmpleado && <p className="text-xs text-red-600 mt-1">{errEmpleado}</p>}
        </div>
        <input placeholder="N° Póliza" value={form.numero_poliza} maxLength={50}
          onChange={setF('numero_poliza')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-colors" />
        <div>
          <input type="date" value={form.fecha_afiliacion} onChange={setF('fecha_afiliacion')}
            required className={inputCls(null)} />
        </div>
        <div>
          <select value={form.plan_contratado} onChange={setF('plan_contratado')}
            required className={selectCls(null)}>
            <option value="">Plan...</option>
            <option>Plan Básico</option>
            <option>Plan Plus</option>
            <option>Plan Platinum 2</option>
          </select>
        </div>
        <div>
          <input type="number" step="0.01" min="0" placeholder="Prima (Bs)" value={form.monto_prima}
            onChange={setF('monto_prima')} required className={inputCls(errPrima)} />
          {errPrima && <p className="text-xs text-red-600 mt-1">{errPrima}</p>}
        </div>
        <input placeholder="Asesor" value={form.asesor} maxLength={150} onChange={setF('asesor')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-colors" />
      </div>
      <div className="flex flex-col-reverse sm:flex-row gap-2 mt-3 sm:justify-end">
        <button type="button" onClick={onClose}
          className="w-full sm:w-auto px-3 py-2.5 sm:py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
        <button type="submit" disabled={!!errEmpleado || !!errPrima}
          className="w-full sm:w-auto px-3 py-2.5 sm:py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-all active:scale-[0.98]">
          {editPoliza ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
