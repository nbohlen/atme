import React, { useState, useContext } from 'react';
import { View, TextInput, Pressable, StyleSheet, Platform, Text } from 'react-native';
import { Send } from 'lucide-react-native';
import { MessageType } from '@/store/messages';
import { ThemeContext } from '@/components/ThemeProvider';

interface MessageInputProps {
  onSend: (text: string, type: MessageType) => void;
}

const MAX_MESSAGE_LENGTH = 1000;

// Trigger words in English and German
const TRIGGERS = {
  todo: ['todo', 'td', 't', 'aufgabe', 'todo'],
  reminder: ['remind', 'reminder', 'rm', 'r', 'erinnere', 'erinnerung', 'erinnern'],
  time: {
    today: ['today', 'heute'],
    tomorrow: ['tomorrow', 'morgen'],
  }
};

function sanitizeInput(text: string): string {
  return text
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .trim();
}

function validateUrls(text: string): boolean {
  const urlPattern = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlPattern);
  
  if (!urls) return true;

  return urls.every(url => {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  });
}

function removeTimeWords(text: string): string {
  let cleanText = text;
  
  // Remove time-related words in both languages
  Object.values(TRIGGERS.time).flat().forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleanText = cleanText.replace(regex, '');
  });

  return cleanText.trim();
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const theme = useContext(ThemeContext);

  const handleTextChange = (newText: string) => {
    setError(null);
    setText(newText);
  };

  const handleSend = () => {
    if (!text.trim()) {
      return;
    }

    if (text.length > MAX_MESSAGE_LENGTH) {
      setError(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
      return;
    }

    if (!validateUrls(text)) {
      setError('Invalid URL detected');
      return;
    }

    const sanitizedText = sanitizeInput(text);
    
    if (!sanitizedText) {
      setError('Invalid message content');
      return;
    }

    const lowerText = sanitizedText.toLowerCase();
    const words = lowerText.split(/\s+/);
    const firstWord = words[0];
    
    let type: MessageType = 'note';
    let cleanText = sanitizedText;

    // Check for todo triggers
    if (TRIGGERS.todo.includes(firstWord)) {
      type = 'todo';
      cleanText = words.slice(1).join(' ').trim();
    }
    // Check for reminder triggers
    else if (TRIGGERS.reminder.some(trigger => lowerText.includes(trigger))) {
      type = 'reminder';
      // Remove reminder triggers
      TRIGGERS.reminder.forEach(trigger => {
        const regex = new RegExp(`\\b${trigger}\\b\\s*(mich)?\\s*(an)?\\s*(zu)?\\s*`, 'gi');
        cleanText = cleanText.replace(regex, '');
      });
      
      // Remove time-related words while preserving actual time values
      cleanText = removeTimeWords(cleanText);
    }

    // Capitalize first letter if needed
    if (cleanText.length > 0 && cleanText[0].toLowerCase() === cleanText[0]) {
      cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
    }

    onSend(cleanText, type);
    setText('');
    setError(null);
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.colors.background,
        borderTopColor: theme.colors.border 
      }
    ]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: theme.isDark ? theme.colors.card : '#f0f0f0',
              color: theme.colors.text 
            },
            error && styles.inputError
          ]}
          value={text}
          onChangeText={handleTextChange}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.secondary}
          multiline
          maxLength={MAX_MESSAGE_LENGTH}
          onKeyPress={handleKeyPress}
          blurOnSubmit={false}
          autoCorrect={true}
          spellCheck={true}
        />
        {error && (
          <Text style={[styles.errorText, { color: theme.colors.error || '#FF3B30' }]}>
            {error}
          </Text>
        )}
      </View>
      <Pressable 
        onPress={handleSend}
        disabled={!text.trim() || !!error}
        style={({ pressed }) => [
          styles.sendButton,
          pressed && styles.sendButtonPressed,
          (!text.trim() || !!error) && styles.sendButtonDisabled
        ]}
      >
        <Send 
          size={24} 
          color={(!text.trim() || !!error) ? theme.colors.secondary : theme.colors.primary} 
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 8,
    borderTopWidth: 1,
  },
  inputContainer: {
    flex: 1,
    marginRight: 8,
  },
  input: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 40,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  sendButtonPressed: {
    opacity: 0.7,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});