import { create } from 'zustand';
import { format, parse, addDays, setHours, setMinutes, isValid } from 'date-fns';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import linkifyIt from 'linkify-it';
import { calendarService } from './calendar';
import { encryptionService } from './encryption';

const linkify = linkifyIt();

export type MessageType = 'todo' | 'reminder' | 'note';

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  loading?: boolean;
  error?: boolean;
}

export interface Message {
  id: string;
  text: string;
  type: MessageType;
  createdAt: string;
  isRead: boolean;
  isCompleted?: boolean;
  reminderDate?: string;
  notificationId?: string;
  calendarEventId?: string;
  links?: LinkPreview[];
  encrypted?: boolean;
}

interface MessagesState {
  messages: Message[];
  addMessage: (text: string, type: MessageType) => void;
  deleteMessage: (id: string) => Promise<void>;
  deleteAllMessages: (type?: MessageType) => Promise<void>;
  markAsRead: (id: string) => void;
  toggleCompleted: (id: string) => void;
  getFilteredMessages: (type?: MessageType) => Message[];
  setReminderDate: (id: string, date: Date) => Promise<void>;
  cancelReminder: (id: string) => Promise<void>;
  updateLinkPreview: (messageId: string, linkPreview: LinkPreview) => void;
  encryptMessage: (id: string) => Promise<void>;
  decryptMessage: (id: string) => Promise<void>;
}

// Initialize calendar service
calendarService.initialize().catch(console.error);

// Configure notifications with sound and badge
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// Update badge count based on unread messages
const updateBadgeCount = async (messages: Message[]) => {
  const unreadCount = messages.filter(msg => !msg.isRead).length;
  
  if (Platform.OS === 'ios') {
    await Notifications.setBadgeCountAsync(unreadCount);
  } else if (Platform.OS === 'android') {
    // On Android, we need to show a notification with the badge
    if (unreadCount > 0) {
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: true,
          badgeCount: unreadCount,
        }),
      });
    }
  }
};

// Request permissions on app start
async function requestNotificationPermissions() {
  if (Platform.OS !== 'web') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    return status === 'granted';
  }
  if (Platform.OS === 'web' && 'Notification' in window) {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.log('Notification permission error:', error);
      return false;
    }
  }
  return false;
}

// Initialize permissions
requestNotificationPermissions();

// Schedule a web notification
async function scheduleWebNotification(title: string, body: string, date: Date) {
  if (!('Notification' in window)) {
    return null;
  }

  const now = new Date();
  const delay = date.getTime() - now.getTime();
  
  const notificationId = Math.random().toString(36).substring(7);
  
  const timeoutId = setTimeout(() => {
    new Notification(title, {
      body,
      icon: '/favicon.png',
    });
  }, Math.max(0, delay));

  const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '{}');
  storedNotifications[notificationId] = timeoutId;
  localStorage.setItem('notifications', JSON.stringify(storedNotifications));

  return notificationId;
}

// Cancel a web notification
async function cancelWebNotification(notificationId: string) {
  if (!('Notification' in window)) {
    return;
  }

  const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '{}');
  const timeoutId = storedNotifications[notificationId];
  
  if (timeoutId) {
    clearTimeout(timeoutId);
    delete storedNotifications[notificationId];
    localStorage.setItem('notifications', JSON.stringify(storedNotifications));
  }
}

function parseTimeFromText(text: string): Date | null {
  const now = new Date();
  const lowerText = text.toLowerCase();
  const words = lowerText.split(' ');
  
  let targetDate = new Date(now);
  let hasTimeSpecifier = false;
  let timeFound = false;

  if (lowerText.includes('tomorrow')) {
    targetDate = addDays(targetDate, 1);
    hasTimeSpecifier = true;
  } else if (lowerText.includes('today')) {
    hasTimeSpecifier = true;
  }

  const timePatterns = [
    { 
      regex: /(\d{1,2}):?(\d{2})?\s*(am|pm)/g,
      parse: (match: string) => {
        const [hours, minutes = '00', meridiem] = match.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/)!.slice(1);
        let parsedHours = parseInt(hours);
        if (meridiem === 'pm' && parsedHours !== 12) parsedHours += 12;
        if (meridiem === 'am' && parsedHours === 12) parsedHours = 0;
        return { hours: parsedHours, minutes: parseInt(minutes) };
      }
    },
    {
      regex: /(\d{2}):(\d{2})/g,
      parse: (match: string) => {
        const [hours, minutes] = match.split(':').map(Number);
        return { hours, minutes };
      }
    },
    {
      regex: /(\d{1,2})\s*(am|pm)/g,
      parse: (match: string) => {
        const [hours, meridiem] = match.match(/(\d{1,2})\s*(am|pm)/)!.slice(1);
        let parsedHours = parseInt(hours);
        if (meridiem === 'pm' && parsedHours !== 12) parsedHours += 12;
        if (meridiem === 'am' && parsedHours === 12) parsedHours = 0;
        return { hours: parsedHours, minutes: 0 };
      }
    }
  ];

  for (const pattern of timePatterns) {
    const matches = text.matchAll(pattern.regex);
    for (const match of matches) {
      const { hours, minutes } = pattern.parse(match[0]);
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        targetDate = setHours(setMinutes(targetDate, minutes), hours);
        timeFound = true;
        break;
      }
    }
    if (timeFound) break;
  }

  if (hasTimeSpecifier || timeFound) {
    if (targetDate < now) {
      targetDate = addDays(targetDate, 1);
    }
    return targetDate;
  }

  return null;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messages: [],
  addMessage: (text: string, type: MessageType) => {
    const matches = linkify.match(text);
    const links = matches?.map(match => ({
      url: match.url,
      loading: true,
    })) || [];

    const message = {
      id: Math.random().toString(36).substring(7),
      text: text.trim(),
      type,
      createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      isRead: false,
      isCompleted: false,
      links,
    };

    set((state) => {
      const newMessages = [message, ...state.messages];
      // Update badge count when adding new message
      updateBadgeCount(newMessages);
      return { messages: newMessages };
    });

    links.forEach(async (link) => {
      try {
        const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(link.url)}`);
        const data = await response.json();
        
        if (data.status === 'success') {
          const preview: LinkPreview = {
            url: link.url,
            title: data.data.title,
            description: data.data.description,
            image: data.data.image?.url,
            loading: false,
          };
          get().updateLinkPreview(message.id, preview);
        } else {
          get().updateLinkPreview(message.id, { ...link, loading: false, error: true });
        }
      } catch (error) {
        get().updateLinkPreview(message.id, { ...link, loading: false, error: true });
      }
    });
  },
  deleteMessage: async (id: string) => {
    const message = get().messages.find(msg => msg.id === id);
    if (!message) return;

    if (message.notificationId) {
      if (Platform.OS === 'web') {
        await cancelWebNotification(message.notificationId);
      } else {
        await Notifications.cancelScheduledNotificationAsync(message.notificationId);
      }
    }

    if (message.calendarEventId) {
      await calendarService.removeEvent(message.calendarEventId);
    }

    set((state) => {
      const newMessages = state.messages.filter((msg) => msg.id !== id);
      updateBadgeCount(newMessages);
      return { messages: newMessages };
    });
  },
  deleteAllMessages: async (type?: MessageType) => {
    const messages = get().messages;
    const messagesToDelete = type ? messages.filter(msg => msg.type === type) : messages;

    await Promise.all(messagesToDelete.map(async (message) => {
      if (message.notificationId) {
        if (Platform.OS === 'web') {
          await cancelWebNotification(message.notificationId);
        } else {
          await Notifications.cancelScheduledNotificationAsync(message.notificationId);
        }
      }

      if (message.calendarEventId) {
        await calendarService.removeEvent(message.calendarEventId);
      }
    }));

    set((state) => {
      const newMessages = type 
        ? state.messages.filter((msg) => msg.type !== type)
        : [];
      updateBadgeCount(newMessages);
      return { messages: newMessages };
    });
  },
  markAsRead: (id: string) => {
    set((state) => {
      const newMessages = state.messages.map((msg) =>
        msg.id === id ? { ...msg, isRead: true } : msg
      );
      updateBadgeCount(newMessages);
      return { messages: newMessages };
    });
  },
  toggleCompleted: (id: string) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, isCompleted: !msg.isCompleted } : msg
      ),
    }));
  },
  getFilteredMessages: (type?: MessageType) => {
    const state = get();
    return type
      ? state.messages.filter((msg) => msg.type === type)
      : state.messages;
  },
  setReminderDate: async (id: string, date: Date) => {
    const message = get().messages.find(msg => msg.id === id);
    if (!message) return;

    if (message.notificationId) {
      if (Platform.OS === 'web') {
        await cancelWebNotification(message.notificationId);
      } else {
        await Notifications.cancelScheduledNotificationAsync(message.notificationId);
      }
    }

    if (message.calendarEventId) {
      await calendarService.removeEvent(message.calendarEventId);
    }

    let notificationId;
    if (Platform.OS === 'web') {
      notificationId = await scheduleWebNotification('Reminder', message.text, date);
    } else {
      notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Reminder',
          body: message.text,
          sound: true,
          badge: 1,
          data: { messageId: id },
        },
        trigger: {
          date,
          seconds: 1,
        },
      });
    }

    const endDate = new Date(date.getTime() + 30 * 60000);
    const calendarEventId = await calendarService.addEvent({
      title: message.text,
      startDate: date,
      endDate,
      notes: 'Added from App Reminders',
      alarms: [{ relativeOffset: -15 }],
    });

    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id
          ? {
              ...msg,
              reminderDate: date.toISOString(),
              notificationId,
              calendarEventId,
            }
          : msg
      ),
    }));
  },
  cancelReminder: async (id: string) => {
    const message = get().messages.find(msg => msg.id === id);
    if (!message?.notificationId) return;

    if (Platform.OS === 'web') {
      await cancelWebNotification(message.notificationId);
    } else {
      await Notifications.cancelScheduledNotificationAsync(message.notificationId);
    }

    if (message.calendarEventId) {
      await calendarService.removeEvent(message.calendarEventId);
    }

    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id
          ? {
              ...msg,
              reminderDate: undefined,
              notificationId: undefined,
              calendarEventId: undefined,
            }
          : msg
      ),
    }));
  },
  updateLinkPreview: (messageId: string, linkPreview: LinkPreview) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              links: msg.links?.map((link) =>
                link.url === linkPreview.url ? linkPreview : link
              ),
            }
          : msg
      ),
    }));
  },
  encryptMessage: async (id: string) => {
    const message = get().messages.find(msg => msg.id === id);
    if (!message || message.encrypted) return;

    try {
      const encryptedText = await encryptionService.encrypt(message.text);
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === id
            ? {
                ...msg,
                text: encryptedText,
                encrypted: true,
              }
            : msg
        ),
      }));
    } catch (error) {
      console.error('Failed to encrypt message:', error);
    }
  },
  decryptMessage: async (id: string) => {
    const message = get().messages.find(msg => msg.id === id);
    if (!message || !message.encrypted) return;

    try {
      const decryptedText = await encryptionService.decrypt(message.text);
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === id
            ? {
                ...msg,
                text: decryptedText,
                encrypted: false,
              }
            : msg
        ),
      }));
    } catch (error) {
      console.error('Failed to decrypt message:', error);
    }
  },
}));