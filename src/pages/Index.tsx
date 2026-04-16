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

type Filter = RoomStatus | 'all' | 'priority' | 'dnd' | 'serviceRefused';

const Index = () => {
  const { rooms, updateRoom, addRoom, removeRoom, editRoomNumber, resetRooms, stats } = useRooms();
  const { settings, updateSettings } = useSettings();
  const [filter, setFilter] = useState<Filter>('all');
  const [blockFilter, setBlockFilter] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const filteredRooms = rooms.filter(r => {
    if (filter === 'priority') return r.isPriority;
    if (filter === 'dnd') return r.isDND;
    if (filter === 'serviceRefused') return r.isServiceRefused;
    if (filter !== 'all') return r.status === filter;
    return true;
  }).filter(r => blockFilter === 'all' || r.floor === blockFilter);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const blocks = [...new Set(rooms.map(r => r.floor))].sort();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-contain" />
            ) : (
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
                <Hotel className="h-5 w-5" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">{settings.hotelName}</h1>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {today}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={blockFilter} onValueChange={setBlockFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Blocks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blocks</SelectItem>
                {blocks.map(b => (
                  <SelectItem key={b} value={b}>Block {b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)} title="Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Staff bar */}
      {settings.staffNames.length > 0 && (
        <div className="container mx-auto px-4 py-2 flex flex-wrap gap-2 text-xs text-muted-foreground border-b">
          <span className="font-semibold text-foreground">Staff:</span>
          {settings.staffNames.map((name, i) => (
            <span key={i} className="rounded-md bg-secondary px-2 py-0.5 font-medium">{name}</span>
          ))}
        </div>
      )}

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
