import React, { useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { ThemeContext } from '@/components/ThemeProvider';
import { useBackgroundStore } from '@/store/background';
import { ColorPicker } from '@/components/ColorPicker';

export default function SettingsScreen() {
  const theme = React.useContext(ThemeContext);
  const { background, updateBackground } = useBackgroundStore();

  const handleColorChange = useCallback((color: string) => {
    updateBackground({ type: 'color', value: color });
  }, [updateBackground]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
        
        <View style={[styles.section, { borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.secondary }]}>
            Background Color
          </Text>
          
          <View style={[styles.colorPickerContainer, { backgroundColor: theme.isDark ? theme.colors.card : 'rgba(0, 0, 0, 0.05)' }]}>
            <ColorPicker
              value={background.value}
              onChange={handleColorChange}
            />
          </View>
          <Text style={[styles.colorValue, { color: theme.colors.secondary }]}>
            Current color: {background.value}
          </Text>
        </View>

        <View style={[styles.section, { borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.secondary }]}>
            About
          </Text>
          <View style={[styles.option, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.optionText, { color: theme.colors.text }]}>
              Version 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  option: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionText: {
    fontSize: 17,
    marginLeft: 12,
    flex: 1,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionStatus: {
    fontSize: 17,
    marginRight: 8,
  },
  colorPickerContainer: {
    padding: 16,
    borderRadius: 12,
  },
  colorValue: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});