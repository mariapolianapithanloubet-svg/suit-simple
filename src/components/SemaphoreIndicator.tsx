import { getSemaphoreStatus, SemaphoreStatus } from '@/types/process';
import { cn } from '@/lib/utils';

interface SemaphoreIndicatorProps {
  date: string;
  size?: 'sm' | 'md';
}

const labels: Record<SemaphoreStatus, string> = {
  green: 'Em dia',
  yellow: 'Atenção',
  red: 'Atrasado',
};

export function SemaphoreIndicator({ date, size = 'sm' }: SemaphoreIndicatorProps) {
  const status = getSemaphoreStatus(date);

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          'inline-block rounded-full ring-2',
          size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5',
          status === 'green' && 'bg-semaphore-green ring-semaphore-green/20',
          status === 'yellow' && 'bg-semaphore-yellow ring-semaphore-yellow/20 animate-pulse-soft',
          status === 'red' && 'bg-semaphore-red ring-semaphore-red/20 animate-pulse-soft',
        )}
      />
      {size === 'md' && (
        <span className={cn(
          'text-[11px] font-medium',
          status === 'green' && 'text-semaphore-green',
          status === 'yellow' && 'text-semaphore-yellow',
          status === 'red' && 'text-semaphore-red',
        )}>
          {labels[status]}
        </span>
      )}
    </div>
  );
}
