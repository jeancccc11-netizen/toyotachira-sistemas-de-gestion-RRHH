import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'No hay datos', icon }) {
  const Icon = icon || Inbox;
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 gap-2 animate-fade-in">
      <div className="p-3 rounded-full bg-gray-100">
        <Icon size={22} className="text-gray-400" />
      </div>
      <p className="text-gray-500 text-sm text-center">{message}</p>
    </div>
  );
}
