import { useState, useEffect } from 'react';
import { Room, RoomStatus } from '@/types/housekeeping';

const STORAGE_KEY = 'housekeeping-rooms';

function generateDefaultRooms(): Room[] {
  const rooms: Room[] = [];
  for (let floor = 1; floor <= 4; floor++) {
    for (let r = 1; r <= 10; r++) {
      const num = `${floor}${String(r).padStart(2, '0')}`;
      rooms.push({
        id: num, number: num, floor,
        status: 'vacant',
        isPriority: false, isDND: false,
        missingItems: [], jobOrders: [],
      });
    }
  }
  return rooms;
}

function loadRooms(): Room[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Room[];
      return parsed.map(r => ({
        ...r,
        lastInspected: r.lastInspected ? new Date(r.lastInspected) : undefined,
        jobOrders: r.jobOrders.map(j => ({ ...j, createdAt: new Date(j.createdAt) })),
      }));
    }
  } catch { /* ignore */ }
  return generateDefaultRooms();
}

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>(loadRooms);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  }, [rooms]);

  const updateRoom = (roomId: string, updates: Partial<Room>) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, ...updates } : r));
  };

  const addRoom = (number: string, floor: number) => {
    const newRoom: Room = {
      id: `${number}-${Date.now()}`, number, floor,
      status: 'vacant', isPriority: false, isDND: false,
      missingItems: [], jobOrders: [],
    };
    setRooms(prev => [...prev, newRoom].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })));
  };

  const removeRoom = (roomId: string) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));
  };

  const editRoomNumber = (roomId: string, newNumber: string, newFloor: number) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, number: newNumber, floor: newFloor } : r)
      .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })));
  };

  const resetRooms = () => setRooms(generateDefaultRooms());

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

  return { rooms, updateRoom, addRoom, removeRoom, editRoomNumber, resetRooms, stats };
}
