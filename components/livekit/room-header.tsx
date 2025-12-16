import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RoomHeaderProps {
  roomName: string;
  onEndCall: () => void;
}

export function RoomHeader({ roomName, onEndCall }: RoomHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.statusDot} />
        <Text style={styles.headerTitle}>{roomName || '통화 중'}</Text>
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
