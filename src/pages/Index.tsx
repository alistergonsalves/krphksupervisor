import { useState } from 'react';
import { Room, RoomStatus } from '@/types/housekeeping';
import { StatusBar } from '@/components/StatusBar';
import { RoomCard } from '@/components/RoomCard';
import { RoomInspectionModal } from '@/components/RoomInspectionModal';
import { SettingsModal } from '@/components/SettingsModal';
import { useRooms } from '@/hooks/useRooms';
import { useSettings } from '@/hooks/useSettings';
import { BulkActionBar } from '@/components/BulkActionBar';
import { Hotel, Calendar, Settings, CheckSquare, UserPlus, X, Check, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';


type Filter = RoomStatus | 'all' | 'priority' | 'dnd' | 'serviceRefused' | 'sofaCumBedDone' | 'assignedToMe';

const Index = () => {
  const { rooms, updateRoom, addRoom, removeRoom, editRoomNumber, resetRooms, clearMyAssignments, stats } = useRooms();
  const { settings, updateSettings } = useSettings();
  const [filter, setFilter] = useState<Filter>('all');
  const [blockFilter, setBlockFilter] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [assignMode, setAssignMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (room: Room) => {
    if (assignMode) {
      updateRoom(room.id, { assignedToMe: !room.assignedToMe });
      return;
    }
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(room.id)) next.delete(room.id); else next.add(room.id);
      return next;
    });
  };

  const applyBulkStatus = (status: RoomStatus) => {
    selectedIds.forEach(id => updateRoom(id, { status }));
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const enterSelectionMode = () => {
    setAssignMode(false);
    setSelectionMode(true);
  };

  const enterAssignMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
    setAssignMode(true);
  };

  const filteredRooms = rooms.filter(r => {
    if (filter === 'priority') return r.isPriority;
    if (filter === 'dnd') return r.isDND;
    if (filter === 'serviceRefused') return r.isServiceRefused;
    if (filter === 'sofaCumBedDone') return r.isSofaCumBedDone;
    if (filter === 'assignedToMe') return r.assignedToMe;
    if (filter !== 'all') return r.status === filter;
    return true;
  }).filter(r => blockFilter === 'all' || r.floor === blockFilter);

  const myRooms = rooms.filter(r => r.assignedToMe);

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
            <Button
              variant={assignMode ? "default" : "outline"}
              size="icon"
              onClick={() => assignMode ? setAssignMode(false) : enterAssignMode()}
              title="Assign rooms to me"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
            <Button
              variant={selectionMode ? "default" : "outline"}
              size="icon"
              onClick={() => selectionMode ? exitSelectionMode() : enterSelectionMode()}
              title="Multi-select"
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
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

        {assignMode && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-primary/10 border border-primary/30 p-3 shadow-sm">
            <UserPlus className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Assign Mode: tap rooms to add/remove from your list ({myRooms.length} assigned)
            </span>
            <Button variant="ghost" size="sm" onClick={() => setAssignMode(false)} className="ml-auto h-7">
              Done
            </Button>
          </div>
        )}

        {selectionMode && (
          <BulkActionBar
            selectedCount={selectedIds.size}
            totalVisible={filteredRooms.length}
            onSelectAll={() => setSelectedIds(new Set(filteredRooms.map(r => r.id)))}
            onDeselectAll={() => setSelectedIds(new Set())}
            onApplyStatus={applyBulkStatus}
            onCancel={exitSelectionMode}
          />
        )}

        {/* My Rooms Today section */}
        {myRooms.length > 0 && filter !== 'assignedToMe' && (
          <section className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  My Rooms Today
                </h2>
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {myRooms.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMyAssignments}
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5 mr-1" /> Clear all
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {myRooms.map(room => {
                const release = room.releaseStatus ?? 'none';
                const handleRelease = () => {
                  const next = room.missingItems.length > 0 ? 'partial' : 'clean';
                  updateRoom(room.id, { releaseStatus: next, lastInspected: new Date() });
                };
                const handleUndo = () => {
                  updateRoom(room.id, { releaseStatus: 'none' });
                };
                return (
                  <div key={`my-${room.id}`} className="flex flex-col gap-2 rounded-xl bg-card p-2 border border-border/50 shadow-sm">
                    <RoomCard
                      room={room}
                      onClick={setSelectedRoom}
                      selectionMode={false}
                      isSelected={false}
                      onToggleSelect={toggleSelect}
                    />
                    {release === 'none' ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleRelease}
                        className="h-8 text-xs w-full"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Checked & Released
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className={`flex items-center justify-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${
                          release === 'clean'
                            ? 'bg-room-vacant/15 text-room-vacant'
                            : 'bg-gradient-to-r from-room-vacant/20 to-room-occupied/20 text-foreground'
                        }`}>
                          <Check className="h-3 w-3" />
                          {release === 'clean'
                            ? 'Released ✓'
                            : `Released · ${room.missingItems.length} item(s) pending`}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleUndo}
                          className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" /> Undo
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-3">
          {filteredRooms.map(room => (
            <RoomCard
              key={room.id}
              room={room}
              onClick={setSelectedRoom}
              selectionMode={selectionMode || assignMode}
              isSelected={assignMode ? !!room.assignedToMe : selectedIds.has(room.id)}
              onToggleSelect={toggleSelect}
            />
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
