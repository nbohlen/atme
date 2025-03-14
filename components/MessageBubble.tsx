import React, { useContext } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Linking, Alert } from 'react-native';
import { format } from 'date-fns';
import { Message, LinkPreview } from '@/store/messages';
import { ThemeContext } from '@/components/ThemeProvider';
import { ExternalLink, Eye, EyeOff, Trash2 } from 'lucide-react-native';
import { useMessagesStore } from '@/store/messages';

interface MessageBubbleProps {
  message: Message;
  onPress: () => void;
}

function LinkPreviewComponent({ preview }: { preview: LinkPreview }) {
  const theme = useContext(ThemeContext);

  if (preview.loading) {
    return (
      <View style={styles.linkPreviewLoading}>
        <Text style={{ color: theme.colors.secondary }}>Loading preview...</Text>
      </View>
    );
  }

  if (preview.error) {
    return null;
  }

  return (
    <Pressable
      style={[styles.linkPreview, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
      onPress={() => Linking.openURL(preview.url)}
    >
      {preview.image && (
        <Image
          source={{ uri: preview.image }}
          style={styles.previewImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.previewContent}>
        <Text style={[styles.previewTitle, { color: theme.colors.text }]} numberOfLines={2}>
          {preview.title || preview.url}
        </Text>
        {preview.description && (
          <Text style={[styles.previewDescription, { color: theme.colors.secondary }]} numberOfLines={2}>
            {preview.description}
          </Text>
        )}
        <View style={styles.previewLink}>
          <ExternalLink size={12} color={theme.colors.secondary} />
          <Text style={[styles.previewUrl, { color: theme.colors.secondary }]} numberOfLines={1}>
            {new URL(preview.url).hostname}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function MessageBubble({ message, onPress }: MessageBubbleProps) {
  const theme = useContext(ThemeContext);
  const { encryptMessage, decryptMessage, deleteMessage } = useMessagesStore();

  const handleEncryptPress = async () => {
    if (message.encrypted) {
      await decryptMessage(message.id);
    } else {
      await encryptMessage(message.id);
    }
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => deleteMessage(message.id),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View 
        style={[
          styles.bubble, 
          !message.isRead && styles.unread,
          { backgroundColor: theme.isDark ? theme.colors.card : '#E8E8E8' }
        ]}
      >
        <View style={styles.messageHeader}>
          <Text style={[styles.text, { color: theme.colors.text }]}>
            {message.text}
          </Text>
          <View style={styles.messageActions}>
            <Pressable
              onPress={handleEncryptPress}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && { opacity: 0.7 }
              ]}
            >
              {message.encrypted ? (
                <EyeOff size={16} color={theme.colors.primary} />
              ) : (
                <Eye size={16} color={theme.colors.secondary} />
              )}
            </Pressable>
            <Pressable
              onPress={handleDeletePress}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && { opacity: 0.7 }
              ]}
            >
              <Trash2 size={16} color={theme.colors.error || '#FF3B30'} />
            </Pressable>
          </View>
        </View>
        {message.links?.map((preview, index) => (
          <LinkPreviewComponent key={preview.url} preview={preview} />
        ))}
        <Text style={[styles.time, { color: theme.colors.secondary }]}>
          {format(new Date(message.createdAt), 'HH:mm')}
        </Text>
        {!message.isRead && (
          <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
    alignSelf: 'flex-end',
  },
  unread: {
    backgroundColor: '#DCF8C6',
  },
  text: {
    fontSize: 16,
    marginRight: 40,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    position: 'absolute',
    right: 12,
    bottom: 8,
  },
  unreadDot: {
    position: 'absolute',
    right: -8,
    top: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: -4,
  },
  linkPreview: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 24,
  },
  linkPreviewLoading: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  previewContent: {
    padding: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 12,
    marginBottom: 8,
  },
  previewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewUrl: {
    fontSize: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  messageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
});