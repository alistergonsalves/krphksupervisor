import { useState, useEffect } from 'react';
import { PRESET_ITEMS } from '@/types/housekeeping';

const SETTINGS_KEY = 'housekeeping-settings';

export interface HotelSettings {
  hotelName: string;
  presetItems: string[];
  logoUrl: string;
  staffNames: string[];
}

const DEFAULT_SETTINGS: HotelSettings = {
  hotelName: 'Housekeeping Dashboard',
  presetItems: [...PRESET_ITEMS],
  logoUrl: '',
  staffNames: [],
};

function loadSettings(): HotelSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS };
}

export function useSettings() {
  const [settings, setSettings] = useState<HotelSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<HotelSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return { settings, updateSettings };
}
