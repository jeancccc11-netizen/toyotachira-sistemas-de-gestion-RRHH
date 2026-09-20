import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api/client';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProfileCard from '../components/empleado/ProfileCard';
import PerfilTab from '../components/empleado/PerfilTab';
import PhotoTab from '../components/empleado/PhotoTab';
import DocsTab from '../components/empleado/DocsTab';
import ExamenesTab from '../components/empleado/ExamenesTab';

const tabs = [['perfil', 'Perfil'], ['foto', 'Foto'], ['docs', 'Documentos'], ['examenes', 'Exámenes']];

export default function EmpleadoDetail() {
  const { id } = useParams();
  const [empleado, setEmpleado] = useState(null);
  const [docs, setDocs] = useState([]);
  const [examenes, setExamenes] = useState([]);
  const [tab, setTab] = useState('perfil');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [e, d, ex] = await Promise.all([
      api.get(`/empleados/${id}`),
      api.get(`/documentos/empleado/${id}`),
      api.get(`/examenes/empleado/${id}`),
    ]);
    setEmpleado(e.data); setDocs(d.data);
    setExamenes(ex.data); setLoading(false);
  };
  useEffect(() => { load(); }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!empleado) return <p className="text-red-500">Empleado no encontrado</p>;

  return (
    <div>
      <Link to="/empleados" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4">
        <ArrowLeft size={16} /> Volver
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ProfileCard emp={{ ...empleado, id }} docs={docs} onTabChange={setTab} />
        </div>
        <div className="lg:col-span-2">
          <div className="flex gap-2 mb-4">
            {tabs.map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  tab === k ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>{l}</button>
            ))}
          </div>
          {tab === 'perfil' && <PerfilTab emp={empleado} />}
          {tab === 'foto' && <PhotoTab empleado={empleado} onRefresh={load} />}
          {tab === 'docs' && <DocsTab docs={docs} empleadoId={id} onRefresh={load} />}
          {tab === 'examenes' && <ExamenesTab examenes={examenes} empleadoId={id} onRefresh={load} />}
        </div>
      </div>
    </div>
  );
}
