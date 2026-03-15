package com.cognitive.backend_spring.domain.record.controller;

import com.cognitive.backend_spring.domain.game.*;
import com.cognitive.backend_spring.domain.record.GameRecord;
import com.cognitive.backend_spring.domain.record.dto.CreateGameRecordRequest;
import com.cognitive.backend_spring.domain.record.dto.DashboardResponseDto;
import com.cognitive.backend_spring.domain.record.dto.DifficultyStatsResponse;
import com.cognitive.backend_spring.domain.record.service.GameRecordService;
import com.cognitive.backend_spring.global.auth.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/records") // NestJS의 @Controller('records')와 매칭
@RequiredArgsConstructor
public class GameRecordController {

    private final GameRecordService gameRecordService;
    private final GameRepository gameRepository;
    private final GameDifficultyConfigRepository configRepository;

    /**
     * 게임 기록 생성
     * POST /records
     */
    @PostMapping
    public ResponseEntity<?> create(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody CreateGameRecordRequest dto) {

        // 서비스 메서드가 저장된 GameRecord 객체를 반환하도록 수정할 예정입니다.
        GameRecord savedRecord = gameRecordService.createRecord(userPrincipal.getId(), dto);

        // HTTP 200 OK와 함께 저장된 데이터를 반환하여 클라이언트가 에러로 인식하지 않게 합니다.
        return ResponseEntity.ok(savedRecord);
    }

    /**
     * 게임 기본 정보 조회
     * GET /records/games/card-matching
     */
    @GetMapping("/games/{code}")
    public ResponseEntity<Game> getGame(@PathVariable String code) {
        return gameRepository.findByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 게임 난이도 설정 조회
     * GET /records/gameConfig?gameId=1&difficulty=EASY
     */
    @GetMapping("/gameConfig")
    public ResponseEntity<Map<String, Object>> getGameConfig(
            @RequestParam("gameId") String gameId,
            @RequestParam Difficulty difficulty) {

        // 프론트에서 넘어오는 "1"을 Long 타입으로 변환하여 ID로 조회하게 합니다.
        Long id = Long.parseLong(gameId);
        // 서비스 호출
        GameDifficultyConfig config = gameRecordService.getGameConfigById(id, difficulty);

        // 응답 구조 유지 { "gameConfig": { ... } }
        return ResponseEntity.ok(Map.of("gameConfig", config));
    }

    /**
     * 대시보드 조회 (최근 기록, 내 통계, 랭킹)
     * GET /records/dashboard?gameId=card-matching&difficulty=EASY
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponseDto> getDashboard(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam String gameId,
            @RequestParam Difficulty difficulty) {

        DashboardResponseDto dashboard = gameRecordService.getDashboard(userPrincipal.getId(), gameId, difficulty);
        return ResponseEntity.ok(dashboard);
    }

    /**
     * 최근 30일 난이도별 평균 기록 조회
     * GET /records/stats/summary?gameId=card-matching
     */
    @GetMapping("/stats/summary")
    public ResponseEntity<List<DifficultyStatsResponse>> getStatsSummary(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam String gameId) {

        List<DifficultyStatsResponse> summary = gameRecordService.getMyStatsAllDifficulties(userPrincipal.getId(), gameId);
        return ResponseEntity.ok(summary);
    }
}
