export default function SelectField({ label, value, onChange, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-xs text-gray-500 mb-1">{label}</label>}
      <select value={value} onChange={onChange} {...props}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
        {children}
      </select>
    </div>
  );
}
