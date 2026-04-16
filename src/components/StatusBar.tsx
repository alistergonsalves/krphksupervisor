import { STATUS_CONFIG, RoomStatus } from '@/types/housekeeping';
import { AlertTriangle, BellOff, Ban, Sofa } from 'lucide-react';

interface StatusBarProps {
  stats: Record<string, number>;
  activeFilter: RoomStatus | 'all' | 'priority' | 'dnd' | 'serviceRefused' | 'sofaCumBedDone';
  onFilterChange: (filter: RoomStatus | 'all' | 'priority' | 'dnd' | 'serviceRefused' | 'sofaCumBedDone') => void;
}

export function StatusBar({ stats, activeFilter, onFilterChange }: StatusBarProps) {
  const items: { key: string; label: string; count: number; className: string }[] = [
    { key: 'all', label: 'All Rooms', count: stats.total, className: 'bg-foreground/10 text-foreground' },
    ...Object.entries(STATUS_CONFIG).map(([key, val]) => ({
      key,
      label: val.label,
      count: stats[key] || 0,
      className: val.className,
    })),
    { key: 'priority', label: 'Priority', count: stats.priority, className: 'bg-room-priority text-primary-foreground' },
    { key: 'dnd', label: 'DND', count: stats.dnd, className: 'bg-room-dnd text-primary-foreground' },
    { key: 'serviceRefused', label: 'Service Refused', count: stats.serviceRefused, className: 'bg-room-serviceRefused text-primary-foreground' },
    { key: 'sofaCumBedDone', label: 'Sofa Cum Bed', count: stats.sofaCumBedDone, className: 'bg-room-sofaCumBed text-primary-foreground' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <button
          key={item.key}
          onClick={() => onFilterChange(item.key as any)}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            activeFilter === item.key
              ? `${item.className} shadow-md scale-105`
              : 'bg-card text-muted-foreground hover:bg-secondary border border-border'
          }`}
        >
          {item.key === 'priority' && <AlertTriangle className="h-3.5 w-3.5" />}
          {item.key === 'dnd' && <BellOff className="h-3.5 w-3.5" />}
          {item.key === 'serviceRefused' && <Ban className="h-3.5 w-3.5" />}
          {item.key === 'sofaCumBedDone' && <Sofa className="h-3.5 w-3.5" />}
          <span>{item.label}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            activeFilter === item.key ? 'bg-background/20' : 'bg-secondary'
          }`}>
            {item.count}
          </span>
        </button>
      ))}
    </div>
  );
}
