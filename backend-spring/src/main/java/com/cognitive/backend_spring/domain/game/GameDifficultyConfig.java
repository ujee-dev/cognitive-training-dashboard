package com.cognitive.backend_spring.domain.game;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "game_difficulty_configs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GameDifficultyConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    @JsonIgnore // 이 어노테이션을 추가하여 직렬화 에러를 방지합니다.
    private Game game;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    // Gameplay rules
    private int pairs;
    private int timeLimit;
    private int previewSeconds;

    // Score rules (가중치)
    private double scoreMultiplier;
    private double accuracyWeight;
    private double reactionWeight;
    private double penaltyWeight;

    @Builder
    public GameDifficultyConfig(Game game, Difficulty difficulty,
                                int pairs, int timeLimit, int previewSeconds,
                                double scoreMultiplier, double accuracyWeight,
                                double reactionWeight, double penaltyWeight) {
        this.game = game;
        this.difficulty = difficulty;
        this.pairs = pairs;
        this.timeLimit = timeLimit;
        this.previewSeconds = previewSeconds;
        this.scoreMultiplier = scoreMultiplier;
        this.accuracyWeight = accuracyWeight;
        this.reactionWeight = reactionWeight;
        this.penaltyWeight = penaltyWeight;
    }
}
