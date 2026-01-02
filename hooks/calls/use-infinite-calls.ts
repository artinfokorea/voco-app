import { getCalls } from '@/apis/calls';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useState } from 'react';

const PAGE_SIZE = 10;

/**
 * 통화 목록 무한 스크롤 조회를 관리하는 훅
 *
 * @description
 * - 페이지네이션된 통화 목록 조회
 * - 무한 스크롤을 위한 fetchNextPage 지원
 * - pull-to-refresh 지원
 */
export function useInfiniteCalls() {
  const [refreshing, setRefreshing] = useState(false);
  const lastFetchTimeRef = useRef<number>(0);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['calls'],
    queryFn: ({ pageParam }) =>
      getCalls({ page: pageParam, size: PAGE_SIZE }),
    getNextPageParam: (lastPage) => {
      if (!lastPage?.item || lastPage.item.last) return undefined;
      const currentPage = lastPage.item.number ?? 0;
      return currentPage + 1;
    },
    initialPageParam: 0,
  });

  /** 전체 통화 목록 (페이지 병합, 중복 제거) */
  const calls = useMemo(() => {
    const allCalls = data?.pages.flatMap((page) => page.item.content) ?? [];
    return allCalls.filter(
      (call, index, self) =>
        index === self.findIndex((c) => c.callId === call.callId)
    );
  }, [data?.pages]);

  /** 전체 통화 수 */
  const totalElements = data?.pages[0]?.item.totalElements ?? 0;

  /**
   * pull-to-refresh 핸들러
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  /**
   * 리스트 끝 도달 시 다음 페이지 로드
   * 디바운싱으로 중복 호출 방지 (500ms)
   */
  const onEndReached = useCallback(() => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;

    if (
      hasNextPage &&
      !isFetchingNextPage &&
      !isFetching &&
      !isLoading &&
      timeSinceLastFetch > 500
    ) {
      lastFetchTimeRef.current = now;
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetching, isLoading, fetchNextPage]);

  return {
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
  };
}
