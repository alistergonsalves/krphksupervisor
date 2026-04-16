export type RoomStatus = 'vacant' | 'occupied' | 'dirty' | 'departure' | 'blocked';

export interface MissingItem {
  name: string;
  quantity: number;
  type: 'missing' | 'damaged';
}

export interface JobOrder {
  id: string;
  description: string;
  createdAt: Date;
  completed: boolean;
}

export interface Room {
  id: string;
  number: string;
  floor: string; // internally still "floor" but displayed as "Block"
  status: RoomStatus;
  isPriority: boolean;
  isDND: boolean;
  isServiceRefused: boolean;
  isSofaCumBedDone: boolean;
  missingItems: MissingItem[];
  jobOrders: JobOrder[];
  lastInspected?: Date;
  notes?: string;
}

export const PRESET_ITEMS = [
  // Cutlery & Kitchen
  'AP Spoon', 'AP Knife', 'Tea Spoon', 'Fork', 'Dinner Plate', 'Side Plate',
  'Soup Bowl', 'Egg Beater', 'Opener', 'Knife', 'Cutting Board',
  'Dish Washing Soap', 'Duster', 'Sponge', 'Water Glass', 'Tea Cups',
  'SS Bottles', 'Kettle', 'Toaster', 'Frying Pan', 'Saucers',
  // Bathroom & Toiletries
  'TCM Supplies', 'Toilet Tissue Roll', 'Facial Tissues', 'Soap',
  'Shampoo', 'Shower Gel', 'Slippers',
  // Minibar & Snacks
  'Bebinca', 'Peanuts', 'Guava Bar', 'Tarvoti',
  'Paul John Whiskey', 'Red Wine', 'White Wine', 'Feni', 'Beer',
  // Linen
  'Pillow Cases', 'Bath Towels', 'Hand Towel', 'Bath Mat',
];

export const STATUS_CONFIG: Record<RoomStatus, { label: string; className: string }> = {
  vacant: { label: 'Vacant', className: 'room-status-vacant' },
  occupied: { label: 'Occupied', className: 'room-status-occupied' },
  dirty: { label: 'Dirty', className: 'room-status-dirty' },
  departure: { label: 'Departure', className: 'room-status-departure' },
  blocked: { label: 'Blocked', className: 'room-status-blocked' },
};
