import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);
let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  };

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const colors = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  warning: 'bg-amber-600',
  info: 'bg-gray-700',
};

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 inset-x-4 sm:inset-x-auto sm:right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div key={t.id}
          className={`${colors[t.type]} text-white px-4 py-3 rounded-lg shadow-lg text-sm flex items-center justify-between sm:min-w-[280px] animate-slide-in`}>
          <span>{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="ml-3 opacity-70 hover:opacity-100">×</button>
        </div>
      ))}
    </div>
  );
}
