import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RoomHeaderProps {
  roomName: string;
  isAgentConnected: boolean;
  agentIdentity: string | null;
  onEndCall: () => void;
}

export function RoomHeader({
  roomName,
  isAgentConnected,
  agentIdentity,
  onEndCall,
}: RoomHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.roomRow}>
          <View style={styles.statusDot} />
          <Text style={styles.headerTitle}>{roomName || '통화 중'}</Text>
        </View>
        <View style={styles.agentRow}>
          <View
            style={[
              styles.agentDot,
              isAgentConnected ? styles.agentDotOn : styles.agentDotOff,
            ]}
          />
          <Text style={styles.agentText}>
            {isAgentConnected
              ? `에이전트 연결됨${agentIdentity ? ` (${agentIdentity})` : ''}`
              : '에이전트 대기중'}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.endCallButton} onPress={onEndCall}>
        <Text style={styles.endCallText}>종료</Text>
      </TouchableOpacity>
    </View>
  );
}

interface TabBarProps {
  activeTab: 'call' | 'chat';
  onTabChange: (tab: 'call' | 'chat') => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <View style={styles.tabs}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'call' && styles.activeTab]}
        onPress={() => onTabChange('call')}
      >
        <Text
          style={[styles.tabText, activeTab === 'call' && styles.activeTabText]}
        >
          🎙️ 통화
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
        onPress={() => onTabChange('chat')}
      >
        <Text
          style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}
        >
          💬 채팅
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
    backgroundColor: '#4ade80',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  agentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  agentDotOn: {
    backgroundColor: '#4ade80',
  },
  agentDotOff: {
    backgroundColor: '#fbbf24',
  },
  agentText: {
    color: '#a0a0c0',
    fontSize: 13,
    flexShrink: 1,
  },
  endCallButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  endCallText: {
    color: '#fff',
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
  },
  tabText: {
    color: '#666',
    fontSize: 16,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
});
