import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface CallViewProps {
  participants: string[];
  isMicEnabled: boolean;
  isSpeakerOn: boolean;
  onToggleMic: () => void;
  onToggleSpeaker: () => void;
}

export function CallView({
  participants,
  isMicEnabled,
  isSpeakerOn,
  onToggleMic,
  onToggleSpeaker,
}: CallViewProps) {
  return (
    <View style={styles.container}>
      {/* 참가자 목록 */}
      <View style={styles.participantsSection}>
        <Text style={styles.sectionTitle}>
          참가자 ({participants.length + 1})
        </Text>
        <ScrollView style={styles.participantsList}>
          {/* 나 */}
          <View style={styles.participantItem}>
            <View style={styles.participantAvatar}>
              <Text style={styles.participantAvatarText}>👤</Text>
            </View>
            <Text style={styles.participantName}>Me (나)</Text>
            {!isMicEnabled && <Text style={styles.mutedBadge}>🔇</Text>}
          </View>

          {/* 다른 참가자들 */}
          {participants.map((p) => (
            <View key={p} style={styles.participantItem}>
              <View style={styles.participantAvatar}>
                <Text style={styles.participantAvatarText}>🤖</Text>
              </View>
              <Text style={styles.participantName}>{p}</Text>
            </View>
          ))}
        </ScrollView>
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
  participantsSection: {
    flex: 1,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  participantsList: {
    flex: 1,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a4e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  participantAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3a3a5e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  participantAvatarText: {
    fontSize: 20,
  },
  participantName: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  mutedBadge: {
    fontSize: 16,
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
