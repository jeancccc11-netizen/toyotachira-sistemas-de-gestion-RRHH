import { X } from 'lucide-react';

/**
 * Modal responsive con animación de entrada:
 *  - móvil: bottom-sheet (anclado abajo, ancho completo, con asa y scroll propio)
 *  - desktop: centrado, con fade del fondo y pop del panel
 */
export default function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-2xl
          max-h-[92vh] sm:max-h-[90vh] overflow-auto p-4 sm:p-6
          pb-[max(1rem,env(safe-area-inset-bottom))] animate-slide-up sm:animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Asa del bottom-sheet (solo móvil) */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-gray-300 mx-auto mb-3" aria-hidden="true" />
        <div className="flex items-center justify-between mb-4 gap-3">
          <h3 className="font-bold text-base sm:text-lg leading-snug">{title}</h3>
          <button onClick={onClose} aria-label="Cerrar"
            className="p-1.5 -mr-1 text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-200 shrink-0">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
