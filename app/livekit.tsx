import {
  CallView,
  ChatView,
  ConnectionForm,
  RoomHeader,
  TabBar,
} from '@/components/livekit';
import { useLiveKit } from '@/hooks/use-livekit';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LiveKitScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'call' | 'chat'>('call');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const {
    room,
    isConnected,
    isConnecting,
    serverUrl,
    setServerUrl,
    token,
    setToken,
    isMicEnabled,
    participants,
    messages,
    connect,
    disconnect,
    toggleMic,
    sendMessage,
  } = useLiveKit();

  // 연결 전 UI
  if (!isConnected) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ConnectionForm
          serverUrl={serverUrl}
          onServerUrlChange={setServerUrl}
          token={token}
          onTokenChange={setToken}
          isConnecting={isConnecting}
          onConnect={connect}
          onBack={() => router.back()}
        />
      </View>
    );
  }

  // 연결 후 UI
  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <RoomHeader roomName={room?.name || ''} onEndCall={disconnect} />

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'call' && (
        <CallView
          participants={participants}
          isMicEnabled={isMicEnabled}
          isSpeakerOn={isSpeakerOn}
          onToggleMic={toggleMic}
          onToggleSpeaker={() => setIsSpeakerOn((prev) => !prev)}
        />
      )}

      {activeTab === 'chat' && (
        <ChatView
          messages={messages}
          onSendMessage={sendMessage}
          bottomInset={insets.bottom}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});
