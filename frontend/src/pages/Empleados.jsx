import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import useRole from '../hooks/useRole';
import useConfirm from '../hooks/useConfirm';
import usePagination from '../hooks/usePagination';
import { useToast } from '../context/ToastContext';

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const { canWrite, canDelete } = useRole();
  const toast = useToast();
  const { confirm, state: cState, handleConfirm, handleCancel } = useConfirm();
  const { page, totalPages, items, goTo, reset } = usePagination(empleados);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (estado) params.estado_operativo = estado;
      const res = await api.get('/empleados', { params });
      setEmpleados(res.data);
    } catch (err) { toast.error('Error al cargar empleados'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [search, estado]);
  useEffect(() => { reset(); }, [search, estado]);

  const handleDelete = async (id, nombre) => {
    const ok = await confirm(`¿Eliminar a ${nombre}?`);
    if (!ok) return;
    try { await api.delete(`/empleados/${id}`); toast.success('Empleado eliminado'); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  return (
    <div>
      {cState.show && <ConfirmDialog message={cState.message} onConfirm={handleConfirm} onCancel={handleCancel} />}
      <PageHeader title="Empleados" action={canWrite && (
        <Link to="/empleados/new" className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700"><Plus size={16} /> Nuevo Empleado</Link>
      )} />
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input type="text" placeholder="Buscar por nombre, cédula o N°..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm" />
        </div>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Todos</option>
          <option>Activo</option><option>Vacaciones</option><option>Reposo</option><option>Egreso</option>
        </select>
      </div>
      {loading ? <LoadingSpinner /> : items.length === 0 ? <p className="text-gray-500">No se encontraron empleados</p> : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm min-w-[760px] whitespace-nowrap rwd">
            <thead className="bg-gray-50 text-left"><tr><th className="px-4 py-3">Nombre</th><th>N°</th><th>Cédula</th><th>Depto.</th><th>Cargo</th><th>Estado</th><th className="text-right">Acciones</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><Link to={`/empleados/${emp.id}`} className="text-primary-600 hover:underline">{emp.nombre_completo}</Link></td>
                  <td data-label="N°" className="text-gray-500">{emp.nro}</td>
                  <td data-label="Cédula" className="text-gray-500">{emp.cedula}</td>
                  <td data-label="Depto.">{emp.departamento}</td>
                  <td data-label="Cargo" className="text-gray-500">{emp.posicion_cargo}</td>
                  <td data-label="Estado"><Badge value={emp.estado_operativo} /></td>
                  <td data-label="Acciones" className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canWrite && <Link to={`/empleados/${emp.id}/edit`} className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"><Pencil size={14} /></Link>}
                      {canDelete && <button onClick={() => handleDelete(emp.id, emp.nombre_completo)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 size={14} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPageChange={goTo} />
        </div>
      )}
    </div>
  );
}
