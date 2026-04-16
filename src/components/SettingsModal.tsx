import { useState } from 'react';
import { HotelSettings } from '@/hooks/useSettings';
import { Room } from '@/types/housekeeping';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, X, Pencil, Check, RotateCcw, ImagePlus, Users } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  settings: HotelSettings;
  onUpdateSettings: (updates: Partial<HotelSettings>) => void;
  rooms: Room[];
  onAddRoom: (number: string, floor: string) => void;
  onRemoveRoom: (roomId: string) => void;
  onEditRoomNumber: (roomId: string, newNumber: string, newFloor: string) => void;
  onResetRooms: () => void;
}

export function SettingsModal({
  open, onClose, settings, onUpdateSettings,
  rooms, onAddRoom, onRemoveRoom, onEditRoomNumber, onResetRooms,
}: Props) {
  const [hotelName, setHotelName] = useState(settings.hotelName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [staffNames, setStaffNames] = useState<string[]>([...settings.staffNames]);
  const [newStaff, setNewStaff] = useState('');
  const [items, setItems] = useState<string[]>([...settings.presetItems]);
  const [newItem, setNewItem] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomBlock, setNewRoomBlock] = useState('1');
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [editNumber, setEditNumber] = useState('');
  const [editBlock, setEditBlock] = useState('');

  // Sync when re-opened
  const [prevOpen, setPrevOpen] = useState(false);
  if (open && !prevOpen) {
    setHotelName(settings.hotelName);
    setLogoUrl(settings.logoUrl);
    setStaffNames([...settings.staffNames]);
    setNewStaff('');
    setItems([...settings.presetItems]);
    setNewItem('');
    setNewRoomNumber('');
    setNewRoomBlock('1');
    setEditingRoom(null);
  }
  if (open !== prevOpen) setPrevOpen(open);

  const addItem = () => {
    const trimmed = newItem.trim();
    if (trimmed && !items.includes(trimmed)) {
      setItems(prev => [...prev, trimmed]);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const addStaff = () => {
    const trimmed = newStaff.trim();
    if (trimmed && !staffNames.includes(trimmed)) {
      setStaffNames(prev => [...prev, trimmed]);
      setNewStaff('');
    }
  };

  const removeStaff = (index: number) => setStaffNames(prev => prev.filter((_, i) => i !== index));

  const handleAddRoom = () => {
    const num = newRoomNumber.trim();
    const block = newRoomBlock.trim();
    if (num && block) {
      onAddRoom(num, block);
      setNewRoomNumber('');
      setNewRoomBlock('1');
    }
  };

  const startEditRoom = (room: Room) => {
    setEditingRoom(room.id);
    setEditNumber(room.number);
    setEditBlock(room.floor);
  };

  const saveEditRoom = () => {
    if (editingRoom && editNumber.trim() && editBlock.trim()) {
      onEditRoomNumber(editingRoom, editNumber.trim(), editBlock.trim());
      setEditingRoom(null);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onUpdateSettings({ hotelName, logoUrl, staffNames, presetItems: items });
    onClose();
  };

  const blocks = [...new Set(rooms.map(r => r.floor))].sort();

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="staff">Staff ({staffNames.length})</TabsTrigger>
            <TabsTrigger value="rooms">Rooms ({rooms.length})</TabsTrigger>
            <TabsTrigger value="items">Items ({items.length})</TabsTrigger>
          </TabsList>

          {/* GENERAL */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-14 h-14 rounded-xl object-contain border border-border" />
                ) : (
                  <div className="w-14 h-14 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
                    <ImagePlus className="h-5 w-5" />
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    <span className="inline-flex items-center rounded-md bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/80 transition-colors">
                      Upload Logo
                    </span>
                  </label>
                  {logoUrl && (
                    <Button variant="ghost" size="sm" onClick={() => setLogoUrl('')} className="text-destructive text-xs">
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dashboard Title</Label>
              <Input value={hotelName} onChange={e => setHotelName(e.target.value)} placeholder="e.g. Grand Hotel Housekeeping" />
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" onClick={onResetRooms} className="text-destructive">
                <RotateCcw className="h-4 w-4 mr-1.5" /> Reset All Rooms to Default
              </Button>
              <p className="text-xs text-muted-foreground mt-1">This resets all rooms to 40 vacant rooms (4 blocks × 10 rooms).</p>
            </div>
          </TabsContent>

          {/* STAFF */}
          <TabsContent value="staff" className="space-y-4 mt-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Add staff members working under you.
            </p>
            <div className="flex gap-2">
              <Input value={newStaff} onChange={e => setNewStaff(e.target.value)} placeholder="Staff name..." className="flex-1"
                onKeyDown={e => e.key === 'Enter' && addStaff()} />
              <Button onClick={addStaff} size="sm" disabled={!newStaff.trim()}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            {staffNames.length > 0 && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {staffNames.map((name, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                    <span className="font-medium">{name}</span>
                    <button onClick={() => removeStaff(i)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ROOMS */}
          <TabsContent value="rooms" className="space-y-4 mt-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Room Number</Label>
                <Input value={newRoomNumber} onChange={e => setNewRoomNumber(e.target.value)} placeholder="e.g. 501" />
              </div>
              <div className="w-24 space-y-1">
                <Label className="text-xs">Block</Label>
                <Input value={newRoomBlock} onChange={e => setNewRoomBlock(e.target.value)} placeholder="e.g. A" />
              </div>
              <Button onClick={handleAddRoom} size="sm" disabled={!newRoomNumber.trim()}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {blocks.map(block => (
                <div key={block}>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Block {block}</p>
                  <div className="space-y-1">
                    {rooms.filter(r => r.floor === block).map(room => (
                      <div key={room.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-1.5 text-sm">
                        {editingRoom === room.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input value={editNumber} onChange={e => setEditNumber(e.target.value)} className="h-7 w-24 text-xs" />
                            <Input value={editBlock} onChange={e => setEditBlock(e.target.value)} className="h-7 w-16 text-xs" />
                            <button onClick={saveEditRoom} className="text-room-vacant hover:opacity-70"><Check className="h-4 w-4" /></button>
                            <button onClick={() => setEditingRoom(null)} className="text-muted-foreground hover:opacity-70"><X className="h-4 w-4" /></button>
                          </div>
                        ) : (
                          <>
                            <span className="font-medium">Room {room.number}</span>
                            <div className="flex items-center gap-1">
                              <button onClick={() => startEditRoom(room)} className="text-muted-foreground hover:text-foreground">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => onRemoveRoom(room.id)} className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ITEMS */}
          <TabsContent value="items" className="space-y-4 mt-4">
            <p className="text-xs text-muted-foreground">These items appear as quick-select options when inspecting a room.</p>
            <div className="flex gap-2">
              <Input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add new item..." className="flex-1"
                onKeyDown={e => e.key === 'Enter' && addItem()} />
              <Button onClick={addItem} size="sm" disabled={!newItem.trim()}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 rounded-lg bg-secondary/50">
              {items.map((item, i) => (
                <span key={`${item}-${i}`} className="inline-flex items-center gap-1 rounded-md bg-card border border-border px-2 py-1 text-xs font-medium">
                  {item}
                  <button onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
