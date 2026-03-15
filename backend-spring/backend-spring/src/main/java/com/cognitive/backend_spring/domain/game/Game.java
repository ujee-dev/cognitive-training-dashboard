package com.cognitive.backend_spring.domain.game;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "games")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // 예: "card-matching"

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description; // 게임 설명

    // 확장 대비 필드 (이벤트)
    private boolean isActive = false; // 이벤트 활성화 유무
    private LocalDateTime validFrom;
    private LocalDateTime validTo;

    @Builder
    public Game(String code, String name, String description, boolean isActive) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.isActive = isActive; // 하드코딩 true 회피
    }
}
