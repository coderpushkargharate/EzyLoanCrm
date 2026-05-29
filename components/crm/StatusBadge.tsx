import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  'New': 'bg-blue-100 text-blue-700',
  'No Response': 'bg-pink-100 text-pink-700',
  'Cold': 'bg-sky-100 text-sky-700',
  'Warm': 'bg-orange-100 text-orange-700',
  '1. Interested': 'bg-green-100 text-green-700',
  '0. Not Interested': 'bg-gray-800 text-white',
  'Lost': 'bg-red-500 text-white',
  'Converted': 'bg-emerald-500 text-white',
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600';
  const label = status.length > 12 ? status.slice(0, 12) + '...' : status;
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap',
        style
      )}
      title={status}
    >
      {label}
    </span>
  );
}
