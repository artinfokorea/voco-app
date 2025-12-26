import { ChatMessage } from '@/hooks/use-livekit';
import { useEffect, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface CallViewProps {
  messages: ChatMessage[];
  isMicEnabled: boolean;
  isSpeakerOn: boolean;
  onToggleMic: () => void;
  onToggleSpeaker: () => void;
}

export function CallView({
  messages,
  isMicEnabled,
  isSpeakerOn,
  onToggleMic,
  onToggleSpeaker,
}: CallViewProps) {
  const messagesRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        messagesRef.current?.scrollToEnd({ animated: true });
      });
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, [messages]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isAgent = item.sender.toLowerCase().includes('agent');
    const displaySender =
      item.sender === 'System' ? '' : item.isLocal ? '나' : isAgent ? '에이전트' : item.sender;

    return (
      <View
        style={[
          styles.messageItem,
          item.isLocal ? styles.localMessage : styles.remoteMessage,
          item.sender === 'System' && styles.systemMessage,
        ]}
      >
        {displaySender ? (
          <Text style={styles.messageSender}>{displaySender}</Text>
        ) : null}
        <Text
          style={[
            styles.messageText,
            item.sender === 'System' && styles.systemMessageText,
          ]}
        >
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 대화(전사) */}
      <View style={styles.transcriptSection}>
        <Text style={styles.sectionTitle}>대화</Text>
        <FlatList
          ref={messagesRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>대화 내역이 없습니다</Text>
            </View>
          }
          onContentSizeChange={() =>
            messagesRef.current?.scrollToEnd({ animated: true })
          }
        />
      </View>

      {/* 컨트롤 버튼들 */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            !isMicEnabled && styles.controlButtonOff,
          ]}
          onPress={onToggleMic}
        >
          <Text style={styles.controlIcon}>{isMicEnabled ? '🎤' : '🔇'}</Text>
          <Text style={styles.controlLabel}>
            {isMicEnabled ? '음소거' : '음소거 해제'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            !isSpeakerOn && styles.controlButtonOff,
          ]}
          onPress={onToggleSpeaker}
        >
          <Text style={styles.controlIcon}>{isSpeakerOn ? '🔊' : '🔈'}</Text>
          <Text style={styles.controlLabel}>
            {isSpeakerOn ? '스피커' : '스피커 끔'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  transcriptSection: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: 8,
  },
  messageItem: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  localMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366f1',
  },
  remoteMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2a2a4e',
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  messageSender: {
    color: '#a0a0c0',
    fontSize: 12,
    marginBottom: 4,
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
  },
  systemMessageText: {
    color: '#666',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyChatText: {
    color: '#666',
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 20,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2a2a4e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonOff: {
    backgroundColor: '#ef4444',
  },
  controlIcon: {
    fontSize: 28,
  },
  controlLabel: {
    color: '#a0a0c0',
    fontSize: 11,
    marginTop: 4,
  },
});
