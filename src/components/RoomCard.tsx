import { Room, STATUS_CONFIG } from '@/types/housekeeping';
import { AlertTriangle, BellOff, Wrench, Ban, Sofa, Check } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onClick: (room: Room) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (room: Room) => void;
  showReleaseBadge?: boolean;
}

export function RoomCard({ room, onClick, selectionMode, isSelected, onToggleSelect, showReleaseBadge }: RoomCardProps) {
  const config = STATUS_CONFIG[room.status];
  const hasJobOrders = room.jobOrders.some(j => !j.completed);
  const release = room.releaseStatus ?? 'none';

  const handleClick = () => {
    if (selectionMode && onToggleSelect) {
      onToggleSelect(room);
    } else {
      onClick(room);
    }
  };

  // Apply release visual if released (only when showReleaseBadge true OR always reflect on the card)
  const releaseOverlayClass =
    release === 'partial'
      ? 'bg-gradient-to-br from-room-vacant via-room-vacant to-room-occupied text-white'
      : '';

  return (
    <button
      onClick={handleClick}
      className={`relative flex flex-col items-center justify-center rounded-xl p-4 min-h-[100px] transition-all hover:scale-105 hover:shadow-lg shadow-sm ${releaseOverlayClass || config.className} ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
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
        {room.isSofaCumBedDone && (
          <span className="bg-room-sofaCumBed rounded-full p-1" title="Sofa Cum Bed Done">
            <Sofa className="h-3 w-3 text-primary-foreground" />
          </span>
        )}
        {hasJobOrders && (
          <span className="bg-foreground/30 rounded-full p-1" title="Active Job Order">
            <Wrench className="h-3 w-3" />
          </span>
        )}
      </div>

      {/* Released — clean: medium tick mark, positioned lower so number/status remain visible */}
      {release === 'clean' && (
        <div className="absolute inset-x-0 bottom-1 flex items-center justify-center pointer-events-none">
          <div className="bg-room-vacant rounded-full p-1.5 shadow-lg ring-2 ring-white/80">
            <Check className="h-5 w-5 text-white" strokeWidth={4} />
          </div>
        </div>
      )}

      {/* Released — partial: tick with warning hint, positioned lower */}
      {release === 'partial' && (
        <div className="absolute inset-x-0 bottom-1 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 rounded-full p-1.5 shadow-lg">
            <Check className="h-5 w-5 text-room-vacant" strokeWidth={4} />
          </div>
        </div>
      )}

      <span className="text-2xl font-bold leading-none">{room.number}</span>
      <span className="mt-1 text-xs font-medium opacity-80 uppercase tracking-wide">{config.label}</span>
      {room.missingItems.length > 0 && (
        <span className="mt-1 text-[10px] opacity-70">{room.missingItems.length} item(s) noted</span>
      )}
    </button>
  );
}
