import { Scenario } from '@/apis/scenarios';
import { Level, LevelType } from '@/constants/enums';
import { useScenarioSelection } from '@/hooks/scenario';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ConnectionFormProps {
  isConnecting: boolean;
  onConnect: (scenarioId: number, scenarioName: string) => void;
  onBack: () => void;
}

const LEVEL_TABS: { key: LevelType; label: string }[] = [
  { key: Level.BEGINNER, label: '초급' },
  { key: Level.INTERMEDIATE, label: '중급' },
  { key: Level.ADVANCED, label: '고급' },
];

export function ConnectionForm({
  isConnecting,
  onConnect,
  onBack,
}: ConnectionFormProps) {
  const {
    selectedLevel,
    handleLevelChange,
    scenarios,
    selectedScenario,
    handleScenarioSelect,
    hasSelection,
    isLoading,
    isError,
  } = useScenarioSelection();

  const handleStart = () => {
    if (selectedScenario) {
      onConnect(selectedScenario.scenarioId, selectedScenario.name);
    }
  };

  const renderScenarioCard = ({ item }: { item: Scenario }) => {
    const isSelected = selectedScenario?.scenarioId === item.scenarioId;
    return (
      <TouchableOpacity
        style={[styles.scenarioCard, isSelected && styles.scenarioCardSelected]}
        onPress={() => handleScenarioSelect(item)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.scenarioTitle,
            isSelected && styles.scenarioTitleSelected,
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← 돌아가기</Text>
      </TouchableOpacity>

      <Text style={styles.title}>시나리오 선택</Text>
      <Text style={styles.subtitle}>대화할 시나리오를 선택해주세요</Text>

      <View style={styles.levelTabs}>
        {LEVEL_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.levelTab,
              selectedLevel === tab.key && styles.levelTabSelected,
            ]}
            onPress={() => handleLevelChange(tab.key)}
          >
            <Text
              style={[
                styles.levelTabText,
                selectedLevel === tab.key && styles.levelTabTextSelected,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.scenarioListContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>시나리오 불러오는 중...</Text>
          </View>
        ) : isError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>시나리오를 불러오지 못했습니다</Text>
          </View>
        ) : scenarios.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>시나리오가 없습니다</Text>
          </View>
        ) : (
          <FlatList
            data={scenarios}
            keyExtractor={(item) => item.scenarioId.toString()}
            renderItem={renderScenarioCard}
            contentContainerStyle={styles.scenarioList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.connectButton,
          (!hasSelection || isConnecting) && styles.buttonDisabled,
        ]}
        onPress={handleStart}
        disabled={!hasSelection || isConnecting}
      >
        <Text style={styles.connectButtonText}>
          {isConnecting ? '연결 중...' : '대화 시작하기'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#6366f1',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#a0a0c0',
    marginTop: 8,
    marginBottom: 24,
  },
  levelTabs: {
    flexDirection: 'row',
    backgroundColor: '#252542',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  levelTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  levelTabSelected: {
    backgroundColor: '#6366f1',
  },
  levelTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#a0a0c0',
  },
  levelTabTextSelected: {
    color: '#fff',
  },
  scenarioListContainer: {
    flex: 1,
    marginBottom: 16,
  },
  scenarioList: {
    paddingBottom: 8,
  },
  scenarioCard: {
    backgroundColor: '#252542',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  scenarioCardSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#2d2d52',
  },
  scenarioTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  scenarioTitleSelected: {
    color: '#a5b4fc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#a0a0c0',
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#f87171',
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#a0a0c0',
    fontSize: 15,
  },
  connectButton: {
    backgroundColor: '#6366f1',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
