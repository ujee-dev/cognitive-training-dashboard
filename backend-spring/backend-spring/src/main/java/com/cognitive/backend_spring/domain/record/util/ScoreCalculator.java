package com.cognitive.backend_spring.domain.record.util;

import com.cognitive.backend_spring.domain.game.GameDifficultyConfig;
import com.cognitive.backend_spring.domain.record.dto.CreateGameRecordRequest;
import com.cognitive.backend_spring.domain.game.Difficulty;
import org.springframework.stereotype.Component;

@Component
public class ScoreCalculator {

    // 난이도별 반응 속도 기준점
    private static final double MIN_TIME = 0.4;
    private static final double EASY_MAX = 2.0;
    private static final double NORMAL_MAX = 2.5;
    private static final double HARD_MAX = 3.5;

    /** NestJS 난이도별 반응속도 기준점
     * [Difficulty.EASY]: { minTime: 0.4, maxTime: 2.0 }
     * [Difficulty.NORMAL]: { minTime: 0.4, maxTime: 2.5 }
     * [Difficulty.HARD]: { minTime: 0.5, maxTime: 3.5 }
     */

    public int calculate(CreateGameRecordRequest dto, GameDifficultyConfig config) {
        // 반응속도 점수화 (0~100점)
        double reactionScore = calculateReactionScore(dto.getAvgReactionTime(), dto.getDifficulty());

        // 가중치 기반 기본 점수 계산
        double finalScore = (dto.getAccuracy() * config.getAccuracyWeight() +
                reactionScore * config.getReactionWeight()) * config.getScoreMultiplier();

        // 감점 적용 (실패 횟수가 있을 경우)
        if (dto.getFailedAttempts() != null && config.getPenaltyWeight() > 0) {
            finalScore -= (dto.getFailedAttempts() * config.getPenaltyWeight());
        }

        return Math.max(0, (int) Math.round(finalScore));
    }

    private double calculateReactionScore(double avgTime, Difficulty difficulty) {
        double maxTime = switch (difficulty) {
            case EASY -> EASY_MAX;
            case NORMAL -> NORMAL_MAX;
            case HARD -> HARD_MAX;
        };

        if (avgTime <= MIN_TIME) return 100.0;
        if (avgTime >= maxTime) return 0.0;

        // 반응 속도 점수 공식
        return 100.0 - ((avgTime - MIN_TIME) / (maxTime - MIN_TIME)) * 100.0;
    }
}
