import { useState } from 'react';
import { Room, RoomStatus, MissingItem, PRESET_ITEMS, STATUS_CONFIG, JobOrder } from '@/types/housekeeping';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, BellOff, Check, Plus, Trash2, Wrench, X } from 'lucide-react';

interface Props {
  room: Room | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (roomId: string, updates: Partial<Room>) => void;
}

export function RoomInspectionModal({ room, open, onClose, onUpdate }: Props) {
  const [missingItems, setMissingItems] = useState<MissingItem[]>([]);
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [status, setStatus] = useState<RoomStatus>('vacant');
  const [isPriority, setIsPriority] = useState(false);
  const [isDND, setIsDND] = useState(false);
  const [notes, setNotes] = useState('');

  // Item adding state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [customItem, setCustomItem] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemType, setItemType] = useState<'missing' | 'damaged'>('missing');

  // Job order state
  const [jobDescription, setJobDescription] = useState('');

  // Sync state when room changes
  const [prevRoomId, setPrevRoomId] = useState<string | null>(null);
  if (room && room.id !== prevRoomId) {
    setPrevRoomId(room.id);
    setMissingItems([...room.missingItems]);
    setJobOrders([...room.jobOrders]);
    setStatus(room.status);
    setIsPriority(room.isPriority);
    setIsDND(room.isDND);
    setNotes(room.notes || '');
    setSelectedItems([]);
    setCustomItem('');
    setItemQuantity(1);
  }

  if (!room) return null;

  const toggleItem = (item: string) => {
    setSelectedItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const addItems = () => {
    const names = [...selectedItems];
    if (customItem.trim()) names.push(customItem.trim());
    if (names.length === 0) return;

    const newItems: MissingItem[] = names.map(name => ({
      name,
      quantity: itemQuantity,
      type: itemType,
    }));
    setMissingItems(prev => [...prev, ...newItems]);
    setSelectedItems([]);
    setCustomItem('');
    setItemQuantity(1);
  };

  const removeItem = (index: number) => {
    setMissingItems(prev => prev.filter((_, i) => i !== index));
  };

  const addJobOrder = () => {
    if (!jobDescription.trim()) return;
    const jo: JobOrder = {
      id: Date.now().toString(),
      description: jobDescription.trim(),
      createdAt: new Date(),
      completed: false,
    };
    setJobOrders(prev => [...prev, jo]);
    setJobDescription('');
    // Auto-block room when job order is created
    setStatus('blocked');
  };

  const completeJobOrder = (id: string) => {
    const updated = jobOrders.map(j => j.id === id ? { ...j, completed: true } : j);
    setJobOrders(updated);
    // If all job orders completed, release room to vacant
    if (updated.every(j => j.completed)) {
      setStatus('vacant');
    }
  };

  const handleSave = () => {
    onUpdate(room.id, {
      status,
      isPriority,
      isDND,
      missingItems,
      jobOrders,
      notes,
      lastInspected: new Date(),
    });
    onClose();
  };

  const statusConfig = STATUS_CONFIG[status];
  // removed unused state

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 font-display text-2xl">
            <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-lg font-bold ${statusConfig.className}`}>
              {room.number}
            </span>
            <div>
              <div>Room {room.number}</div>
              <div className="text-sm font-sans font-normal text-muted-foreground">Floor {room.floor}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="status" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="items">Items ({missingItems.length})</TabsTrigger>
            <TabsTrigger value="jobs">Job Orders ({jobOrders.filter(j => !j.completed).length})</TabsTrigger>
          </TabsList>

          {/* STATUS TAB */}
          <TabsContent value="status" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Room Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as RoomStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={isPriority} onCheckedChange={setIsPriority} />
                <Label className="flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-room-priority" /> Priority
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isDND} onCheckedChange={setIsDND} />
                <Label className="flex items-center gap-1.5">
                  <BellOff className="h-4 w-4 text-room-dnd" /> Do Not Disturb
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..." rows={3} />
            </div>

            {room.lastInspected && (
              <p className="text-xs text-muted-foreground">
                Last inspected: {room.lastInspected.toLocaleString()}
              </p>
            )}
          </TabsContent>

          {/* ITEMS TAB */}
          <TabsContent value="items" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Select value={itemType} onValueChange={(v) => setItemType(v as 'missing' | 'damaged')}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="missing">Missing</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  value={itemQuantity}
                  onChange={e => setItemQuantity(Number(e.target.value))}
                  className="w-20"
                  placeholder="Qty"
                />
              </div>

              {/* Preset items grid */}
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 rounded-lg bg-secondary/50">
                {PRESET_ITEMS.map(item => (
                  <button
                    key={item}
                    onClick={() => toggleItem(item)}
                    className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                      selectedItems.includes(item)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-foreground hover:bg-accent border border-border'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Custom item */}
              <div className="flex gap-2">
                <Input
                  value={customItem}
                  onChange={e => setCustomItem(e.target.value)}
                  placeholder="Add custom item..."
                  className="flex-1"
                />
                <Button onClick={addItems} size="sm" disabled={selectedItems.length === 0 && !customItem.trim()}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>

            {/* Listed items */}
            {missingItems.length > 0 && (
              <div className="space-y-1.5">
                <Label>Noted Items</Label>
                {missingItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant={item.type === 'damaged' ? 'destructive' : 'secondary'} className="text-[10px]">
                        {item.type}
                      </Badge>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground">×{item.quantity}</span>
                    </div>
                    <button onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* JOB ORDERS TAB */}
          <TabsContent value="jobs" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Describe the issue (e.g., 'Broken bathroom mirror')..."
                className="flex-1"
              />
              <Button onClick={addJobOrder} size="sm" disabled={!jobDescription.trim()}>
                <Wrench className="h-4 w-4 mr-1" /> Create
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Creating a job order automatically blocks the room (purple). Completing all orders releases it.
            </p>

            {jobOrders.length > 0 && (
              <div className="space-y-2">
                {jobOrders.map(jo => (
                  <div key={jo.id} className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm ${
                    jo.completed ? 'bg-room-vacant/10' : 'bg-room-blocked/10'
                  }`}>
                    <div className="flex items-center gap-2">
                      {jo.completed ? (
                        <Check className="h-4 w-4 text-room-vacant" />
                      ) : (
                        <Wrench className="h-4 w-4 text-room-blocked" />
                      )}
                      <span className={jo.completed ? 'line-through text-muted-foreground' : 'font-medium'}>
                        {jo.description}
                      </span>
                    </div>
                    {!jo.completed && (
                      <Button size="sm" variant="outline" onClick={() => completeJobOrder(jo.id)}>
                        <Check className="h-3.5 w-3.5 mr-1" /> Done
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
