import { Link } from 'react-router-dom';
import { Users, Calendar, Shield, FileText, Clipboard, Building2 } from 'lucide-react';
import useApi from '../hooks/useApi';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const KPICard = ({ icon, title, value, link }) => {
  const content = <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3"><div className="p-2 bg-gray-100 rounded-lg">{icon}</div><div><p className="text-xs text-gray-500">{title}</p><p className="text-xl font-bold">{value}</p></div></div>;
  return link ? <Link to={link} className="hover:shadow-md transition-shadow">{content}</Link> : content;
};

const QuickLink = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center gap-3 bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">{icon}<span className="text-sm font-medium">{label}</span></Link>
);

export default function Dashboard() {
  const { data: stats, loading } = useApi('/dashboard');

  if (loading) return <LoadingSpinner />;
  if (!stats) return <p className="text-red-500">Error al cargar datos</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <KPICard icon={<Users className="text-blue-500" />} title="Total Empleados" value={stats.empleados?.total || 0} link="/empleados" />
        <KPICard icon={<Users className="text-green-500" />} title="Activos" value={stats.empleados?.activos || 0} />
        <KPICard icon={<Calendar className="text-yellow-500" />} title="Vacaciones" value={stats.empleados?.vacaciones || 0} link="/vacaciones" />
        <KPICard icon={<Shield className="text-red-500" />} title="Reposos" value={stats.reposos_activos || 0} link="/examenes" />
        <KPICard icon={<FileText className="text-purple-500" />} title="Solicitudes" value={stats.solicitudes_pendientes || 0} link="/vacaciones" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center gap-2 mb-3"><Shield size={18} className="text-primary-600" /><h3 className="font-semibold text-sm">Urosalud</h3></div>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-500">Pólizas Activas</p><p className="text-2xl font-bold">{stats.polizas?.total || 0}</p></div>
            <div><p className="text-xs text-gray-500">Prima Total</p><p className="text-2xl font-bold text-primary-600">{parseFloat(stats.polizas?.prima_total || 0).toFixed(2)} Bs</p></div>
          </div>
          <Link to="/urosalud" className="text-xs text-primary-600 hover:underline mt-2 inline-block">Ver panel →</Link>
        </div>
        {stats.ultima_nomina && (
          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center gap-2 mb-3"><FileText size={18} className="text-green-600" /><h3 className="font-semibold text-sm">Última Nómina</h3></div>
            <p className="text-lg font-bold">{stats.ultima_nomina.quincena}° Q · {stats.ultima_nomina.mes}/{stats.ultima_nomina.anio}</p>
            <Link to="/nomina" className="text-xs text-primary-600 hover:underline mt-2 inline-block">Ver nómina →</Link>
          </div>
        )}
      </div>
      <h2 className="text-lg font-semibold mb-4">Accesos Rápidos</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <QuickLink to="/empleados" icon={<Users />} label="Empleados" />
        <QuickLink to="/departamentos" icon={<Building2 />} label="Departamentos" />
        <QuickLink to="/vacaciones" icon={<Calendar />} label="Vacaciones" />
        <QuickLink to="/examenes" icon={<Clipboard />} label="Exámenes / Reposos" />
        <QuickLink to="/urosalud" icon={<Shield />} label="Urosalud" />
        <QuickLink to="/nomina" icon={<FileText />} label="Nómina" />
      </div>
    </div>
  );
}
