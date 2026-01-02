/**
 * 공통 API 응답 타입
 * 모든 API 응답은 이 타입을 기반으로 합니다.
 */

// API 예외 정보
export interface ApiException {
  errorNo: string;
  message: string;
  validation?: Record<string, string>;
}

// 기본 API 응답 타입
export interface ApiResponse<T> {
  type: 'SUCCESS' | 'FAIL';
  exception: ApiException | null;
  item: T;
}

// 페이지네이션 정렬 정보
export interface PageSort {
  empty: boolean;
  unsorted: boolean;
  sorted: boolean;
}

// 페이지네이션 정보
export interface Pageable {
  offset: number;
  sort: PageSort;
  unpaged: boolean;
  paged: boolean;
  pageNumber: number;
  pageSize: number;
}

// 페이지네이션 아이템 (Spring Data JPA Page 구조)
export interface PagedItem<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: PageSort;
  numberOfElements: number;
  pageable: Pageable;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// 간소화된 페이지네이션 아이템
export interface SimplePagedItem<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// 페이지네이션 응답 (Spring Data JPA Page 구조)
export type PagedResponse<T> = ApiResponse<PagedItem<T>>;

// 간소화된 페이지네이션 응답
export type SimplePagedResponse<T> = ApiResponse<SimplePagedItem<T>>;

// 서버 에러 타입
export type ServerError = Error & {
  errorNo?: string;
  validation?: Record<string, string>;
};

// 서버 에러 생성 헬퍼
export const createServerError = (
  data: ApiResponse<unknown>
): ServerError => {
  const error = new Error(
    data.exception?.message || 'Request failed'
  ) as ServerError;
  error.errorNo = data.exception?.errorNo;
  error.validation = data.exception?.validation;
  return error;
};
