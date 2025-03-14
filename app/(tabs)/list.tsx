import React, { useState } from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, Pressable, Text, Alert } from 'react-native';
import { Clock, Bell, BellOff, SquareCheck as CheckSquare, Square, Trash2 } from 'lucide-react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useMessagesStore } from '@/store/messages';
import { format } from 'date-fns';
import { useBackgroundStore } from '@/store/background';
import { BackgroundView } from '@/components/BackgroundView';
import { useTheme } from '@/hooks/useTheme';

export default function ListScreen() {
  const { 
    getFilteredMessages, 
    toggleCompleted, 
    setReminderDate, 
    cancelReminder,
    deleteMessage,
    deleteAllMessages 
  } = useMessagesStore();
  const { background } = useBackgroundStore();
  const theme = useTheme();
  const todos = getFilteredMessages('todo');
  const reminders = getFilteredMessages('reminder');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const handleIconPress = (id: string) => {
    setSelectedId(id);
    setDatePickerVisible(true);
  };

  const handleConfirm = async (date: Date) => {
    if (selectedId) {
      await setReminderDate(selectedId, date);
      setDatePickerVisible(false);
      setSelectedId(null);
    }
  };

  const handleCancel = () => {
    setDatePickerVisible(false);
    setSelectedId(null);
  };

  const handleCancelReminder = async (id: string) => {
    await cancelReminder(id);
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => deleteMessage(id),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAll = (type?: 'todo' | 'reminder') => {
    Alert.alert(
      'Delete All',
      `Are you sure you want to delete all ${type || ''} items?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => deleteAllMessages(type),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }) => {
    const isReminder = item.type === 'reminder';

    return (
      <View style={[styles.itemContainer, item.isCompleted && styles.itemCompleted]}>
        <Pressable 
          onPress={() => isReminder ? handleIconPress(item.id) : toggleCompleted(item.id)}
          style={({ pressed }) => [
            styles.iconContainer,
            pressed && styles.iconPressed
          ]}
          hitSlop={8}
        >
          {isReminder ? (
            <View style={styles.iconWrapper}>
              <Clock size={24} color={item.isCompleted ? '#007AFF' : '#666'} />
              {item.reminderDate ? (
                <Bell size={16} color="#007AFF" style={styles.bellIcon} />
              ) : (
                <BellOff size={16} color="#666" style={styles.bellIcon} />
              )}
            </View>
          ) : (
            item.isCompleted ? (
              <CheckSquare size={24} color="#007AFF" />
            ) : (
              <Square size={24} color="#666" />
            )
          )}
        </Pressable>
        <Pressable 
          onPress={() => toggleCompleted(item.id)}
          style={styles.textContainer}
        >
          <Text style={[styles.text, item.isCompleted && styles.completedText]}>
            {item.text}
          </Text>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>
              {format(new Date(item.createdAt), 'MMM d, yyyy')}
            </Text>
            {isReminder && item.reminderDate && (
              <>
                <Text style={styles.reminderTime}>
                  Reminder: {format(new Date(item.reminderDate), 'MMM d, yyyy HH:mm')}
                </Text>
                <Pressable
                  onPress={() => handleCancelReminder(item.id)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>Cancel Reminder</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
        <Pressable
          onPress={() => handleDeleteItem(item.id)}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && { opacity: 0.7 }
          ]}
        >
          <Trash2 size={20} color={theme.colors.error || '#FF3B30'} />
        </Pressable>
      </View>
    );
  };

  return (
    <BackgroundView settings={background}>
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { 
          backgroundColor: theme.isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          borderBottomColor: theme.colors.border
        }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: theme.isDark ? '#FFFFFF' : '#000000' }]}>
              Todos & Reminders
            </Text>
            <Text style={[styles.subtitle, { color: theme.isDark ? '#A0A0A0' : '#666666' }]}>
              {todos.length + reminders.length} items • {
                [...todos, ...reminders].filter(item => item.isCompleted).length
              } completed
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => handleDeleteAll('todo')}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && { opacity: 0.7 }
              ]}
            >
              <Text style={[styles.headerButtonText, { color: theme.colors.error }]}>
                Delete All Todos
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleDeleteAll('reminder')}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && { opacity: 0.7 }
              ]}
            >
              <Text style={[styles.headerButtonText, { color: theme.colors.error }]}>
                Delete All Reminders
              </Text>
            </Pressable>
          </View>
        </View>
        <FlatList
          data={[...todos, ...reminders].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          minimumDate={new Date()}
        />
      </SafeAreaView>
    </BackgroundView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    backdropFilter: 'blur(10px)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: 'rgba(248, 248, 248, 0.9)',
    borderRadius: 12,
    marginBottom: 8,
  },
  itemCompleted: {
    backgroundColor: 'rgba(240, 240, 240, 0.9)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 20,
  },
  iconPressed: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  iconWrapper: {
    position: 'relative',
    width: 24,
    height: 24,
  },
  bellIcon: {
    position: 'absolute',
    right: -8,
    bottom: -8,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  timeContainer: {
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  reminderTime: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
  },
  cancelButton: {
    marginTop: 4,
  },
  cancelText: {
    fontSize: 12,
    color: '#FF3B30',
  },
  headerContent: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  headerButton: {
    paddingVertical: 4,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});