import { useState } from 'react';
import { Room, RoomStatus, MissingItem, STATUS_CONFIG, JobOrder } from '@/types/housekeeping';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { AlertTriangle, BellOff, Ban, Check, Plus, Trash2, Wrench, X, Sofa, ChevronsUpDown, Search } from 'lucide-react';

interface Props {
  room: Room | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (roomId: string, updates: Partial<Room>) => void;
  presetItems: string[];
}

export function RoomInspectionModal({ room, open, onClose, onUpdate, presetItems }: Props) {
  const [missingItems, setMissingItems] = useState<MissingItem[]>([]);
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [status, setStatus] = useState<RoomStatus>('vacant');
  const [isPriority, setIsPriority] = useState(false);
  const [isDND, setIsDND] = useState(false);
  const [isServiceRefused, setIsServiceRefused] = useState(false);
  const [isSofaCumBedDone, setIsSofaCumBedDone] = useState(false);
  const [notes, setNotes] = useState('');

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [customItem, setCustomItem] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemType, setItemType] = useState<'missing' | 'damaged'>('missing');

  const [jobDescription, setJobDescription] = useState('');

  const [prevRoomId, setPrevRoomId] = useState<string | null>(null);
  if (room && room.id !== prevRoomId) {
    setPrevRoomId(room.id);
    setMissingItems([...room.missingItems]);
    setJobOrders([...room.jobOrders]);
    setStatus(room.status);
    setIsPriority(room.isPriority);
    setIsDND(room.isDND);
    setIsServiceRefused(room.isServiceRefused);
    setIsSofaCumBedDone(room.isSofaCumBedDone);
    setNotes(room.notes || '');
    setSelectedItems([]);
    setCustomItem('');
    setItemQuantity(1);
  }

  if (!room) return null;
  const statusConfig = STATUS_CONFIG[status];

  const toggleItem = (item: string) => {
    setSelectedItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const addItems = () => {
    const names = [...selectedItems];
    if (customItem.trim()) names.push(customItem.trim());
    if (names.length === 0) return;
    const newItems: MissingItem[] = names.map(name => ({ name, quantity: itemQuantity, type: itemType }));
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
    const jo: JobOrder = { id: Date.now().toString(), description: jobDescription.trim(), createdAt: new Date(), completed: false };
    setJobOrders(prev => [...prev, jo]);
    setJobDescription('');
    setStatus('blocked');
  };

  const completeJobOrder = (id: string) => {
    const updated = jobOrders.map(j => j.id === id ? { ...j, completed: true } : j);
    setJobOrders(updated);
    if (updated.every(j => j.completed)) setStatus('vacant');
  };

  const handleSave = () => {
    onUpdate(room.id, { status, isPriority, isDND, isServiceRefused, isSofaCumBedDone, missingItems, jobOrders, notes, lastInspected: new Date() });
    onClose();
  };

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
              <div className="text-sm font-sans font-normal text-muted-foreground">Block {room.floor}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="status" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="items">Items ({missingItems.length})</TabsTrigger>
            <TabsTrigger value="jobs">Job Orders ({jobOrders.filter(j => !j.completed).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Room Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as RoomStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-4">
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
              <div className="flex items-center gap-2">
                <Switch checked={isServiceRefused} onCheckedChange={setIsServiceRefused} />
                <Label className="flex items-center gap-1.5">
                  <Ban className="h-4 w-4 text-room-serviceRefused" /> Service Refused
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isSofaCumBedDone} onCheckedChange={setIsSofaCumBedDone} />
                <Label className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-room-sofaCumBed" /> Sofa Cum Bed Done
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..." rows={3} />
            </div>

            {room.lastInspected && (
              <p className="text-xs text-muted-foreground">Last inspected: {room.lastInspected.toLocaleString()}</p>
            )}
          </TabsContent>

          <TabsContent value="items" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Select value={itemType} onValueChange={(v) => setItemType(v as 'missing' | 'damaged')}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="missing">Missing</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1 rounded-md border border-input bg-background">
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-r-none" onClick={() => setItemQuantity(q => Math.max(1, q - 1))} disabled={itemQuantity <= 1}>
                    <span className="text-lg font-semibold">−</span>
                  </Button>
                  <span className="w-8 text-center text-sm font-semibold tabular-nums">{itemQuantity}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-l-none" onClick={() => setItemQuantity(q => q + 1)}>
                    <span className="text-lg font-semibold">+</span>
                  </Button>
                </div>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Search className="h-4 w-4" />
                      {selectedItems.length > 0 ? `${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''} selected` : 'Search items...'}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Type to search items..." />
                    <CommandList>
                      <CommandEmpty>No items found. Use the field below to add a custom item.</CommandEmpty>
                      <CommandGroup>
                        {presetItems.map(item => (
                          <CommandItem key={item} value={item} onSelect={() => toggleItem(item)}>
                            <Check className={`mr-2 h-4 w-4 ${selectedItems.includes(item) ? 'opacity-100' : 'opacity-0'}`} />
                            {item}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedItems.map(item => (
                    <Badge key={item} variant="secondary" className="gap-1 pr-1">
                      {item}
                      <button onClick={() => toggleItem(item)} className="rounded-full hover:bg-background/50 p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input value={customItem} onChange={e => setCustomItem(e.target.value)} placeholder="Add custom item..." className="flex-1" />
                <Button onClick={addItems} size="sm" disabled={selectedItems.length === 0 && !customItem.trim()}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>
            {missingItems.length > 0 && (
              <div className="space-y-1.5">
                <Label>Noted Items</Label>
                {missingItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant={item.type === 'damaged' ? 'destructive' : 'secondary'} className="text-[10px]">{item.type}</Badge>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground">×{item.quantity}</span>
                    </div>
                    <button onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Describe the issue..." className="flex-1" />
              <Button onClick={addJobOrder} size="sm" disabled={!jobDescription.trim()}>
                <Wrench className="h-4 w-4 mr-1" /> Create
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Creating a job order automatically blocks the room. Completing all orders releases it.</p>
            {jobOrders.length > 0 && (
              <div className="space-y-2">
                {jobOrders.map(jo => (
                  <div key={jo.id} className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm ${jo.completed ? 'bg-room-vacant/10' : 'bg-room-blocked/10'}`}>
                    <div className="flex items-center gap-2">
                      {jo.completed ? <Check className="h-4 w-4 text-room-vacant" /> : <Wrench className="h-4 w-4 text-room-blocked" />}
                      <span className={jo.completed ? 'line-through text-muted-foreground' : 'font-medium'}>{jo.description}</span>
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
