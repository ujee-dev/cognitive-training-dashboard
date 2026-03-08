/** 2026.03.05
 * 변경 포인트 정리
  setSaved(true)를 async 함수 안에서 호출 → cascading render 경고 제거
  서버/로컬 저장 로직을 한 곳에서 async로 처리
  finished 확인, avgReactionTime 체크, togglePause 등 기존 로직 유지
  다른 컴포넌트에서 saved 상태 참조 가능
  navigate state 처리 그대로 유지 → 차트 및 결과 페이지 정상 작동
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { GAME_CARD_CONFIG, type Difficulty } from "../config/gameConfig";
import GameCardBoard from "../components/game/GameCardBoard";
import { GameCardHeader } from "../components/game/GameCardHeader";
import { PreviewProgress } from "../components/game/PreviewProgress";
import { useCardLogic } from "../hooks/useCardLogic";

import { recordToView, type Record } from "../types/record";
import { saveResult } from "../utils/storage";
import { calcAverage } from "../utils/calcAverage";
import { calcSkillScore } from "../utils/skillScore";
import type { StoredGameResult } from "../types/storage";

import { useAuth } from "../auth/useAuth";
import { recordApi } from "../api/api";
import { handleApiError } from "../api/handleApiError";
import { useGame } from "../components/game/useGame";

import Card from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import type { GameConfig } from "../types/game";

interface Props {
  difficulty: Difficulty;
  onReset: () => void;
}

export function GameCore({ difficulty, onReset }: Props) {
  const { user } = useAuth();
  const { gameInfo, setGame } = useGame();

  const [gameConfig, setConfig] = useState<GameConfig | Difficulty>(difficulty);

  const navigate = useNavigate();
  const game = useCardLogic(gameConfig);
  const { finished, getResult, togglePause } = game;

  // --- 게임 설정 가져오기 ---
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const gameInfo = await recordApi.getGame("card-matching");
        if (mounted) setGame(gameInfo);

        const response = await recordApi.getGameConfig(gameInfo.id, difficulty);
        if (!response?.gameConfig) {
          return handleApiError("게임 설정을 찾을 수 없습니다.");
        }

        if (mounted) setConfig(response.gameConfig);
      } catch (e) {
        handleApiError(e);
      }
    })();

    return () => { mounted = false; };
  }, [difficulty, setGame]);

  // --- 게임 종료 후 결과 처리 ---
  useEffect(() => {
    if (!finished) return;

    const result = getResult();
    togglePause();

    const avgReactionTime = calcAverage(result.reactionTimes);

    const handleResult = async () => {
      if (avgReactionTime + result.accuracy <= 0) {
        // 유효하지 않은 게임
        navigate("/result", {
          state: {
            id: null,
            message1: "유효하지 않은 게임입니다.",
            message2: "확인할 수 있는 게임 결과가 없습니다.",
          },
          replace: true,
        });
        return;
      }

      if (user) {
        // 서버 저장
        try {
          if (!gameInfo) throw new Error("게임 정보가 없습니다.");

          const savedRecord: Record = {
            gameId: gameInfo.id,
            difficulty: result.difficulty,
            duration: result.duration,
            accuracy: result.accuracy,
            totalAttempts: result.totalAttempts,
            correctMatches: result.correctMatches,
            failedAttempts: result.failedAttempts,
            avgReactionTime,
          };

          const nowRecord = await recordApi.saveRecord(savedRecord);

          navigate("/result", {
            state: {
              rec: recordToView(nowRecord),
              diff: result.difficulty,
              gameId: gameInfo.id,
            },
            replace: true,
          });

        } catch (error) {
          handleApiError(error);
        }
      } else {
        // 로컬 저장
        const skillScore = calcSkillScore(
          result.accuracy,
          avgReactionTime,
          result.difficulty,
          result.failedAttempts
        );

        const stored: StoredGameResult = {
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `id-${Date.now()}`,
          difficulty: result.difficulty,
          playedAt: new Date().toISOString(),
          duration: result.duration,
          accuracy: result.accuracy,
          totalAttempts: result.totalAttempts,
          correctMatches: result.correctMatches,
          failedAttempts: result.failedAttempts,
          avgReactionTime,
          skillScore,
        };

        saveResult(stored);

        navigate("/result", {
          state: {
            id: stored.id,
            diff: result.difficulty,
          },
          replace: true,
        });
      }
    };

    handleResult();
  }, [finished, user, gameInfo, navigate]);

  return (
    <>
      <Card variant="leafGreen">
        <GameCardHeader
          difficulty={difficulty}
          attempts={game.attempts}
          matches={game.correctMatches}
          fails={game.failedAttempts}
          time={game.remainingTime}
          status={game.status}
          previewLeft={game.previewLeft}
        />
      </Card>

      {game.status === "preview" && (
        <PreviewProgress
          left={game.previewLeft}
          total={GAME_CARD_CONFIG[difficulty].previewSeconds}
        />
      )}

      <GameCardBoard cards={game.cards} onCardClick={game.handleCardClick} />

      <div className="flex flex-col-2 gap-4 items-center justify-center">
        {game.ctlPlayBtn && (
          <Button
            variant="primary"
            size="sm"
            className="ml-5 w-40"
            onClick={game.togglePause}
          >
            {game.isRunning ? "정지 ||" : "시작 ▶"}
          </Button>
        )}

        <Button
          variant="danger"
          size="sm"
          className="ml-5 w-40"
          onClick={onReset}
        >
          초기화
        </Button>
      </div>
      <br />
    </>
  );
}
