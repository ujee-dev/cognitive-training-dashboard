import type { StoredGameResult } from '../types/storage';
import type { ProgressResult } from '../types/progress'
import { calcAverage } from './calcAverage';

/**
 * 판정 기준 및 테마 설정
 * 로직 변경이나 디자인 변경 시 이 부분만 수정하면 됩니다.
 */
const CONFIG = {
  MIN_DATA_FOR_TREND: 5,       // 추세 분석을 위한 최소 데이터 수
  SHORT_TERM_THRESHOLD: 0.20,  // 단기 데이터 변화율 임계치: 단기 데이터는 변동성이 크므로 20% 이상 변할 때만 확정
  CONSISTENCY_THRESHOLD: 0.10, // 단기 데이터 일관성 임계치: 중간 점수가 첫 점수보다 너무 낮아지면 '상승세'로 보지 않음
};

const THEME = {
  IMPROVED: { status: '향상', color: 'bg-blue-300', trend: 'up' },
  DECLINED: { status: '저하', color: 'bg-red-300', trend: 'down' },
  MAINTAINED: { status: '유지', color: 'bg-gray-100', trend: 'flat' },
  NO_DATA: { status: '데이터가 없습니다.', color: 'bg-gray-100' },
} as const;

/**
 * 안전한 changeRate 계산
 * @param current 현재 값
 * @param base 비교 기준 값
 */
function safeChangeRate(current: number, base: number) {
  if (base === 0) return 0;
  return (current - base) / base;
}

/**
 * changeRate를 표시용 문자열로 변환
 * 0이면 생략
 */
function formatChangeText(changeRate: number) {
  //const percent = Math.round(changeRate * 100);
  const percent = Number((changeRate * 100).toFixed(1)); // 소수점 한자리 반영
  if (percent === 0) return '';
  return percent > 0 ? `약 ${percent}% 상승` : `약 ${Math.abs(percent)}% 하락`;
}

// ** 판정 함수의 책임은 “판정”만이어야 한다 **
// - 정렬이 어떠한지 알 필요가 없음: 호출할 때 최신 값이 마지막 정렬해서 보냄
export function judgeProgress(
  recent: StoredGameResult[],
  overallAvg: number
): ProgressResult {
  const count = recent.length;

  /**
   * -------------------------------------------------------
   * 데이터가 전혀 없는 경우 (조기 리턴)
   * -------------------------------------------------------
   */
  if (count === 0) {
    return {
      ...THEME.NO_DATA,
      message: '아직 분석할 플레이 기록이 없습니다.'
    };
  }

  const scores = recent.map(r => r.skillScore);

  /**
   * -------------------------------------------------------
   * 데이터가 1개인 경우
   * -------------------------------------------------------
   * 비교 대상이 없으므로 실력 변화 판단 불가
   */
  if (count === 1) {
    return {
      ...THEME.MAINTAINED,
      message: '첫 기록입니다. 이후 플레이를 통해 실력 변화를 분석할 수 있습니다.'
    }
  }

  /**
   * -------------------------------------------------------
   * 데이터가 2~4개인 경우 (소량 데이터: 단기 변동성 보완)
   * -------------------------------------------------------
   * 평균/추세 분석은 신뢰도가 낮으므로
   * 양 끝값 비교 + 중간 과정의 일관성(Consistency) 체크
   */
  if (count < CONFIG.MIN_DATA_FOR_TREND) {
    const first = scores[0];
    const last = scores[scores.length - 1];

    // 점수는 높을수록 좋음
    const changeRate = safeChangeRate(last, first);
    const changeText = formatChangeText(changeRate);

    // [보완] 단순 변화율뿐만 아니라 중간에 너무 튀는 값(노이즈)이 없는지 확인
    // 상승 중이라고 판단하려면, 중간 점수들이 시작점보다 현저히 낮아진 적이 없어야 함
    const isImprovingConsistently = scores.every((s, i) =>
      i === 0 || s >= first * (1 - CONFIG.CONSISTENCY_THRESHOLD));
    const isDecliningConsistently = scores.every((s, i) =>
      i === 0 || s <= first * (1 + CONFIG.CONSISTENCY_THRESHOLD));
    
    // 향상 판정: 변화율이 높고, 중간에 폭락한 적이 없을 때
    if (changeRate >= CONFIG.SHORT_TERM_THRESHOLD && isImprovingConsistently) {
      return {
        ...THEME.IMPROVED,
        changeRate,
        duration: 'short',
        message:`최근 ${count}회 동안 점수가 ${changeText}하며 안정적으로 적응 중입니다.`
      };
    }
    
    // 저하 판정: 변화율이 낮고, 중간에 회복한 적이 없을 때
    if (changeRate <= -CONFIG.SHORT_TERM_THRESHOLD && isDecliningConsistently) {
      return {
        ...THEME.DECLINED,
        changeRate,
        duration: 'short',
        message: `최근 점수가 ${changeText} 중입니다. 난이도를 조절하거나 휴식을 취해 보세요.`
      };
    }
    
    // 그 외: 변화율이 작거나 흐름이 들쭉날쭉할 때 (유지/관찰)
    return {
      ...THEME.MAINTAINED,
      changeRate,
      duration: 'short',
      message: '초기 기록 측정 중입니다. 점수 변동을 관찰하며 안정적인 추이를 확인하세요.'
    };
  }

  /**
   * -------------------------------------------------------
   * 데이터가 5개 이상인 경우 (충분한 데이터: 장기 추세 분석)
   * -------------------------------------------------------
   * - 전체 평균 대비 최근 평균
   * - 전반부 vs 후반부 추세
   * 두 가지를 동시에 고려하여 판정
   */

  const recentAvg = calcAverage(scores);

  // 전반부 / 후반부 평균으로 추세 계산
  const mid = Math.floor(scores.length / 2);
  const firstHalfAvg = calcAverage(scores.slice(0, mid));
  const secondHalfAvg = calcAverage(scores.slice(mid));

  /**
   * 추세 결정: 전반부/후반부 이동평균 기반 추세
   */
  const trend =
    secondHalfAvg > firstHalfAvg * 1.05 ? 'up' :    // 5% 이상 상승 시 up
    secondHalfAvg < firstHalfAvg * 0.95 ? 'down' :  // 5% 이상 하락 시 down
    'flat';

  const changeRate = safeChangeRate(recentAvg, overallAvg);
  const changeText = formatChangeText(changeRate);

  // 장기 향상 판정: 추세가 상승세이고 전체 평균보다 높을 때
  /*
  if (trend === 'up' && recentAvg >= overallAvg) {
    return {
      ...THEME.IMPROVED,
      trend,              // 추세 결정값으로 trend를 덮어씀
      duration: 'long',
      changeRate,
      message: `최근 점수가 꾸준히 상승 중이며, ${changeText ? `, ${changeText}` : ''} 안정적인 실력을 유지 중입니다.`,
    };
  }
  */
 if (trend === 'up') {
  const isAboveAvg = recentAvg >= overallAvg;
  return {
    ...THEME[isAboveAvg ? 'IMPROVED' : 'MAINTAINED'],
    trend,
    duration: 'long',
    changeRate,
    message: isAboveAvg 
      ? `점수가 꾸준히 상승하여 평균 기량을 회복했습니다. ${changeText}`
      : `점수가 회복세에 있습니다. 곧 이전 평균을 상회할 것으로 보입니다!`
  };
}

  // 장기 저하 판정: 추세가 하락이고 현재 평균이 전체 평균 이하일 때
  if (trend === 'down' && recentAvg < overallAvg) {
    return {
      ...THEME.DECLINED,
      trend,
      duration: 'long',
      changeRate,
      message: `최근 집중도가 다소 저하되었습니다. ${changeText ? `, ${changeText}` : ''} 정확도 향상 훈련을 권장합니다.`
    };
  }

  // 그 외: 데이터는 많으나 유의미한 변화가 없는 경우
  return {
    ...THEME.MAINTAINED,
    trend,
    duration: 'long',
    changeRate,
    message: '최근 점수 흐름에 큰 변화가 없어 안정적인 인지 상태를 유지 중입니다.'
  };
}