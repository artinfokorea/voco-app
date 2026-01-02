/**
 * 날짜를 상대적 시간 문자열로 포맷팅
 *
 * @description
 * - 1시간 미만: "N분 전"
 * - 24시간 미만: "N시간 전"
 * - 1일: "어제"
 * - 7일 미만: "N일 전"
 * - 7일 이상: "YYYY년 M월 D일" 형식
 *
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @returns 상대적 시간 문자열 (한국어)
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}분 전`;
    }
    return `${hours}시간 전`;
  } else if (days === 1) {
    return '어제';
  } else if (days < 7) {
    return `${days}일 전`;
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Seoul',
    });
  }
}
