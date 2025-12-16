import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface ConnectionFormProps {
  serverUrl: string;
  onServerUrlChange: (url: string) => void;
  token: string;
  onTokenChange: (token: string) => void;
  isConnecting: boolean;
  onConnect: () => void;
  onBack: () => void;
}

export function ConnectionForm({
  serverUrl,
  onServerUrlChange,
  token,
  onTokenChange,
  isConnecting,
  onConnect,
  onBack,
}: ConnectionFormProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>LiveKit 연결</Text>

      <View style={styles.statusContainer}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>연결 안됨</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>서버 URL</Text>
        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={onServerUrlChange}
          placeholder="wss://your-server.livekit.cloud"
          placeholderTextColor="#666"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>토큰</Text>
        <TextInput
          style={[styles.input, styles.tokenInput]}
          value={token}
          onChangeText={onTokenChange}
          placeholder="access token"
          placeholderTextColor="#666"
          autoCapitalize="none"
          autoCorrect={false}
          multiline
        />
      </View>

      <TouchableOpacity
        style={[styles.connectButton, isConnecting && styles.buttonDisabled]}
        onPress={onConnect}
        disabled={isConnecting}
      >
        <Text style={styles.connectButtonText}>
          {isConnecting ? '연결 중...' : '🎙️ 연결하기'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← 돌아가기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
    backgroundColor: '#f87171',
  },
  statusText: {
    color: '#a0a0c0',
    fontSize: 14,
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  label: {
    color: '#a0a0c0',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3a3a5e',
  },
  tokenInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  connectButton: {
    backgroundColor: '#6366f1',
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    marginTop: 20,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6366f1',
    fontSize: 16,
  },
});
