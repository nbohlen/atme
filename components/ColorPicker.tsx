import React, { useState } from 'react';
import { View, StyleSheet, Platform, Pressable, Modal, Text } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
  '#D4A5A5', '#9B786F', '#A8E6CF', '#DCEDC1', '#FFD3B6',
  '#FF8B94', '#6C5B7B', '#355C7D', '#F67280', '#99B898',
];

const HEX_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  if (Platform.OS === 'web') {
    return (
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          height: 40,
          padding: 0,
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      />
    );
  }

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    onChange(color);
    setModalVisible(false);
  };

  return (
    <View>
      <View style={styles.presetContainer}>
        {PRESET_COLORS.map((color) => (
          <Pressable
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              value === color && styles.selectedColor,
            ]}
            onPress={() => onChange(color)}
          />
        ))}
      </View>

      <Pressable
        style={[
          styles.currentColor,
          { backgroundColor: value },
          { borderColor: theme.colors.border }
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.currentColorText, { color: theme.colors.secondary }]}>
          {value.toUpperCase()}
        </Text>
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Custom Color</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <X size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <View style={styles.colorGrid}>
              {HEX_DIGITS.map((r) => (
                <View key={r} style={styles.row}>
                  {HEX_DIGITS.map((g) => (
                    <Pressable
                      key={`${r}${g}`}
                      style={[
                        styles.colorCell,
                        { backgroundColor: `#${r}${g}${g}${r}${g}${g}` },
                      ]}
                      onPress={() => handleCustomColorChange(`#${r}${g}${g}${r}${g}${g}`)}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  currentColor: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentColorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  colorGrid: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  colorCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});