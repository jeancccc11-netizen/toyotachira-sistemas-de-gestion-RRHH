export default function UserForm({ empleados, form, setForm, onSubmit, onClose }) {
  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Usuario" value={form.username} onChange={setF('username')}
          required className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input type="password" placeholder="Contraseña" value={form.password}
          onChange={setF('password')} required minLength={6}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <select value={form.rol} onChange={setF('rol')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="consulta">Consulta (solo lectura)</option>
          <option value="operador">Operador (crear/editar)</option>
          <option value="admin">Administrador (total)</option>
        </select>
        <select value={form.empleado_id} onChange={setF('empleado_id')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Sin empleado asociado</option>
          {empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre_completo}</option>)}
        </select>
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
