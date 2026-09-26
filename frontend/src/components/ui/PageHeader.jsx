export default function PageHeader({ title, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
      {action}
    </div>
  );
}
