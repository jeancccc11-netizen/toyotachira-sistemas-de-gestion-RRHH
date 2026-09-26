export default function SolicitudForm({ empleados, form, setForm, error, onSubmit, onClose }) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-4 mb-6">
      {error && <div className="bg-red-50 text-red-600 text-sm p-2 rounded mb-3">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select value={form.empleado_id}
          onChange={(e) => setForm({ ...form, empleado_id: e.target.value })}
          required className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Empleado...</option>
          {empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre_completo}</option>)}
        </select>
        <input placeholder="Motivo (opcional)" value={form.motivo}
          onChange={(e) => setForm({ ...form, motivo: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fecha Salida</label>
          <input type="date" value={form.fecha_salida}
            onChange={(e) => setForm({ ...form, fecha_salida: e.target.value })}
            required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fecha Regreso</label>
          <input type="date" value={form.fecha_regreso}
            onChange={(e) => setForm({ ...form, fecha_regreso: e.target.value })}
            required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button type="button" onClick={onClose}
          className="px-3 py-1.5 text-sm border rounded-lg">Cancelar</button>
        <button type="submit"
          className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg">Enviar</button>
      </div>
    </form>
  );
}
