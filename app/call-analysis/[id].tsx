import { getCallAnalysis } from '@/utils/api/calls';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const getScoreColor = (score: number) => {
  if (score >= 80) return '#55efc4';
  if (score >= 60) return '#ffeaa7';
  return '#ff7675';
};

const getScoreLabel = (score: number) => {
  if (score >= 90) return '훌륭해요!';
  if (score >= 80) return '잘했어요!';
  if (score >= 70) return '좋아요!';
  if (score >= 60) return '괜찮아요';
  return '더 연습해봐요';
};

interface ScoreCircleProps {
  score: number;
  size?: number;
  label?: string;
}

const ScoreCircle = ({ score, size = 120, label }: ScoreCircleProps) => {
  const color = getScoreColor(score);

  return (
    <View style={[styles.scoreCircleContainer, { width: size, height: size }]}>
      <View
        style={[
          styles.scoreCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
          },
        ]}
      >
        <Text style={[styles.scoreNumber, { color, fontSize: size * 0.35 }]}>
          {score}
        </Text>
        {label && <Text style={styles.scoreUnit}>{label}</Text>}
      </View>
    </View>
  );
};

interface ScoreBarProps {
  label: string;
  score: number;
  icon: string;
}

const ScoreBar = ({ label, score, icon }: ScoreBarProps) => {
  const color = getScoreColor(score);

  return (
    <View style={styles.scoreBarContainer}>
      <View style={styles.scoreBarHeader}>
        <View style={styles.scoreBarLabelContainer}>
          <Text style={styles.scoreBarIcon}>{icon}</Text>
          <Text style={styles.scoreBarLabel}>{label}</Text>
        </View>
        <Text style={[styles.scoreBarValue, { color }]}>{score}점</Text>
      </View>
      <View style={styles.scoreBarTrack}>
        <View
          style={[
            styles.scoreBarFill,
            { width: `${score}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

export default function CallAnalysisScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['callAnalysis', id],
    queryFn: () => getCallAnalysis(Number(id)),
    enabled: !!id,
  });

  const analysis = data?.item;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>분석 결과를 불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !analysis) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar style="light" />
        <Text style={styles.errorEmoji}>😢</Text>
        <Text style={styles.errorTitle}>오류가 발생했습니다</Text>
        <Text style={styles.errorDescription}>
          {error instanceof Error
            ? error.message
            : '분석 결과를 불러올 수 없습니다'}
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

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>통화 분석</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Score Card */}
        <View style={styles.totalScoreCard}>
          <Text style={styles.totalScoreTitle}>종합 점수</Text>
          <ScoreCircle score={analysis.score} size={140} />
          <Text
            style={[
              styles.totalScoreLabel,
              { color: getScoreColor(analysis.score) },
            ]}
          >
            {getScoreLabel(analysis.score)}
          </Text>
        </View>

        {/* Detail Scores */}
        <View style={styles.detailScoresCard}>
          <Text style={styles.sectionTitle}>세부 점수</Text>

          <ScoreBar
            label="발음"
            score={analysis.content.pronunciation}
            icon="🗣️"
          />

          <ScoreBar label="문법" score={analysis.content.grammar} icon="📝" />
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>AI 피드백</Text>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryIcon}>💬</Text>
            <Text style={styles.summaryText}>{analysis.summary}</Text>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <Text style={styles.sectionTitle}>학습 팁</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>
              매일 10분씩 꾸준히 연습하면 실력이 빠르게 향상됩니다.
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>🎯</Text>
            <Text style={styles.tipText}>
              다양한 시나리오를 경험해보세요. 실전 대화에 도움이 됩니다.
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.practiceButton}
          onPress={() => router.push('/livekit')}
        >
          <Text style={styles.practiceButtonText}>다시 연습하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  totalScoreCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  totalScoreTitle: {
    fontSize: 16,
    color: '#a0a0c0',
    marginBottom: 20,
  },
  scoreCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircle: {
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  scoreNumber: {
    fontWeight: '700',
  },
  scoreUnit: {
    fontSize: 14,
    color: '#a0a0c0',
    marginTop: 2,
  },
  totalScoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  detailScoresCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  scoreBarContainer: {
    marginBottom: 16,
  },
  scoreBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreBarLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreBarIcon: {
    fontSize: 18,
  },
  scoreBarLabel: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  scoreBarValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  scoreBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryIcon: {
    fontSize: 24,
  },
  summaryText: {
    flex: 1,
    fontSize: 15,
    color: '#d0d0e0',
    lineHeight: 24,
  },
  tipsCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    marginBottom: 24,
  },
  tipItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  tipIcon: {
    fontSize: 18,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#d0d0e0',
    lineHeight: 22,
  },
  practiceButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  practiceButtonText: {
    color: '#fff',
    fontSize: 17,
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
});
