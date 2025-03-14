import React from 'react';
import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/store/theme';

export const ThemeContext = React.createContext({
  isDark: false,
  colors: {
    background: '#FFFFFF',
    text: '#000000',
    primary: '#007AFF',
    secondary: '#666666',
    border: '#E5E5E5',
    card: '#F8F8F8',
    cardPressed: '#F0F0F0',
  },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { isDark } = useThemeStore();

  // Use system theme if available, otherwise use stored preference
  const actualDarkMode = systemColorScheme === 'dark' || isDark;

  const theme = {
    isDark: actualDarkMode,
    colors: actualDarkMode
      ? {
          background: '#000000',
          text: '#FFFFFF',
          primary: '#0A84FF',
          secondary: '#98989E',
          border: '#262626',
          card: '#1C1C1E',
          cardPressed: '#2C2C2E',
        }
      : {
          background: '#FFFFFF',
          text: '#000000',
          primary: '#007AFF',
          secondary: '#666666',
          border: '#E5E5E5',
          card: '#F8F8F8',
          cardPressed: '#F0F0F0',
        },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}