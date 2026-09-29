export default function FormField({ label, error, hint, className = '', required = false, ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-primary-600">*</span>}
        </label>
      )}
      <input
        {...props}
        aria-invalid={!!error || undefined}
        className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition-colors
          focus:ring-2 focus:ring-primary-500 focus:border-transparent
          ${error
            ? 'border-red-400 bg-red-50/40 focus:ring-red-300'
            : 'border-gray-300 focus:border-transparent'}`}
      />
      {error
        ? <p className="text-xs text-red-600 mt-1">{error}</p>
        : hint ? <p className="text-xs text-gray-400 mt-1">{hint}</p> : null}
    </div>
  );
}
