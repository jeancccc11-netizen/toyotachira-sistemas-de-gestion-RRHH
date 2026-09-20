import ErrorAlert from '../ui/ErrorAlert';

export default function PolizaForm({ form, setF, empleados, editPoliza, error, onSubmit, onClose }) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-4 mb-6">
      {error && <ErrorAlert message={error} />}
      <div className="grid grid-cols-2 gap-3">
        <select value={form.empleado_id} onChange={setF('empleado_id')}
          required className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Empleado...</option>
          {empleados.map((e) => (
            <option key={e.id} value={e.id}>{e.nombre_completo}</option>
          ))}
        </select>
        <input placeholder="N° Póliza" value={form.numero_poliza}
          onChange={setF('numero_poliza')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input type="date" value={form.fecha_afiliacion} onChange={setF('fecha_afiliacion')}
          required className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <select value={form.plan_contratado} onChange={setF('plan_contratado')}
          required className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Plan...</option>
          <option>Plan Básico</option>
          <option>Plan Plus</option>
          <option>Plan Platinum 2</option>
        </select>
        <input type="number" step="0.01" placeholder="Prima (Bs)" value={form.monto_prima}
          onChange={setF('monto_prima')} required
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Asesor" value={form.asesor} onChange={setF('asesor')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="flex gap-2 mt-3">
        <button type="button" onClick={onClose}
          className="px-3 py-1.5 text-sm border rounded-lg">Cancelar</button>
        <button type="submit"
          className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg">
          {editPoliza ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
