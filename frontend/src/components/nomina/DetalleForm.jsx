import Modal from '../ui/Modal';
import NumField from '../ui/NumField';
import ErrorAlert from '../ui/ErrorAlert';

export default function DetalleForm({ form, setForm, empleados, editing, error, onSubmit, onClose }) {
  const handleEmpleadoSelect = (empId) => {
    const emp = empleados.find((e) => e.id === parseInt(empId));
    setForm({ ...form, empleado_id: empId, sueldo_base: emp ? emp.salario_base : '' });
  };

  const set = (k) => (v) => setForm({ ...form, [k]: v });

  return (
    <Modal title={`${editing ? 'Editar' : 'Agregar'} Detalle de Nómina`} onClose={onClose}>
      <ErrorAlert message={error} />
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Empleado</label>
          <select value={form.empleado_id} onChange={(e) => handleEmpleadoSelect(e.target.value)}
            disabled={!!editing} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-100">
            <option value="">Seleccionar empleado...</option>
            {empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre_completo} — {e.cedula}</option>)}
          </select>
        </div>
        <h4 className="text-sm font-semibold text-green-700 mb-2">📈 Asignaciones</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <NumField label="Sueldo Base" value={form.sueldo_base} onChange={set('sueldo_base')} />
          <NumField label="Comisión" value={form.comision_mensual} onChange={set('comision_mensual')} />
          <NumField label="Bonificación" value={form.bonificacion} onChange={set('bonificacion')} />
          <NumField label="Vacaciones" value={form.asignacion_vacaciones} onChange={set('asignacion_vacaciones')} />
          <NumField label="Bonos" value={form.asignacion_bonos} onChange={set('asignacion_bonos')} />
          <NumField label="Extra" value={form.asignacion_extra} onChange={set('asignacion_extra')} />
        </div>
        <h4 className="text-sm font-semibold text-red-700 mb-2">📉 Deducciones</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <NumField label="Seg. Social" value={form.deduccion_seguro_social} onChange={set('deduccion_seguro_social')} />
          <NumField label="PARO" value={form.deduccion_paro} onChange={set('deduccion_paro')} />
          <NumField label="INCES" value={form.deduccion_inces} onChange={set('deduccion_inces')} />
          <NumField label="ISLR" value={form.deduccion_islr} onChange={set('deduccion_islr')} />
          <NumField label="Urosalud" value={form.deduccion_urosalud} onChange={set('deduccion_urosalud')} />
          <NumField label="Anticipos" value={form.deduccion_anticipos} onChange={set('deduccion_anticipos')} />
          <NumField label="Otros" value={form.deduccion_otros} onChange={set('deduccion_otros')} />
        </div>
        <div className="flex gap-2 pt-3 border-t">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
          <button type="submit"
            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Guardar</button>
        </div>
      </form>
    </Modal>
  );
}
