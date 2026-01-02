import { Conversation, getCallDetail } from '@/apis/calls';
import { getScoreColor, getScoreLabel } from '@/utils/score';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

interface ConversationItemProps {
  item: Conversation;
  index: number;
}

const ConversationItem = ({ item, index }: ConversationItemProps) => {
  const isUser = item.role === 'user';
  const hasError = !!item.error;

  return (
    <View
      style={[
        styles.conversationItem,
        isUser ? styles.conversationUser : styles.conversationAgent,
      ]}
    >
      <View style={styles.conversationHeader}>
        <Text style={styles.conversationRole}>{isUser ? '나' : 'AI'}</Text>
        {hasError && <Text style={styles.errorBadge}>오류</Text>}
      </View>
      <Text style={styles.conversationContent}>{item.content}</Text>
      {hasError && item.error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorType}>
            {item.error.errorType} - {item.error.errorSubtype}
          </Text>
          <Text style={styles.errorSegment}>
            {`"${item.error.errorSegment}" → "${item.error.correction}"`}
          </Text>
          <Text style={styles.errorExplanation}>{item.error.explanation}</Text>
        </View>
      )}
    </View>
  );
};

interface FeedbackSectionProps {
  title: string;
  items: string[];
  icon: string;
  color: string;
}

const FeedbackSection = ({
  title,
  items,
  icon,
  color,
}: FeedbackSectionProps) => {
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.feedbackSection}>
      <View style={styles.feedbackHeader}>
        <Text style={styles.feedbackIcon}>{icon}</Text>
        <Text style={[styles.feedbackTitle, { color }]}>{title}</Text>
      </View>
      {items.map((item, index) => (
        <View key={index} style={styles.feedbackItem}>
          <Text style={styles.feedbackBullet}>•</Text>
          <Text style={styles.feedbackText}>{item}</Text>
        </View>
      ))}
    </View>
  );
};

export default function CallAnalysisScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showConversation, setShowConversation] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['callDetail', id],
    queryFn: () => getCallDetail(Number(id)),
    enabled: !!id,
  });

  const detail = data?.item;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>분석 결과를 불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !detail) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style="light" />
        <Text style={styles.errorEmoji}>😢</Text>
        <Text style={styles.errorTitle}>오류가 발생했습니다</Text>
        <Text style={styles.errorDescription}>
          {error instanceof Error
            ? error.message
            : '통화 상세 정보를 불러올 수 없습니다'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>통화 상세</Text>
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
        <View style={styles.scenarioInfo}>
          <Text style={styles.scenarioName}>{detail.scenarioName}</Text>
          <Text style={styles.scenarioLevel}>{detail.scenarioLevel}</Text>
        </View>

        <View style={styles.totalScoreCard}>
          <Text style={styles.totalScoreTitle}>종합 점수</Text>
          <ScoreCircle score={detail.overallScore} size={140} />
          <Text
            style={[
              styles.totalScoreLabel,
              { color: getScoreColor(detail.overallScore) },
            ]}
          >
            {getScoreLabel(detail.overallScore)}
          </Text>
        </View>

        <View style={styles.detailScoresCard}>
          <Text style={styles.sectionTitle}>세부 점수</Text>

          <ScoreBar
            label="과제 완성도"
            score={detail.taskCompletionScore}
            icon="✅"
          />
          <View style={styles.summaryBox}>
            <Text style={styles.summaryBoxText}>
              {detail.taskCompletionSummary}
            </Text>
          </View>

          <ScoreBar
            label="언어 정확도"
            score={detail.languageAccuracyScore}
            icon="📝"
          />
          <View style={styles.summaryBox}>
            <Text style={styles.summaryBoxText}>
              {detail.languageAccuracySummary}
            </Text>
          </View>
        </View>

        {detail.conversation && detail.conversation.length > 0 && (
          <View style={styles.conversationCard}>
            <TouchableOpacity
              style={styles.conversationToggle}
              onPress={() => setShowConversation(!showConversation)}
            >
              <Text style={styles.sectionTitle}>대화 내역</Text>
              <Text style={styles.toggleIcon}>
                {showConversation ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            {showConversation && (
              <View style={styles.conversationList}>
                {detail.conversation.map((item, index) => (
                  <ConversationItem key={index} item={item} index={index} />
                ))}
              </View>
            )}
          </View>
        )}

        {detail.feedback && (
          <View style={styles.feedbackCard}>
            <Text style={styles.sectionTitle}>AI 피드백</Text>
            <FeedbackSection
              title="잘한 점"
              items={detail.feedback.strengths}
              icon="💪"
              color="#55efc4"
            />
            <FeedbackSection
              title="개선할 점"
              items={detail.feedback.improvements}
              icon="📈"
              color="#fdcb6e"
            />
            <FeedbackSection
              title="집중 영역"
              items={detail.feedback.focusAreas}
              icon="🎯"
              color="#74b9ff"
            />
            <FeedbackSection
              title="학습 팁"
              items={detail.feedback.tips}
              icon="💡"
              color="#a29bfe"
            />
          </View>
        )}

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
  scenarioInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scenarioName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginRight: 12,
  },
  scenarioLevel: {
    flexShrink: 0,
    fontSize: 14,
    color: '#a0a0c0',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  summaryBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  summaryBoxText: {
    fontSize: 14,
    color: '#d0d0e0',
    lineHeight: 20,
  },
  conversationCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  conversationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleIcon: {
    fontSize: 14,
    color: '#a0a0c0',
  },
  conversationList: {
    marginTop: 16,
    gap: 12,
  },
  conversationItem: {
    borderRadius: 12,
    padding: 12,
  },
  conversationUser: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    marginLeft: 24,
  },
  conversationAgent: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 24,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  conversationRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a0a0c0',
  },
  errorBadge: {
    fontSize: 10,
    color: '#ff6b6b',
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  conversationContent: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ff6b6b',
  },
  errorType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff6b6b',
    marginBottom: 4,
  },
  errorSegment: {
    fontSize: 13,
    color: '#fdcb6e',
    marginBottom: 4,
  },
  errorExplanation: {
    fontSize: 12,
    color: '#d0d0e0',
    lineHeight: 18,
  },
  feedbackCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 24,
  },
  feedbackSection: {
    marginTop: 16,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  feedbackIcon: {
    fontSize: 16,
  },
  feedbackTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  feedbackItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
    paddingLeft: 24,
  },
  feedbackBullet: {
    color: '#a0a0c0',
  },
  feedbackText: {
    flex: 1,
    fontSize: 14,
    color: '#d0d0e0',
    lineHeight: 20,
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
