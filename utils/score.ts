/**
 * 점수에 따른 색상 반환
 *
 * @param score - 0~100 사이의 점수
 * @returns 점수 구간에 맞는 색상 코드
 *   - 80 이상: 초록색 (#55efc4)
 *   - 60 이상: 노란색 (#ffeaa7)
 *   - 60 미만: 빨간색 (#ff7675)
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return '#55efc4';
  if (score >= 60) return '#ffeaa7';
  return '#ff7675';
}

/**
 * 점수에 따른 한글 라벨 반환
 *
 * @param score - 0~100 사이의 점수
 * @returns 점수 구간에 맞는 격려 메시지
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return '훌륭해요!';
  if (score >= 80) return '잘했어요!';
  if (score >= 70) return '좋아요!';
  if (score >= 60) return '괜찮아요';
  return '더 연습해봐요';
}
