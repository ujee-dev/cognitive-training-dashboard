// 데이터 평균 계산
export function calcAverage(data: number[]) {
  if (data.length === 0) return 0;
  
  /* ----- reduce() 메서드 ----- */
  // - JavaScript에서 배열의 모든 요소를 하나로 "줄이는" 메서드
  // - 배열의 합계를 구하거나 평균을 구할 때 사용
  // - 콜백 함수를 인수로 받으며, 두 개의 인자를 받음
  //   > a: 누적값 (현재까지 계산된 값)
  //   > b: 현재 처리 중인 값, 배열의 각 요소

  // a의 시작값을 0으로 설정 > 각 배열의 값을 더하여 총합을 반환 > 배열의 길이로 나누기 = 배열의 평균값
  const avg = data.reduce((a,b) => a + b, 0) / data.length;
  return Math.round(avg * 10) / 10;
}