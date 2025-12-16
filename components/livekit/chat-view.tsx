import { ChatMessage } from '@/hooks/use-livekit';
import { useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  bottomInset?: number;
}

export function ChatView({
  messages,
  onSendMessage,
  bottomInset = 0,
}: ChatViewProps) {
  const [inputMessage, setInputMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageItem,
        item.isLocal ? styles.localMessage : styles.remoteMessage,
        item.sender === 'System' && styles.systemMessage,
      ]}
    >
      {item.sender !== 'System' && !item.isLocal && (
        <Text style={styles.messageSender}>{item.sender}</Text>
      )}
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

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={renderMessage}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>메시지가 없습니다</Text>
          </View>
        }
      />

      {/* 메시지 입력 */}
      <View style={[styles.inputBar, { paddingBottom: bottomInset + 10 }]}>
        <TextInput
          style={styles.chatInput}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="메시지 입력..."
          placeholderTextColor="#666"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputMessage.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputMessage.trim()}
        >
          <Text style={styles.sendButtonText}>전송</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageItem: {
    maxWidth: '80%',
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
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyChatText: {
    color: '#666',
    fontSize: 14,
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#16213e',
    alignItems: 'flex-end',
    gap: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#2a2a4e',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
