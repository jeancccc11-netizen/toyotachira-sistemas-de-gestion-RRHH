import { useState } from 'react';

const ROLES = [
  { value: 'consulta', label: 'Consulta (solo lectura)' },
  { value: 'rrhh', label: 'RRHH (personal, vacaciones, seguro)' },
  { value: 'nómina', label: 'Nómina' },
  { value: 'admin', label: 'Administrador (total)' },
];

/**
 * Formulario de usuarios en 3 modos:
 *  - crear:        username + contraseña + rol + empleado
 *  - editar:       username + rol + empleado + activo (sin contraseña)
 *  - password:     solo contraseña nueva
 */
export default function UserForm({ empleados, form, setForm, mode = 'crear', onSubmit, onClose }) {
  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onSubmit(e);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 mb-6">
      {mode === 'password' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña para <span className="font-bold">{form.username}</span>
            </label>
            <input type="password" placeholder="Mínimo 6 caracteres" value={form.password}
              onChange={setF('password')} required minLength={6}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" />
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <button type="button" onClick={onClose}
              className="px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
            <button type="submit"
              className="px-3 py-2.5 sm:py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Cambiar contraseña</button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input placeholder="Usuario" value={form.username} onChange={setF('username')}
                required className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            {mode === 'crear' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input type="password" placeholder="Mínimo 6 caracteres" value={form.password}
                  onChange={setF('password')} required minLength={6}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select value={form.rol} onChange={setF('rol')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full">
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empleado asociado</label>
              <select value={form.empleado_id || ''} onChange={setF('empleado_id')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full">
                <option value="">Sin empleado asociado</option>
                {empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre_completo}</option>)}
              </select>
            </div>
            {mode === 'editar' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select value={form.activo ? '1' : '0'} onChange={(e) => setForm({ ...form, activo: e.target.value === '1' })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full">
                  <option value="1">Activo</option>
                  <option value="0">Inactivo (no puede iniciar sesión)</option>
                </select>
              </div>
            )}
          </div>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          <div className="flex flex-col-reverse sm:flex-row gap-2 mt-3 sm:justify-end">
            <button type="button" onClick={onClose}
              className="w-full sm:w-auto px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
            <button type="submit"
              className="w-full sm:w-auto px-3 py-2.5 sm:py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              {mode === 'crear' ? 'Crear usuario' : 'Guardar cambios'}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
