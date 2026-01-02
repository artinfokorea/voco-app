import { CallRecord } from '@/apis/calls';
import { GradeColors } from '@/constants/enums';
import { useInfiniteCalls } from '@/hooks/calls';
import { formatRelativeDate } from '@/utils/format';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CallItemProps {
  item: CallRecord;
  onPress: (item: CallRecord) => void;
}

const Separator = () => <View style={styles.separator} />;

const CallItem = ({ item, onPress }: CallItemProps) => {
  const gradeColor = GradeColors[item.grade];

  return (
    <TouchableOpacity
      style={styles.callCard}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.callCardHeader}>
        <Text style={styles.callTitle}>{item.scenarioName}</Text>
        <View
          style={[styles.gradeBadge, { backgroundColor: gradeColor + '20' }]}
        >
          <Text style={[styles.gradeText, { color: gradeColor }]}>
            {item.grade}
          </Text>
        </View>
      </View>

      <View style={styles.callCardFooter}>
        <Text style={styles.callDate}>
          {formatRelativeDate(item.createdAt)}
        </Text>
        <View style={styles.viewAnalysisButton}>
          <Text style={styles.viewAnalysisText}>분석 보기 →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function CallsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    calls,
    totalElements,
    isLoading,
    isError,
    error,
    refreshing,
    isFetchingNextPage,
    onRefresh,
    onEndReached,
    refetch,
  } = useInfiniteCalls();

  const handleCallPress = (item: CallRecord) => {
    router.push(`/call-analysis/${item.callId}`);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>📞</Text>
      <Text style={styles.emptyTitle}>통화 내역이 없습니다</Text>
      <Text style={styles.emptyDescription}>
        AI 튜터와 대화를 시작하면{'\n'}여기에 기록이 표시됩니다
      </Text>
      <TouchableOpacity
        style={styles.startCallButton}
        onPress={() => router.push('/livekit')}
      >
        <Text style={styles.startCallButtonText}>대화 시작하기</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#6366f1" />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>통화 내역을 불러오는 중...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar style="light" />
        <Text style={styles.errorEmoji}>😢</Text>
        <Text style={styles.errorTitle}>오류가 발생했습니다</Text>
        <Text style={styles.errorDescription}>
          {error instanceof Error
            ? error.message
            : '통화 내역을 불러올 수 없습니다'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>통화 내역</Text>
        {totalElements > 0 && (
          <Text style={styles.headerSubtitle}>총 {totalElements}개의 대화</Text>
        )}
      </View>

      <FlatList
        data={calls}
        renderItem={({ item }) => (
          <CallItem item={item} onPress={handleCallPress} />
        )}
        keyExtractor={(item) => item.callId.toString()}
        contentContainerStyle={[
          styles.listContent,
          calls.length === 0 && styles.emptyListContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
            colors={['#6366f1']}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={Separator}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a0a0c0',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  separator: {
    height: 12,
  },
  callCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  callCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  callTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginRight: 12,
  },
  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  callCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  callDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  viewAnalysisButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 8,
  },
  viewAnalysisText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#a0a0c0',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 40,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: '#a0a0c0',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#a0a0c0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  startCallButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  startCallButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
