import { Room, STATUS_CONFIG } from '@/types/housekeeping';
import { AlertTriangle, BellOff, Wrench, Ban } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onClick: (room: Room) => void;
}

export function RoomCard({ room, onClick }: RoomCardProps) {
  const config = STATUS_CONFIG[room.status];
  const hasJobOrders = room.jobOrders.some(j => !j.completed);

  return (
    <button
      onClick={() => onClick(room)}
      className={`relative flex flex-col items-center justify-center rounded-xl p-4 min-h-[100px] transition-all hover:scale-105 hover:shadow-lg ${config.className} shadow-sm`}
    >
      {/* Flags */}
      <div className="absolute top-1.5 right-1.5 flex gap-1">
        {room.isPriority && (
          <span className="bg-room-priority rounded-full p-1" title="Priority">
            <AlertTriangle className="h-3 w-3 text-primary-foreground" />
          </span>
        )}
        {room.isDND && (
          <span className="bg-room-dnd rounded-full p-1" title="DND">
            <BellOff className="h-3 w-3 text-primary-foreground" />
          </span>
        )}
        {room.isServiceRefused && (
          <span className="bg-room-serviceRefused rounded-full p-1" title="Service Refused">
            <Ban className="h-3 w-3 text-primary-foreground" />
          </span>
        )}
        {hasJobOrders && (
          <span className="bg-foreground/30 rounded-full p-1" title="Active Job Order">
            <Wrench className="h-3 w-3" />
          </span>
        )}
      </div>

      <span className="text-2xl font-bold leading-none">{room.number}</span>
      <span className="mt-1 text-xs font-medium opacity-80 uppercase tracking-wide">{config.label}</span>
      {room.missingItems.length > 0 && (
        <span className="mt-1 text-[10px] opacity-70">{room.missingItems.length} item(s) noted</span>
      )}
    </button>
  );
}
