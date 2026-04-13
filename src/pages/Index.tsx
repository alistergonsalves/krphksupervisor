import { useState } from 'react';
import { Room, RoomStatus } from '@/types/housekeeping';
import { StatusBar } from '@/components/StatusBar';
import { RoomCard } from '@/components/RoomCard';
import { RoomInspectionModal } from '@/components/RoomInspectionModal';
import { SettingsModal } from '@/components/SettingsModal';
import { useRooms } from '@/hooks/useRooms';
import { useSettings } from '@/hooks/useSettings';
import { Hotel, Calendar, Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type Filter = RoomStatus | 'all' | 'priority' | 'dnd';

const Index = () => {
  const { rooms, updateRoom, addRoom, removeRoom, editRoomNumber, resetRooms, stats } = useRooms();
  const { settings, updateSettings } = useSettings();
  const [filter, setFilter] = useState<Filter>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const filteredRooms = rooms.filter(r => {
    if (filter === 'priority') return r.isPriority;
    if (filter === 'dnd') return r.isDND;
    if (filter !== 'all') return r.status === filter;
    return true;
  }).filter(r => floorFilter === 'all' || r.floor === Number(floorFilter));

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const floors = [...new Set(rooms.map(r => r.floor))].sort();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
              <Hotel className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">{settings.hotelName}</h1>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {today}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={floorFilter} onValueChange={setFloorFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Floors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                {floors.map(f => (
                  <SelectItem key={f} value={String(f)}>Floor {f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)} title="Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <StatusBar stats={stats} activeFilter={filter} onFilterChange={setFilter} />

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-3">
          {filteredRooms.map(room => (
            <RoomCard key={room.id} room={room} onClick={setSelectedRoom} />
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">No rooms match this filter</p>
          </div>
        )}

        <div className="flex flex-wrap gap-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-room-vacant" /> Vacant</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-room-occupied" /> Occupied</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-room-dirty" /> Dirty</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-room-departure" /> Departure</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-room-blocked" /> Blocked</div>
        </div>
      </main>

      <RoomInspectionModal
        room={selectedRoom}
        open={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
        onUpdate={updateRoom}
        presetItems={settings.presetItems}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        rooms={rooms}
        onAddRoom={addRoom}
        onRemoveRoom={removeRoom}
        onEditRoomNumber={editRoomNumber}
        onResetRooms={resetRooms}
      />
    </div>
  );
};

export default Index;
