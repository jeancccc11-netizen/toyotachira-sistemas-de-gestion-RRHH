import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (estado) params.estado_operativo = estado;
      const res = await api.get('/empleados', { params });
      setEmpleados(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [search, estado]);

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Eliminar a ${nombre}?`)) return;
    try { await api.delete(`/empleados/${id}`); load(); }
    catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  return (
    <div>
      <PageHeader title="Empleados"
        action={<Link to="/empleados/new" className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700"><Plus size={16} /> Nuevo Empleado</Link>} />
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input type="text" placeholder="Buscar por nombre, cédula o N°..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm" />
        </div>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Todos</option>
          <option>Activo</option><option>Vacaciones</option><option>Reposo</option><option>Egreso</option>
        </select>
      </div>
      {loading ? <LoadingSpinner /> : empleados.length === 0 ? <p className="text-gray-500">No se encontraron empleados</p> : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left"><tr><th className="px-4 py-3">N°</th><th>Nombre</th><th>Cédula</th><th>Depto.</th><th>Cargo</th><th>Estado</th><th className="text-right">Acciones</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {empleados.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><Link to={`/empleados/${emp.id}`} className="text-primary-600 hover:underline font-medium">{emp.nro}</Link></td>
                  <td className="font-medium">{emp.nombre_completo}</td>
                  <td className="text-gray-500">{emp.cedula}</td>
                  <td>{emp.departamento}</td>
                  <td className="text-gray-500">{emp.posicion_cargo}</td>
                  <td><Badge value={emp.estado_operativo} /></td>
                  <td className="text-right flex items-center justify-end gap-2">
                    <Link to={`/empleados/${emp.id}/edit`} className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"><Pencil size={14} /></Link>
                    <button onClick={() => handleDelete(emp.id, emp.nombre_completo)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
