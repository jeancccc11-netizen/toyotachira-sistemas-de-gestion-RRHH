export default function PageHeader({ title, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 mb-6 animate-rise">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}
