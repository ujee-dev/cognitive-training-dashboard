package com.cognitive.backend_spring.domain.record.dto;

import com.cognitive.backend_spring.domain.game.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CreateGameRecordRequest {
    private String gameId; // NestJS에서 보낸 gameId (PostgreSQL의 ID 또는 Code)
    private Difficulty difficulty;
    private int duration;
    private double accuracy;
    private double avgReactionTime;

    // 선택 필드
    private Integer totalAttempts;
    private Integer correctMatches;
    private Integer failedAttempts;

    private String theme;
    private List<Double> reactionTimeDetails; // 클라이언트는 배열로 보냄 [cite: 9]
}
