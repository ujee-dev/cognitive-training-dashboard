/**
 * 가중치 설정
 */
const CALC_WEIGHT = {
  ACC_WEIGHT: 0.6,       // 정확도 가중치 60%
  REACTION_WEIGHT: 0.4,  // 반응속도 가중치 40%
};

// reactionScore 구하기
export function normalizeReaction(sec: number) {
  if (sec <= 0.4) return 100; // 최고점: 반응속도 한계치로 봄 (변별력 낮음)
  if (sec >= 2.0) return 0;   // 최저점: 인지, 집중 저하로 판단
  // 0.5 ~ 1.9 sec: 실제 실력 차이가 드러나는 구간 > 선형 감점

  // 유효한 반응속도 구간 = 2.0 - 0.4 = 1.6 = 점수가 선형으로 감소하는 전체 구간
  // 1. (sec-0.4) :최소 반응속도(0점 감점 시작점)로부터 얼마나 느린지
  // 2. / 1.6 : 그 느려진 정도를 0 ~ 1 사이 비율로 정규화
  //    >> 결과적으로 균등하게 감소하는 선형 스케일
  // 3. (100 - 최종적으로 계산된 백분율 값) -> 반대 방향으로 값을 조정: sec가 느릴수록 감점
  // ex. 0.5 sec -> (0.1 / 1.6) -> 0.0625 * 100 -> 100 - 6.25 => Math.round(93.75) = 94
  //     1.2 sec -> (0.8 / 1.6) -> 0.5 * 100 -> 100 - 50 => Math.round(50) = 50
  //     1.9 sec -> (1.5 / 1.6) -> 0.9375 * 100 -> 100 - 93.75 => Math.round(6.25) = 6
  return Math.round(100 - ((sec - 0.4) / 1.6) * 100);
}

export function calcSkillScore(
  accuracy: number,
  avgReaction: number
) {
  // reactionScore 구하기 호출 실행
  const reactionScore = normalizeReaction(avgReaction);
  return Math.round(
    accuracy * CALC_WEIGHT.ACC_WEIGHT + reactionScore * CALC_WEIGHT.REACTION_WEIGHT
  );
}