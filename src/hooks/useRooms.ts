import { useState } from 'react';
import { Room, RoomStatus } from '@/types/housekeeping';

function generateRooms(): Room[] {
  const rooms: Room[] = [];
  const statuses: RoomStatus[] = ['vacant', 'occupied', 'dirty', 'departure', 'blocked'];
  for (let floor = 1; floor <= 4; floor++) {
    for (let r = 1; r <= 10; r++) {
      const num = `${floor}${String(r).padStart(2, '0')}`;
      const statusIndex = Math.floor(Math.random() * 5);
      rooms.push({
        id: num,
        number: num,
        floor,
        status: statuses[statusIndex],
        isPriority: Math.random() < 0.1,
        isDND: Math.random() < 0.08,
        missingItems: [],
        jobOrders: [],
      });
    }
  }
  return rooms;
}

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>(generateRooms);

  const updateRoom = (roomId: string, updates: Partial<Room>) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, ...updates } : r));
  };

  const stats = {
    vacant: rooms.filter(r => r.status === 'vacant').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    dirty: rooms.filter(r => r.status === 'dirty').length,
    departure: rooms.filter(r => r.status === 'departure').length,
    blocked: rooms.filter(r => r.status === 'blocked').length,
    priority: rooms.filter(r => r.isPriority).length,
    dnd: rooms.filter(r => r.isDND).length,
    total: rooms.length,
  };

  return { rooms, updateRoom, stats };
}
