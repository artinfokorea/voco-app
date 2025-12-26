import {
  CallView,
  ConnectionForm,
  RoomHeader,
} from '@/components/livekit';
import { useLiveKit } from '@/hooks/use-livekit';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LiveKitScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const {
    room,
    isConnected,
    isConnecting,
    agentIdentity,
    isAgentConnected,
    isMicEnabled,
    messages,
    connect,
    disconnect,
    toggleMic,
  } = useLiveKit();

  // 연결 전 UI
  if (!isConnected) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ConnectionForm
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
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <RoomHeader
        roomName={room?.name || ''}
        isAgentConnected={isAgentConnected}
        agentIdentity={agentIdentity}
        onEndCall={disconnect}
      />

      <CallView
        messages={messages}
        isMicEnabled={isMicEnabled}
        isSpeakerOn={isSpeakerOn}
        onToggleMic={toggleMic}
        onToggleSpeaker={() => setIsSpeakerOn((prev) => !prev)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});
