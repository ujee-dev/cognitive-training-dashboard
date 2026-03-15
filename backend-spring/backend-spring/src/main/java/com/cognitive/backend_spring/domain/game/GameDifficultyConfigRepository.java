package com.cognitive.backend_spring.domain.game;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GameDifficultyConfigRepository extends JpaRepository<GameDifficultyConfig, Long> {

    Optional<GameDifficultyConfig> findByGameIdAndDifficulty(Long gameId, Difficulty difficulty);

    List<GameDifficultyConfig> findByGame(Game game);
    Optional<GameDifficultyConfig> findByGameAndDifficulty(Game game, Difficulty difficulty);
}
