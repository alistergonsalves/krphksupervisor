import { useState, useEffect } from 'react';
import { Room, RoomStatus } from '@/types/housekeeping';

const STORAGE_KEY = 'housekeeping-rooms';
const ASSIGN_DATE_KEY = 'housekeeping-assign-date';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function generateDefaultRooms(): Room[] {
  const rooms: Room[] = [];
  for (let block = 1; block <= 4; block++) {
    for (let r = 1; r <= 10; r++) {
      const num = `${block}${String(r).padStart(2, '0')}`;
      rooms.push({
        id: num, number: num, floor: String(block),
        status: 'vacant',
        isPriority: false, isDND: false, isServiceRefused: false, isSofaCumBedDone: false,
        assignedToMe: false,
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
      // Auto-clear assignments if it's a new day
      const lastDate = localStorage.getItem(ASSIGN_DATE_KEY);
      const clearAssignments = lastDate !== todayStr();
      return parsed.map(r => ({
        ...r,
        isServiceRefused: r.isServiceRefused ?? false,
        isSofaCumBedDone: r.isSofaCumBedDone ?? false,
        assignedToMe: clearAssignments ? false : (r.assignedToMe ?? false),
        releaseStatus: clearAssignments ? 'none' : (r.releaseStatus ?? 'none'),
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
    localStorage.setItem(ASSIGN_DATE_KEY, todayStr());
  }, [rooms]);

  const updateRoom = (roomId: string, updates: Partial<Room>) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, ...updates } : r));
  };

  const addRoom = (number: string, floor: string) => {
    const newRoom: Room = {
      id: `${number}-${Date.now()}`, number, floor,
      status: 'vacant', isPriority: false, isDND: false, isServiceRefused: false, isSofaCumBedDone: false,
      assignedToMe: false,
      missingItems: [], jobOrders: [],
    };
    setRooms(prev => [...prev, newRoom].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })));
  };

  const removeRoom = (roomId: string) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));
  };

  const editRoomNumber = (roomId: string, newNumber: string, newFloor: string) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, number: newNumber, floor: newFloor } : r)
      .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })));
  };

  const resetRooms = () => setRooms(generateDefaultRooms());

  const clearMyAssignments = () => {
    setRooms(prev => prev.map(r => ({ ...r, assignedToMe: false, releaseStatus: 'none' })));
  };

  const stats = {
    vacant: rooms.filter(r => r.status === 'vacant').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    dirty: rooms.filter(r => r.status === 'dirty').length,
    departure: rooms.filter(r => r.status === 'departure').length,
    blocked: rooms.filter(r => r.status === 'blocked').length,
    priority: rooms.filter(r => r.isPriority).length,
    dnd: rooms.filter(r => r.isDND).length,
    serviceRefused: rooms.filter(r => r.isServiceRefused).length,
    sofaCumBedDone: rooms.filter(r => r.isSofaCumBedDone).length,
    assignedToMe: rooms.filter(r => r.assignedToMe).length,
    total: rooms.length,
  };

  return { rooms, updateRoom, addRoom, removeRoom, editRoomNumber, resetRooms, clearMyAssignments, stats };
}

