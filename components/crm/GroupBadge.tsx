import { cn } from '@/lib/utils';
import { groupStyle } from '@/lib/groups';

export default function GroupBadge({
  group,
  className,
}: {
  group: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap',
        groupStyle(group),
        className
      )}
      title={group}
    >
      {group}
    </span>
  );
}
