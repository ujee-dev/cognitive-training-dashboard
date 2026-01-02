export type ProgressResult = {
  status: '향상' | '유지' | '저하' | '데이터가 없습니다.';
  changeRate?: number;          // -0.45 ~ +0.30
  trend?: 'up' | 'down' | 'flat';
  duration?: 'short' | 'long';  // 일시적 / 장기
  message: string;              // 화면 표시용 문구
  color: string;               // 화면 표시용 색상
};