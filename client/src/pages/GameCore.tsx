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

  const [saved, setSaved] = useState(false);

  const navigate = useNavigate();

  // 변수명 충돌 방지를 위해 config 상태 명칭을 명확히 함
  const [gameConfig, setConfig] = useState<GameConfig | Difficulty>(difficulty);

  // useCardLogic에서 필요한 것들을 바로 꺼내 쓰면 'game' 변수 선언 자체를 피할 수 있습니다.
  const game = useCardLogic(gameConfig);
  const { finished, getResult, togglePause } = game;

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const gameInfo = await recordApi.getGame("card-matching");
        if (mounted) setGame(gameInfo);

        // 백엔드 응답: { gameConfig: { timeLimit: 50, ... } }
        const response = await recordApi.getGameConfig(gameInfo.id, difficulty);
        
        if (!response || !response.gameConfig) {
          return handleApiError('게임 설정을 찾을 수 없습니다.');
        }

        if (mounted) {
          // response가 아니라 response.gameConfig를 설정해야 함
          setConfig(response.gameConfig); 
        }
      } catch (e) {
        handleApiError(e);
      }
    })();

    return () => { mounted = false; };
  }, [difficulty, setGame]);

  useEffect(() => {
    if (!finished) return;

    const result = getResult();
    togglePause();

    const avgReactionTime = calcAverage(result.reactionTimes); // 배열 평균

    // 유효 여부 판단
    if (avgReactionTime + result.accuracy > 0) {
      if (user) {
        setSaved(true);
      } else {
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
          avgReactionTime: avgReactionTime,
          skillScore: skillScore,
        };

        saveResult(stored);

        // navigate()의 두 번쨰 인자는 NavigateOptions 타입이고
        // id 같은 커스텀 같은 options가 아니라 state 안에 넣어야 함
        navigate("/result", {
          state: {
            id: stored.id,
            diff: result.difficulty,
          },
          replace: true,
        });
      }
    } else {
      // 유효하지 않은 게임 메시지 전달
      navigate("/result", {
        state: {
          id: null,
          message1: "유효하지 않은 게임입니다.",
          message2: "확인할 수 있는 게임 결과가 없습니다.",
        },
        replace: true,
      });
    }
  }, [finished, navigate, saved]);

  useEffect(() => {
    if (!saved) return;
    if (!finished) return;

    const result = getResult();
    togglePause();
    
    const avgReactionTime = calcAverage(result.reactionTimes);

    (async () => {
      if (!gameInfo) {
        return handleApiError("게임 정보가 없습니다.");
      }

      const savedRecord: Record = { // skillscore는 서버에서 계산
        gameId: gameInfo.id,
        difficulty: result.difficulty,
        duration: result.duration,
        accuracy: result.accuracy,
        totalAttempts: result.totalAttempts,
        correctMatches: result.correctMatches,
        failedAttempts: result.failedAttempts,
        avgReactionTime: avgReactionTime,
      };

      try {
        const nowRecord = await recordApi.saveRecord(savedRecord);

        navigate("/result", {
          state: {
            rec: recordToView(nowRecord), // 방금 생성된 서버 데이터
            diff: result.difficulty,
            gameId: gameInfo.id, // 이걸 반드시 포함시켜야 차트가 즉시 뜹니다!
          },
          replace: true,
        });
      } catch (error) {
        handleApiError(error);
      }
    })(); // 즉시 실행
  }, [saved]);

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
