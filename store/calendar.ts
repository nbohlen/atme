import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import ICAL from 'ical.js';

interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  alarms?: { relativeOffset: number }[];
}

class CalendarService {
  private static instance: CalendarService;
  private calendarId: string | null = null;

  private constructor() {}

  static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  async initialize(): Promise<void> {
    if (Platform.OS === 'web') {
      return; // Web platform uses different calendar handling
    }

    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => 
        cal.isPrimary && cal.allowsModifications
      );

      if (!defaultCalendar) {
        // Create a new calendar if no suitable one exists
        this.calendarId = await this.createCalendar();
      } else {
        this.calendarId = defaultCalendar.id;
      }
    }
  }

  private async createCalendar(): Promise<string> {
    const newCalendarId = await Calendar.createCalendarAsync({
      title: 'App Reminders',
      color: '#007AFF',
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: Platform.OS === 'ios' ? undefined : (await Calendar.getSourcesAsync())[0].id,
      source: Platform.OS === 'ios' ? { name: 'App Reminders', type: 'LOCAL' } : undefined,
      name: 'AppReminders',
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });
    return newCalendarId;
  }

  async addEvent(event: CalendarEvent): Promise<string | null> {
    if (Platform.OS === 'web') {
      return this.addWebCalendarEvent(event);
    }

    if (!this.calendarId) {
      await this.initialize();
    }

    if (!this.calendarId) {
      throw new Error('Calendar not initialized');
    }

    try {
      const eventId = await Calendar.createEventAsync(this.calendarId, {
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        notes: event.notes,
        alarms: event.alarms,
      });
      return eventId;
    } catch (error) {
      console.error('Failed to add calendar event:', error);
      return null;
    }
  }

  private addWebCalendarEvent(event: CalendarEvent): string | null {
    try {
      // Create an iCal event
      const comp = new ICAL.Component(['vcalendar', [], []]);
      const vevent = new ICAL.Component('vevent');
      
      vevent.addPropertyWithValue('summary', event.title);
      vevent.addPropertyWithValue('dtstart', ICAL.Time.fromJSDate(event.startDate));
      vevent.addPropertyWithValue('dtend', ICAL.Time.fromJSDate(event.endDate));
      
      if (event.notes) {
        vevent.addPropertyWithValue('description', event.notes);
      }

      comp.addSubcomponent(vevent);

      // Create and trigger download of .ics file
      const blob = new Blob([comp.toString()], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `reminder-${Date.now()}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return 'web-calendar-event';
    } catch (error) {
      console.error('Failed to create web calendar event:', error);
      return null;
    }
  }

  async removeEvent(eventId: string): Promise<boolean> {
    if (Platform.OS === 'web') {
      return true; // Web platform doesn't support removing events
    }

    if (!this.calendarId) {
      return false;
    }

    try {
      await Calendar.deleteEventAsync(eventId);
      return true;
    } catch (error) {
      console.error('Failed to remove calendar event:', error);
      return false;
    }
  }
}

export const calendarService = CalendarService.getInstance();