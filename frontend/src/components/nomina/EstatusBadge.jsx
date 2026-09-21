import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import api from '../../api/client';
import Badge from '../ui/Badge';

const statuses = ['Borrador', 'Procesada', 'Aprobada', 'Pagada'];

export default function EstatusBadge({ periodo, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(periodo.estatus);

  const save = async () => {
    try {
      await api.put(`/nomina/periodos/${periodo.id}`, { estatus: val });
      setEditing(false);
      if (onUpdated) onUpdated();
    } catch { setEditing(false); }
  };

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        <select value={val} onChange={(e) => setVal(e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500">
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button onClick={save} className="text-green-600"><Check size={14} /></button>
        <button onClick={() => setEditing(false)} className="text-gray-500 hover:text-red-600"><X size={14} /></button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 cursor-pointer" onClick={() => setEditing(true)}>
      <Badge value={periodo.estatus} />
      <Pencil size={12} className="text-gray-400 hover:text-primary-600" />
    </span>
  );
}
