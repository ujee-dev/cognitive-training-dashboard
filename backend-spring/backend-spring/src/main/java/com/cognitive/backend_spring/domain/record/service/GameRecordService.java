package com.cognitive.backend_spring.domain.record.service;

import com.cognitive.backend_spring.domain.game.*;
import com.cognitive.backend_spring.domain.record.GameRecord;
import com.cognitive.backend_spring.domain.record.GameRecordRepository;
import com.cognitive.backend_spring.domain.record.dto.CreateGameRecordRequest;
import com.cognitive.backend_spring.domain.record.dto.DashboardResponseDto;
import com.cognitive.backend_spring.domain.record.dto.DifficultyStatsResponse;
import com.cognitive.backend_spring.domain.record.util.ScoreCalculator;
import com.cognitive.backend_spring.domain.user.User;
import com.cognitive.backend_spring.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GameRecordService {

    private final GameRecordRepository gameRecordRepository;
    private final GameRepository gameRepository;
    private final GameDifficultyConfigRepository configRepository;
    private final UserRepository userRepository;
    private final ScoreCalculator scoreCalculator;

    /**
     * 기록 저장 (POST /api/records)
     */
    @Transactional
    public GameRecord createRecord(Long userId,CreateGameRecordRequest dto) {
        // 코드로 찾는 대신 ID로 조회 (dto.getGameId()가 "1"이므로 Long 변환)
        Long gameInternalId = Long.parseLong(dto.getGameId());
        Game game = gameRepository.findById(gameInternalId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게임을 찾을 수 없습니다. ID: " + gameInternalId));

        // 난이도 설정 조회
        GameDifficultyConfig config = configRepository.findByGameAndDifficulty(game, dto.getDifficulty())
                .orElseThrow(() -> new IllegalArgumentException("설정을 찾을 수 없습니다."));

        // 점수 계산
        int finalScore = scoreCalculator.calculate(dto, config);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 엔티티 생성 및 저장
        GameRecord record = GameRecord.builder()
                .user(user)
                .game(game)
                .difficulty(dto.getDifficulty())
                .skillScore(finalScore)
                .duration(dto.getDuration())
                .accuracy(dto.getAccuracy())
                .avgReactionTime(dto.getAvgReactionTime())
                .totalAttempts(dto.getTotalAttempts())
                .correctMatches(dto.getCorrectMatches())
                .failedAttempts(dto.getFailedAttempts())
                .build();

        return gameRecordRepository.save(record); // 저장된 객체 반환
    }

    /**
     * 대시보드 조회
     */
    @Transactional(readOnly = true)
    public DashboardResponseDto getDashboard(Long userId, String gameIdStr, Difficulty difficulty) {
        Long gameId = Long.parseLong(gameIdStr);
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        // 기초 데이터 & 30일 통계 조회
        List<GameRecord> recentRecords = gameRecordRepository.findTop10ByUserIdAndGameIdAndDifficultyOrderByCreatedAtDesc(userId, gameId, difficulty);
        List<Object[]> statsList = gameRecordRepository.getDashboardStats(userId, gameId, difficulty, thirtyDaysAgo);

        double avgAccuracy30d = 0.0, avgReaction30d = 0.0, avgScore30d = 0.0;
        int bestScore = 0, worstScore = 0;

        if (statsList != null && !statsList.isEmpty() && statsList.get(0) != null) {
            Object[] row = statsList.get(0);
            avgAccuracy30d = row[0] != null ? (Double) row[0] : 0.0;
            avgReaction30d = row[1] != null ? (Double) row[1] : 0.0;
            avgScore30d = row[2] != null ? (Double) row[2] : 0.0;
            bestScore = row[3] != null ? ((Number) row[3]).intValue() : 0;
            worstScore = row[4] != null ? ((Number) row[4]).intValue() : 0;
        }

        // 최근 10회 반응속도 평균 계산
        double avgReactionRecent10 = recentRecords.stream()
                .mapToDouble(GameRecord::getAvgReactionTime)
                .average().orElse(0.0);

        // 랭킹 데이터 처리 (이 루프 하나로 랭킹 리스트, 내 순위, 전체 인원 확정)
        List<Object[]> allBestScores = gameRecordRepository.findAllUserBestScores(gameId, difficulty);
        List<DashboardResponseDto.RankingEntry> ranking = new ArrayList<>();
        Integer myRank = null;
        int currentRank = 0;
        int lastScore = -1;

        for (int i = 0; i < allBestScores.size(); i++) {
            Object[] row = allBestScores.get(i);
            int score = ((Number) row[2]).intValue();
            Long rowUserId = (Long) row[3];

            if (score != lastScore) {
                currentRank = i + 1;
                lastScore = score;
            }

            boolean isMe = rowUserId.equals(userId);
            if (isMe) myRank = currentRank;

            if (i < 10) { // Top 10만 DTO에 담음
                ranking.add(DashboardResponseDto.RankingEntry.builder()
                        .rank(currentRank)
                        .userId(rowUserId.toString())
                        .score(score)
                        .nickname((String) row[0])
                        .profileImage((String) row[1])
                        .isMe(isMe)
                        .build());
            }
        }

        // 상위 퍼센트 및 최종 데이터 조립
        long totalPlayers = allBestScores.size();
        Double topPercentage = (myRank != null && totalPlayers > 0)
                ? Math.round(((double) myRank / totalPlayers * 100) * 10) / 10.0
                : null;

        return DashboardResponseDto.builder()
                .recentRecords(recentRecords)
                .avgReactionRecent10(Math.round(avgReactionRecent10 * 1000) / 1000.0)
                .avgReaction30dValue(Math.round(avgReaction30d * 1000) / 1000.0)
                .overallAvgSkillScore(Math.round(avgScore30d * 10) / 10.0)
                .avgAccuracy30dValue(Math.round(avgAccuracy30d * 10) / 10.0)
                .bestSkillScore(bestScore)
                .worstSkillScore(worstScore)
                .ranking(ranking)
                .myRank(myRank)
                .totalPlayers(totalPlayers)
                .topPercentage(topPercentage)
                .progress(judgeProgress(recentRecords, avgScore30d)) // 한 번만 호출
                .build();
    }

    private DashboardResponseDto.ProgressDto judgeProgress(List<GameRecord> recent, double overallAvg) {
        if (recent.isEmpty()) {
            return DashboardResponseDto.ProgressDto.builder()
                    .status("데이터가 없습니다.")
                    .color("bg-gray-100")
                    .trend("none")
                    .message("아직 분석할 플레이 기록이 없습니다.")
                    .build();
        }

        // NestJS의 판정 로직을 간소화하여 이식 (유지/향상/저하)
        double recentAvg = recent.stream().mapToDouble(GameRecord::getSkillScore).average().orElse(0.0);
        String status = "유지";
        String color = "bg-gray-100";
        String trend = "flat";

        if (recentAvg > overallAvg * 1.05) {
            status = "향상"; color = "bg-blue-300"; trend = "up";
        } else if (recentAvg < overallAvg * 0.95) {
            status = "저하"; color = "bg-red-300"; trend = "down";
        }

        return DashboardResponseDto.ProgressDto.builder()
                .status(status)
                .color(color)
                .trend(trend)
                .message("최근 점수 흐름이 " + status + " 상태입니다.")
                .build();
    }

    /**
     * 요약 통계 조회
     */
    @Transactional(readOnly = true)
    public List<DifficultyStatsResponse> getMyStatsAllDifficulties(Long userId, String gameIdStr) {
        Long gameId = Long.parseLong(gameIdStr);
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        // Raw 데이터 조회
        List<Object[]> results = gameRecordRepository.getStatsSummaryRaw(userId, gameId, thirtyDaysAgo);

        // DTO로 변환
        List<DifficultyStatsResponse> stats = results.stream()
                .map(row -> DifficultyStatsResponse.builder()
                        .difficulty((Difficulty) row[0])
                        .games((Long) row[1])
                        .avgAccuracy(row[2] != null ? (Double) row[2] : 0.0)
                        .avgReactionTime(row[3] != null ? (Double) row[3] : 0.0)
                        .avgDuration(row[4] != null ? (Double) row[4] : 0.0)
                        .build())
                .collect(Collectors.toList());

        // 모든 난이도 기본값 채우기
        return Arrays.stream(Difficulty.values())
                .map(diff -> stats.stream()
                        .filter(s -> s.getDifficulty() == diff)
                        .findFirst()
                        .orElse(DifficultyStatsResponse.builder()
                                .difficulty(diff)
                                .games(0)
                                .avgAccuracy(0.0)
                                .avgReactionTime(0.0)
                                .avgDuration(0.0)
                                .build()))
                .collect(Collectors.toList());
    }

    // 컨트롤러에서 호출하는 메서드명을 명확히 확인하세요.
    public GameDifficultyConfig getGameConfigById(Long gameId, Difficulty difficulty) {
        return configRepository.findByGameIdAndDifficulty(gameId, difficulty)
                .orElseThrow(() -> new IllegalArgumentException("해당 난이도 설정을 찾을 수 없습니다. ID: " + gameId));
    }
}
