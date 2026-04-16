import { RoomStatus, STATUS_CONFIG } from '@/types/housekeeping';
import { Button } from '@/components/ui/button';
import { CheckSquare, X, XSquare } from 'lucide-react';

interface Props {
  selectedCount: number;
  totalVisible: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onApplyStatus: (status: RoomStatus) => void;
  onCancel: () => void;
}

export function BulkActionBar({ selectedCount, totalVisible, onSelectAll, onDeselectAll, onApplyStatus, onCancel }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-card border border-border p-3 shadow-md">
      <div className="flex items-center gap-2 mr-2">
        <span className="text-sm font-semibold text-foreground">{selectedCount} selected</span>
        <Button variant="ghost" size="sm" onClick={selectedCount < totalVisible ? onSelectAll : onDeselectAll} className="text-xs h-7">
          {selectedCount < totalVisible ? (
            <><CheckSquare className="h-3.5 w-3.5 mr-1" /> Select All</>
          ) : (
            <><XSquare className="h-3.5 w-3.5 mr-1" /> Deselect All</>
          )}
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs text-muted-foreground self-center mr-1">Set to:</span>
        {(Object.entries(STATUS_CONFIG) as [RoomStatus, { label: string; className: string }][]).map(([key, val]) => (
          <Button
            key={key}
            size="sm"
            disabled={selectedCount === 0}
            onClick={() => onApplyStatus(key)}
            className={`h-7 text-xs ${val.className}`}
          >
            {val.label}
          </Button>
        ))}
      </div>

      <Button variant="ghost" size="icon" onClick={onCancel} className="ml-auto h-7 w-7">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
