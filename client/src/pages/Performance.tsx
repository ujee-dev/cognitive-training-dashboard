import { useState, useEffect, useMemo } from 'react';
import type { Difficulty } from '../config/gameConfig';
import clsx from 'clsx';

// auth & api
import { useAuth } from "../auth/useAuth";
import { handleApiError } from "../api/handleApiError";
import { recordApi } from "../api/api";
import { useGame } from "../components/game/useGame";

import type { DashboardResponseDto, RecordLean } from '../types/Dashboard';

// chart
import { ReactionTrendChart } from '../ui/charts/ReactionTrendChart';
import { AccuracyTrendChart } from '../ui/charts/AccuracyTrendChart';
import { SkillScoreTrendChart } from '../ui/charts/SkillScoreTrendChart';

// stats UI
import { RecentTimeline } from '../ui/performance/RecentTimeline';
import { AverageCompareCard } from '../ui/performance/AverageCompareCard';
import { ProgressBadge } from '../ui/performance/ProgressBadge';

// 공용 컴포넌트
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import CardSub from '../components/ui/CardSub';
import DescriptionRow from '../components/ui/DescriptionRow';
import { ExtremeCard } from '../ui/performance/ExtremeCard';
import { buildTrendData } from '../utils/buildTrendData';
import StatItem from '../components/ui/StatItem';

export function Performance() {
  const { user } = useAuth();
  const { gameInfo, setGame } = useGame();
  const [ loading, setLoading ] = useState(true);
  const [ difficulty, setDifficulty ] = useState<Difficulty>('NORMAL');

  const [ dashboardData, setDashboardData ] = useState<DashboardResponseDto>();
  const [ recentRecords, setRecentRecords ] = useState<RecordLean[]>([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  /* --- [중요] 모든 Hook은 조기 반환 이전에 위치해야 함 --- */

  // 최근 N회 반응속도 추이
  const reactionTrendData = useMemo(
    () => buildTrendData(recentRecords, 'avgReactionTime').reverse(),
    [recentRecords]
  );

  // 최근 N회 집중도 추이
  const skillScoreTrendData = useMemo(
    () => buildTrendData(recentRecords, 'skillScore').reverse(),
    [recentRecords]
  );

  // 최근 N회 정확도 추이
  const accuracyTrendData = useMemo(
    () => buildTrendData(recentRecords, 'accuracy').reverse(),
    [recentRecords]
  );

  /* --- 데이터 로드 --- */
  useEffect(() => {
    let mounted = true;

    if (!user) {
      setLoading(false);
      return;
    }

    const fetchGameAndData = async () => {
      setLoading(true);

      // 게임 정보가 없으면 먼저 로드
      if (!gameInfo) {
        try {
          const fetchedGame = await recordApi.getGame("card-matching");
          if (!mounted) return;
          setGame(fetchedGame);
        } catch (e) {
          handleApiError(e);
        }
      }

      if (!mounted) return;
      await loadData();
    };

    fetchGameAndData();
    return () => { mounted = false; };
  }, [user, gameInfo?.id, difficulty, setGame]); // difficulty 변경 시 재로드 필요

  const loadData = async () => {
    // 로딩 시작을 명시적으로 표시
    if (!gameInfo) return;

    setLoading(true);
    try {
      const serverData = await recordApi.getDashboard(gameInfo?.id, difficulty);
      setDashboardData(serverData);
      setRecentRecords(serverData.recentRecords);
    } catch {
      handleApiError("데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false); // 데이터 로드 성공/실패와 상관없이 로딩 종료
    }
  };

  if (!user) {
    return
      <PageContainer>
        <Card variant="brand">접근이 거부되었습니다. 다시 로그인하세요</Card>
      </PageContainer>;
  }

  // 로그인 상태인데 데이터 로딩 중
  if (loading || !dashboardData) {
    return <PageContainer><Card variant="brand">통계 데이터를 분석 중입니다...</Card></PageContainer>;
  }

  /* --- UI --- */
  return (
    <PageContainer>
      <CardSub title="성과 분석 안내" variant='border'>
        다음은 "유효 게임" 진행에 대한 통계 입니다.<br/>
        ( 진행하지 않고 자동 시간 종료 또는 중단한 게임은 제외됩니다. )<br />
        📍 " <strong>데이터가 적으면 분석이 정확하지 않을 수 있습니다.</strong> "<br />
        📍 <strong>차트의 전체 평균, 실력 향상 판정 기준은 "30일" 입니다.</strong>
      </CardSub>

      {/* 난이도 선택 */}
      <div className="px-4 space-x-5 text-sm">
        <span className='font-semibold'>난이도 선택를 선택하세요. </span>{" "}
        <select
          value={difficulty}
          onChange={e => setDifficulty(e.target.value as Difficulty)}
          className="border px-2 py-1 rounded text-sm mx-auto">
            <option value="EASY">쉬움</option>
            <option value="NORMAL">보통</option>
            <option value="HARD">어려움</option>
        </select>
      </div>

      <Card title="실력 향상 배지" variant='brandDark' titleVariant='titleBrand'>
        <ProgressBadge
          status={dashboardData.progress.status}
          message={dashboardData.progress.message}
          color={dashboardData.progress.color} />
      </Card>

      <Card title="순위" variant='brandDark' titleVariant='titleBrand'>
        <div className='pt-3 pb-5 space-y-3'>
          {/*내 순위 정보*/}
          <StatItem label="★ 내 순위:" value={dashboardData.myRank ?? '-'} unit="위" />
          <StatItem label="☆ 상위" value={dashboardData.topPercentage ?? '-'} unit="%" />
        </div>
        <p className=' text-orange-400'>- 전체 10 위 -</p><br/>
        <div className='pt-1 text-sm justify-center items-center'>
          <hr className='pt-2'/>
          {/* 헤더 부분 - 가독성을 위해 폰트 굵기와 색상 조정 */}
          <li className="grid grid-cols-[1fr_2fr_1fr] w-full font-bold border-b border-gray-300 pb-2 px-3">
            <span className="text-left">순위</span>
            <span className="text-center">User</span>
            <span className="text-right">점수</span>
          </li>

          {/* 데이터 리스트 */}
          {dashboardData.ranking.map((r) => (
            <li 
              key={r.userId} 
              className={clsx(
                'grid grid-cols-[1fr_2fr_1fr] w-full py-3 px-3 border-b border-gray-300 hover:bg-brand-light',
                r.isMe && 'font-extrabold text-yellow-300'
              )}
            >
              <span className="text-left">{r.rank}</span>
              <span className="flex items-center gap-2">
                {r.profileImage && (
                  <img
                    src={`${API_BASE_URL}${r.profileImage}?t=${Date.now()}`}
                    alt="프로필"
                    className="w-7 h-7 rounded-full object-cover"
                  />
                )}
                {r.nickname}
              </span>
              <span className="text-right">{r.score}점</span>
            </li>
          ))}
        </div>
      </Card>

      <Card title="최근 10 회 게임 기록" variant="default" titleVariant='base'>
        <RecentTimeline results={recentRecords}/>
      </Card>

      <Card title="최근 10 회 집중도 추이" variant="default" titleVariant='base'>
        <SkillScoreTrendChart
          data={skillScoreTrendData}
          overallAvg={dashboardData.avgAccuracy30dValue} />
          { (skillScoreTrendData.length > 0) &&
            <DescriptionRow
              left="이동 평균선 = 기준선 최근 5개의 평균 값"
              right="실제 값"
            />
          }
      </Card>

      <Card title="최근 10 회 반응 속도 추이" variant="default" titleVariant='base'>
        <ReactionTrendChart
          data={reactionTrendData}
          overallAvg={dashboardData.avgReaction30dValue} />
          { (reactionTrendData.length > 0) &&
            <DescriptionRow
              left="이동 평균선 = 기준선 최근 5개의 평균 값"
              right="실제 값"
            />
          }
      </Card>

      <Card title="최근 10 회 정확도 추이" variant="default" titleVariant='base'>
        <AccuracyTrendChart
          data={accuracyTrendData}
          overallAvg={dashboardData.overallAvgSkillScore} />
          { (accuracyTrendData.length > 0) &&
            <DescriptionRow
              left="이동 평균선 = 기준선 최근 5개의 평균 값"
              right="실제 값"
            />
          }
      </Card>

      <Card title="반응 속도 평균 비교" variant="brandDark" titleVariant='titleBrand'>
        <AverageCompareCard
          recent={dashboardData.avgReactionRecent10}
          overall={dashboardData.avgReaction30dValue} />
      </Card>

      <Card title="기록 하이라이트" variant="brandDark" titleVariant='titleBrand'>
        {(dashboardData.bestSkillScore > 0)
          ? <ExtremeCard
              best={dashboardData.bestSkillScore}
              worst={dashboardData.worstSkillScore} />
          : <div className='text-sm'>데이터가 없습니다.</div>
        }
      </Card>
      <div className='h-12'/>
    </PageContainer>
  );
}
