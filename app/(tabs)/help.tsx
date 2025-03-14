import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useBackgroundStore } from '@/store/background';
import { BackgroundView } from '@/components/BackgroundView';
import { useTheme } from '@/hooks/useTheme';

export default function HelpScreen() {
  const { background } = useBackgroundStore();
  const theme = useTheme();

  return (
    <BackgroundView settings={background}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Help & Instructions</Text>

          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Getting Started</Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              Welcome to your personal task and reminder assistant! This app helps you manage your todos and reminders through a simple chat interface.
            </Text>
          </View>

          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Trigger Words</Text>
            
            <Text style={[styles.subheading, { color: theme.colors.text }]}>Creating Todos</Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              Start your message with any of these triggers (followed by a space):
            </Text>
            <View style={styles.triggerList}>
              <Text style={[styles.trigger, { color: theme.colors.primary }]}>todo</Text>
              <Text style={[styles.trigger, { color: theme.colors.primary }]}>td</Text>
              <Text style={[styles.trigger, { color: theme.colors.primary }]}>t</Text>
              <Text style={[styles.trigger, { color: theme.colors.primary }]}>aufgabe</Text>
            </View>
            <Text style={[styles.example, { color: theme.colors.secondary }]}>
              Examples:{'\n'}
              "todo buy groceries"{'\n'}
              "aufgabe Brot kaufen"{'\n'}
              "t call the dentist"
            </Text>

            <Text style={[styles.subheading, { color: theme.colors.text }]}>Setting Reminders</Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              Use any of these triggers (followed by a space):
            </Text>
            <View style={styles.triggerList}>
              <Text style={[styles.trigger, { color: theme.colors.primary }]}>remind</Text>
              <Text style={[styles.trigger, { color: theme.colors.primary }]}>reminder</Text>
              <Text style={[styles.trigger, { color: theme.colors.primary }]}>erinnere</Text>
              <Text style={[styles.trigger, { color: theme.colors.primary }]}>erinnerung</Text>
            </View>
            <Text style={[styles.example, { color: theme.colors.secondary }]}>
              Examples with time:{'\n'}
              "erinnere mich Mama anrufen morgen um 15 Uhr"{'\n'}
              "erinnerung Arzttermin heute um 14:30"{'\n'}
              "remind me to call mom tomorrow at 3pm"
            </Text>

            <Text style={[styles.subheading, { color: theme.colors.text }]}>Time References</Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              You can use these time references in both English and German:
            </Text>
            <View style={styles.triggerList}>
              <Text style={[styles.trigger, { color: theme.colors.primary }]}>today / heute</Text>
              <Text style={[styles.trigger, { color: theme.colors.primary }]}>tomorrow / morgen</Text>
            </View>

            <Text style={[styles.subheading, { color: theme.colors.text }]}>Time Formats</Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              You can specify times in various formats:
            </Text>
            <Text style={[styles.example, { color: theme.colors.secondary }]}>
              • 12-hour format: "3pm", "3:30pm", "12am"{'\n'}
              • 24-hour format: "15:00", "09:30", "14 Uhr"{'\n'}
              • Time references: "today", "tomorrow", "heute", "morgen"
            </Text>
            <Text style={[styles.note, { color: theme.colors.secondary }]}>
              If you specify a time that has already passed today, the reminder will be set for tomorrow.
            </Text>

            <Text style={[styles.subheading, { color: theme.colors.text }]}>Regular Messages</Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              Any message without trigger words will be saved as a regular note.
            </Text>
          </View>

          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Managing Items</Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              • Tap any message to mark it as read{'\n'}
              • In the List tab, tap the checkbox to mark todos as complete{'\n'}
              • For reminders, tap the clock icon to set or update the reminder time{'\n'}
              • Use the cancel button to remove a scheduled reminder
            </Text>
          </View>

          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notifications</Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              When you set a reminder, you'll receive a notification at the specified time. Notifications work even when the app is closed.
            </Text>
            <Text style={[styles.note, { color: theme.colors.secondary }]}>
              Note: Make sure to allow notifications when prompted for the best experience.
            </Text>
          </View>

          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Customization</Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              Visit the Settings tab to:{'\n'}
              • Toggle dark mode{'\n'}
              • Change the app's background color{'\n'}
              • View app information
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </BackgroundView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  example: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#007AFF',
  },
  note: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  triggerList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  trigger: {
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});