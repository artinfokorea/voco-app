import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.logo}>voco</Text>
          <Text style={styles.tagline}>AI와 함께하는 영어 회화</Text>
          <TouchableOpacity
            style={{
              marginTop: 20,
              backgroundColor: '#6C5CE7',
              padding: 10,
              borderRadius: 8,
            }}
            onPress={() => router.push('/auth')}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              로그인 / 회원가입 테스트
            </Text>
          </TouchableOpacity>
        </View>

        {/* 메인 카드 */}
        <TouchableOpacity
          style={styles.mainCard}
          onPress={() => router.push('/livekit')}
          activeOpacity={0.9}
        >
          <View style={styles.mainCardIcon}>
            <Text style={styles.mainCardEmoji}>🎙️</Text>
          </View>
          <Text style={styles.mainCardTitle}>대화 시작하기</Text>
          <Text style={styles.mainCardSubtitle}>
            AI 튜터와 실시간 영어 대화를 연습해보세요
          </Text>
          <View style={styles.startButton}>
            <Text style={styles.startButtonText}>Start →</Text>
          </View>
        </TouchableOpacity>

        {/* 기능 카드들 */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>학습 기능</Text>
          <View style={styles.featuresGrid}>
            <TouchableOpacity style={styles.featureCard}>
              <Text style={styles.featureEmoji}>🗣️</Text>
              <Text style={styles.featureTitle}>발음 교정</Text>
              <Text style={styles.featureDesc}>실시간 피드백</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureCard}>
              <Text style={styles.featureEmoji}>📚</Text>
              <Text style={styles.featureTitle}>상황별 회화</Text>
              <Text style={styles.featureDesc}>실전 시나리오</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureCard}>
              <Text style={styles.featureEmoji}>📊</Text>
              <Text style={styles.featureTitle}>학습 분석</Text>
              <Text style={styles.featureDesc}>진도 추적</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureCard}>
              <Text style={styles.featureEmoji}>🎯</Text>
              <Text style={styles.featureTitle}>맞춤 학습</Text>
              <Text style={styles.featureDesc}>레벨별 추천</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 통계 섹션 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>언제든 학습</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>AI</Text>
            <Text style={styles.statLabel}>실시간 튜터</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>∞</Text>
            <Text style={styles.statLabel}>무제한 대화</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#a0a0c0',
    marginTop: 8,
  },
  mainCard: {
    backgroundColor: '#6366f1',
    padding: 28,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  mainCardIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainCardEmoji: {
    fontSize: 40,
  },
  mainCardTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  mainCardSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featureEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: '#a0a0c0',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366f1',
  },
  statLabel: {
    fontSize: 12,
    color: '#a0a0c0',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
