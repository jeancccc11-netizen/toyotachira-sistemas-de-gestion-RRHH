import Modal from '../ui/Modal';
import ErrorAlert from '../ui/ErrorAlert';

const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function PeriodoForm({ form, setForm, error, onSubmit, onClose }) {
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <Modal title="Nuevo Período de Nómina" onClose={onClose}>
      <ErrorAlert message={error} />
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Quincena</label>
            <select value={form.quincena} onChange={set('quincena')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="1">1ra Quincena</option>
              <option value="2">2da Quincena</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mes</label>
            <select value={form.mes} onChange={set('mes')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Año</label>
            <input type="number" value={form.anio} onChange={set('anio')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fecha Inicio</label>
            <input type="date" value={form.fecha_inicio} onChange={set('fecha_inicio')} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fecha Fin</label>
            <input type="date" value={form.fecha_fin} onChange={set('fecha_fin')} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Estatus</label>
            <select value={form.estatus} onChange={set('estatus')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="Borrador">Borrador</option>
              <option value="Procesada">Procesada</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Pagada">Pagada</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={onClose}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
          <button type="submit"
            className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Crear Período</button>
        </div>
      </form>
    </Modal>
  );
}
