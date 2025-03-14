import React from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { MessageBubble } from '@/components/MessageBubble';
import { MessageInput } from '@/components/MessageInput';
import { useMessagesStore } from '@/store/messages';
import { useBackgroundStore } from '@/store/background';
import { BackgroundView } from '@/components/BackgroundView';

export default function ChatScreen() {
  const { messages, addMessage, markAsRead } = useMessagesStore();
  const { background } = useBackgroundStore();

  return (
    <BackgroundView settings={background}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={0}
        >
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                onPress={() => markAsRead(item.id)}
              />
            )}
            inverted
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
          <MessageInput onSend={addMessage} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
  },
});