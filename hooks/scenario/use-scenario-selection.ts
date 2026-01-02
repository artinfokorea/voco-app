import { Scenario, useScenariosQuery } from '@/apis/scenarios';
import { Level, LevelType } from '@/constants/enums';
import { useCallback, useState } from 'react';

/**
 * 시나리오 선택 상태 및 레벨별 시나리오 조회를 관리하는 훅
 *
 * @description
 * - 레벨 탭 선택 상태 관리
 * - 선택된 레벨에 따른 시나리오 목록 조회
 * - 시나리오 선택 상태 관리
 */
export function useScenarioSelection() {
  const [selectedLevel, setSelectedLevel] = useState<LevelType>(Level.BEGINNER);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  const { data, isLoading, isError } = useScenariosQuery({
    level: selectedLevel,
    page: 1,
    size: 20,
  });

  const scenarios = data?.content ?? [];

  /**
   * 레벨 변경 시 시나리오 선택 초기화
   */
  const handleLevelChange = useCallback((level: LevelType) => {
    setSelectedLevel(level);
    setSelectedScenario(null);
  }, []);

  /**
   * 시나리오 선택
   */
  const handleScenarioSelect = useCallback((scenario: Scenario) => {
    setSelectedScenario(scenario);
  }, []);

  /**
   * 선택된 시나리오가 있는지 확인
   */
  const hasSelection = selectedScenario !== null;

  return {
    // 레벨 상태
    selectedLevel,
    handleLevelChange,

    // 시나리오 상태
    scenarios,
    selectedScenario,
    handleScenarioSelect,
    hasSelection,

    // 로딩/에러 상태
    isLoading,
    isError,
  };
}
