import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BackgroundSettings } from '@/store/background';

interface BackgroundViewProps {
  settings: BackgroundSettings;
  children: React.ReactNode;
  style?: any;
}

export function BackgroundView({ settings, children, style }: BackgroundViewProps) {
  return (
    <View style={[styles.container, { backgroundColor: settings.value }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});