import { useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { DIFFICULTY_LABEL } from "../utils/difficultyConfig";

// auth & api
import { useAuth } from "../auth/useAuth";
import { handleApiError } from "../api/handleApiError";
import { recordApi } from "../api/api";
import { useGame } from "../components/game/useGame";

// chart & types
import type { ServerDifficultyStats } from "../types/resultView";
import { fixNumber } from "../types/storage";
import { loadGameResults } from "../utils/loadGameResults";
import { buildDifficultyChartData } from "../utils/buildChartData";
import { AccuracyByDifficultyChart } from "../ui/charts/AccuracyByDifficultyChart";
import { DurationByDifficultyChart } from "../ui/charts/DurationByDifficultyChart";
import { ReactionByDifficultyChart } from "../ui/charts/ReactionByDifficultyChart";

import StatItem from "../components/ui/StatItem";
import Card from "../components/ui/Card";
import PageContainer from "../components/layout/PageContainer";
import type { Difficulty } from "../config/gameConfig";
import type { GameResultView } from "../types/resultView";
import { storedToView } from "../types/storage";
import type { DifficultyStats } from "../utils/calcStatsByDifficulty";

export function Result() {
  const { user } = useAuth();
  const location = useLocation();
  const { gameInfo } = useGame();

  // 1. location.state에서 필요한 모든 값을 즉시 추출 (오염 방지의 핵심)
  const id = location.state?.id; // 로컬용
  const rec = location.state?.rec; // 서버용 (방금 한 판)
  const diff = location.state?.diff as Difficulty;
  const stateGameId = location.state?.gameId; // 이전 페이지에서 넘겨준 gameId

  const [chartResults, setChartResults] = useState<GameResultView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // [방어 로직] 필수 데이터가 없으면 실행 중단
    if (!id && !rec) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const effectiveGameId = gameInfo?.id || stateGameId;

    const loadData = async () => {
      // 로딩 시작을 명시적으로 표시
      setLoading(true);

      try {
        if (user) {
          // [로그인 상황] gameId가 올 때까지 기다림
          if (!effectiveGameId) return; 

          const serverData = await recordApi.getMyStats(effectiveGameId);
          if (mounted) {
            // 서버에서 온 '평균 데이터'만 차트에 세팅 (현재 판 rec와 섞지 않음)
            setChartResults(serverData.map((d: ServerDifficultyStats) => ({
              ...d,
              avgAccuracy: fixNumber(d.avgAccuracy),
              avgReactionTime: fixNumber(d.avgReactionTime),
              avgDuration: fixNumber(d.avgDuration),
            })));
          }
        } else {
          // [비로그인 상황] 로컬 스토리지 전체 데이터를 차트에 세팅
          const localData = loadGameResults().map(storedToView);
          if (mounted) setChartResults(localData);
        }
      } catch {
        //console.error("Chart loading error:", error);
        handleApiError("Chart Data를 불러오지 못 했습니다.");
      } finally {
        if (mounted) setLoading(false); // 데이터 로드 성공/실패와 상관없이 로딩 종료
      }
    };

    loadData();
    return () => { mounted = false; };
  }, [user, gameInfo?.id, stateGameId, id, rec]);

  // 2. 현재 판 결과 (상단 카드용) - 절대로 차트 데이터와 섞이지 않음
  const currentResult = useMemo(() => {
    if (rec) return rec; // 서버 응답 데이터 우선
    if (id) return loadGameResults().map(storedToView).find(r => r.id === id);
    return undefined;
  }, [rec, id]);

  // 3. 차트 데이터 가공
  const [chartData, setChartData] = useState<DifficultyStats[]>([]);

  useEffect(() => {
    if (!chartResults) return;

    if (user) {
      // 타입의 수가 맞지 않아서 경고: 사용하지 않는 필드이기에 무시
      setChartData(chartResults);
    } else {
      // 로컬 데이터는 GameResultView[] → ServerDifficultyStats[]로 변환
      setChartData(buildDifficultyChartData(chartResults));
    }
  }, [chartResults, user]);

  // --- 조건부 렌더링 ---

  if (!currentResult) {
    return <PageContainer><Card variant="brand">결과를 찾을 수 없습니다.</Card></PageContainer>;
  }

  // 데이터 로딩 중이거나, 로그인했는데 아직 gameId가 안 왔다면 로딩 표시
  if (loading || (user && !chartResults.length)) {
    return <PageContainer><Card variant="brand">통계 데이터를 분석 중입니다...</Card></PageContainer>;
  }

  const difficultyLabel = DIFFICULTY_LABEL[diff];

  return (
    <PageContainer>
      {/* 🔹 게임 결과 카드 */}
      <Card title="게임 결과" variant="brandDark">
        <hr className="border-t border-surface-100 my-6" />
        <div className="space-y-2">
          <StatItem label="난이도" value={difficultyLabel} />
          <StatItem label="플레이 시간" value={currentResult.duration} unit="초" />
          <StatItem label="정확도" value={currentResult.accuracy} unit="%" />
          <StatItem label="집중력 점수" value={currentResult.skillScore} unit="점" textColor="text-yellow-400" />
          <StatItem label="반응속도" value={currentResult.avgReactionTime} unit="초" />
          <StatItem label="시도" value={currentResult.totalAttempts} unit="회" />
          <StatItem label="성공" value={currentResult.correctMatches} unit="회" />
          <StatItem label="실패" value={currentResult.failedAttempts} unit="회" />
        </div>
        <hr className="border-b border-surface-100 my-6" />
      </Card>

      {user && (
        <Card variant="default" titleVariant="semiBase">
          <p>- 다음 데이터는 <strong>최근 30일</strong> 간의 평균입니다.</p>
        </Card>
      )}

      {/* 🔹 통계 차트 섹션 */}
      <Card title="* 난이도별 평균 소요 시간 (초)" variant="default" titleVariant="semiBase">
        <DurationByDifficultyChart data={chartData} />
      </Card>

      <Card title="* 난이도별 평균 정확도 (%)" variant="default" titleVariant="semiBase">
        <AccuracyByDifficultyChart data={chartData} />
      </Card>

      <Card title="* 난이도별 평균 반응 속도 (초)" variant="default" titleVariant="semiBase">
        <ReactionByDifficultyChart data={chartData} />
      </Card>
      <div className="h-12" />
    </PageContainer>
  );
}
