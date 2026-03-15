package com.cognitive.backend_spring.global.init;

import com.cognitive.backend_spring.domain.game.Game;
import com.cognitive.backend_spring.domain.game.GameDifficultyConfig;
import com.cognitive.backend_spring.domain.game.GameDifficultyConfigRepository;
import com.cognitive.backend_spring.domain.game.GameRepository;
import com.cognitive.backend_spring.domain.game.Difficulty;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final GameRepository gameRepository;
    private final GameDifficultyConfigRepository configRepository;

    @Override
    @Transactional
    public void run(String... args) {
        // 1. 카드 게임 생성 또는 조회 (upsert)
        Game cardGame = gameRepository.findByCode("card-matching")
                .orElseGet(() -> gameRepository.save(Game.builder()
                        .code("card-matching")
                        .name("카드 짝 맞추기")
                        .isActive(true)
                        .build()));

        // 2. 난이도별 설정 시딩
        seedConfig(cardGame, Difficulty.EASY, 4, 30, 5, 1.0, 0.8, 0.2, 0.0);
        seedConfig(cardGame, Difficulty.NORMAL, 6, 50, 5, 1.2, 0.7, 0.3, 2.0);
        seedConfig(cardGame, Difficulty.HARD, 8, 45, 5, 1.6, 0.7, 0.3, 5.0);

        System.out.println("✅ Game & Difficulty Configs Seeded Successfully!");
    }

    private void seedConfig(Game game, Difficulty diff, int pairs, int time, int preview,
                            double mult, double accW, double reactW, double penaltyW) {

        configRepository.findByGameAndDifficulty(game, diff)
                .ifPresentOrElse(
                        config -> { /* 이미 있으면 업데이트 로직 (필요시) */ },
                        () -> configRepository.save(GameDifficultyConfig.builder()
                                .game(game)
                                .difficulty(diff)
                                .pairs(pairs)
                                .timeLimit(time)
                                .previewSeconds(preview)
                                .scoreMultiplier(mult)
                                .accuracyWeight(accW)
                                .reactionWeight(reactW)
                                .penaltyWeight(penaltyW)
                                .build())
                );
    }
}
