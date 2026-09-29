export default function LoadingSpinner({ text = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3" role="status" aria-live="polite">
      <span className="relative flex w-10 h-10">
        <span className="absolute inset-0 rounded-full border-[3px] border-gray-200" />
        <span className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary-600 animate-spin" />
      </span>
      <span className="text-gray-500 text-sm animate-pulse-soft">{text}</span>
    </div>
  );
}
