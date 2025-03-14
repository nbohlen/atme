import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface BackgroundSettings {
  type: 'color';
  value: string;
}

interface BackgroundState {
  background: BackgroundSettings;
  updateBackground: (settings: BackgroundSettings) => void;
}

const storage = Platform.OS === 'web' 
  ? {
      getItem: async (key: string) => {
        try {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        } catch {
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch {
          // Ignore storage errors on web
        }
      },
      removeItem: async (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch {
          // Ignore storage errors on web
        }
      },
    }
  : createJSONStorage(() => AsyncStorage);

export const useBackgroundStore = create<BackgroundState>()(
  persist(
    (set) => ({
      background: { type: 'color', value: '#ffffff' },
      updateBackground: (settings) => set({ background: settings }),
    }),
    {
      name: 'background-storage',
      storage,
    }
  )
);