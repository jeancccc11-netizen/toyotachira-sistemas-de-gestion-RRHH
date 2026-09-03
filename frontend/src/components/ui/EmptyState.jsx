export default function EmptyState({ message = 'No hay datos' }) {
  return <p className="p-4 text-gray-500 text-sm">{message}</p>;
}
