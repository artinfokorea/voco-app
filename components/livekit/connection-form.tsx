import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ConnectionFormProps {
  isConnecting: boolean;
  onConnect: () => void;
  onBack: () => void;
}

export function ConnectionForm({
  isConnecting,
  onConnect,
  onBack,
}: ConnectionFormProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>음성 통화</Text>

      <View style={styles.statusContainer}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>연결 안됨</Text>
      </View>

      <TouchableOpacity
        style={[styles.connectButton, isConnecting && styles.buttonDisabled]}
        onPress={onConnect}
        disabled={isConnecting}
      >
        <Text style={styles.connectButtonText}>
          {isConnecting ? '연결 중...' : '🎙️ 시작하기'}
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
