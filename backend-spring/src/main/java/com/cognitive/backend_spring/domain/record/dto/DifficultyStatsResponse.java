package com.cognitive.backend_spring.domain.record.dto;

import com.cognitive.backend_spring.domain.game.Difficulty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DifficultyStatsResponse {
    private Difficulty difficulty;
    private long games;            // 플레이 횟수
    private double avgAccuracy;     // 평균 정확도
    private double avgReactionTime; // 평균 반응 속도
    private double avgDuration;     // 평균 소요 시간
}
