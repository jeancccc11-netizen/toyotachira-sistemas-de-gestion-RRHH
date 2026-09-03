import Badge from '../ui/Badge';

export default function PeriodoSelector({ periodos, selected, onSelect }) {
  return (
    <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
      {periodos.map((p) => (
        <button key={p.id} onClick={() => onSelect(p)}
          className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            selected?.id === p.id
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}>
          {p.quincena}° Q · {p.mes}/{p.anio}
          <span className="ml-2"><Badge value={p.estatus} /></span>
        </button>
      ))}
    </div>
  );
}
