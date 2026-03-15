package com.cognitive.backend_spring.domain.record;

import com.cognitive.backend_spring.domain.game.Game;
import com.cognitive.backend_spring.domain.user.User;
import com.cognitive.backend_spring.domain.game.Difficulty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "game_records", indexes = {
        // 유저별 최근 기록 조회를 위한 복합 인덱스
        @Index(name = "idx_user_game_recent", columnList = "user_id, game_id, difficulty, createdAt DESC"),
        // 랭킹 시스템을 위한 복합 인덱스
        @Index(name = "idx_game_ranking", columnList = "game_id, difficulty, skillScore DESC")
})
@EntityListeners(AuditingEntityListener.class) // 생성일자 자동 관리를 위해 필요
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GameRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 한 명의 사용자는 여러 기록을 가질 수 있음 (N:1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore // 직렬화 시 무한 루프 및 프록시 에러 방지
    private User user;

    // 하나의 게임 종류에 대해 여러 기록이 생성됨 (N:1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    @JsonIgnore // 직렬화 시 무한 루프 및 프록시 에러 방지
    private Game game;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @JsonIgnore // 직렬화 시 무한 루프 및 프록시 에러 방지
    private Difficulty difficulty;

    // 필수 입력 필드 = double, int
    // 비필수 입력 필드 = Integer (null 허용)
    @Column(nullable = false)
    private int skillScore;

    @Column(nullable = false)
    private int duration;

    @Column(nullable = false)
    private double accuracy;

    @Column(nullable = false)
    private double avgReactionTime;

    // 상세 성과 지표 (Optional 필드들)
    private Integer totalAttempts;
    private Integer correctMatches;
    private Integer failedAttempts;

    // 분석용 확장 필드
    private String theme; // 테마값
    private Double stdDev; // 표준편차
    private Double consistencyScore; // 일관성 점수 (0~100)

    @Column(columnDefinition = "TEXT")
    private String reactionTimeDetails; // 개별 반응 시간 리스트 (JSON 형태의 문자열로 저장)

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public GameRecord(User user, Game game, Difficulty difficulty, int skillScore,
                      int duration, double accuracy, double avgReactionTime,
                      Integer totalAttempts, Integer correctMatches, Integer failedAttempts,
                      String theme, Double stdDev, Double consistencyScore, String reactionTimeDetails) {
        this.user = user;
        this.game = game;
        this.difficulty = difficulty;
        this.skillScore = skillScore;
        this.duration = duration;
        this.accuracy = accuracy;
        this.avgReactionTime = avgReactionTime;
        this.totalAttempts = totalAttempts;
        this.correctMatches = correctMatches;
        this.failedAttempts = failedAttempts;this.theme = theme;
        this.stdDev = stdDev;
        this.consistencyScore = consistencyScore;
        this.reactionTimeDetails = reactionTimeDetails;
    }
}
