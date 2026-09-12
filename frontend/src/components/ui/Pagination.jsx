import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <span className="text-xs text-gray-500">
        Página {page} de {totalPages}
      </span>
      <div className="flex gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft size={16} />
        </button>
        {pages[0] > 1 && <span className="px-2 py-1 text-xs text-gray-400">…</span>}
        {pages.map((p) => (
          <button key={p} onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-xs font-medium ${
              p === page ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'
            }`}>{p}</button>
        ))}
        {pages[pages.length - 1] < totalPages && (
          <span className="px-2 py-1 text-xs text-gray-400">…</span>
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
