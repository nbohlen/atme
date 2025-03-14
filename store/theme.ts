import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

// Create a storage object that falls back to memory storage on web
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

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
    }),
    {
      name: 'theme-storage',
      storage,
    }
  )
);