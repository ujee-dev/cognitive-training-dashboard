package com.cognitive.backend_spring.domain.record;

import com.cognitive.backend_spring.domain.game.Difficulty;
import com.cognitive.backend_spring.domain.record.dto.DashboardResponseDto;
import com.cognitive.backend_spring.domain.record.dto.DifficultyStatsResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface GameRecordRepository extends JpaRepository<GameRecord, Long> {

    // 최근 기록 10개 조회
    List<GameRecord> findTop10ByUserIdAndGameIdAndDifficultyOrderByCreatedAtDesc(Long userId, Long gameId, Difficulty difficulty);

    // 대시보드 종합 통계
    @Query("SELECT AVG(r.accuracy), AVG(r.avgReactionTime), AVG(r.skillScore), MAX(r.skillScore), MIN(r.skillScore) " +
            "FROM GameRecord r WHERE r.user.id = :userId AND r.game.id = :gameId AND r.difficulty = :difficulty AND r.createdAt >= :since")
    List<Object[]> getDashboardStats(@Param("userId") Long userId, @Param("gameId") Long gameId, @Param("difficulty") Difficulty difficulty, @Param("since") LocalDateTime since);

    // 랭킹용 유저별 최고점수 리스트 (핵심: 이것으로 랭킹/내순위/전체인원 다 해결됨)
    @Query("SELECT u.nickname, u.profileImage, MAX(r.skillScore) as bestScore, u.id " +
            "FROM GameRecord r JOIN r.user u " +
            "WHERE r.game.id = :gameId AND r.difficulty = :difficulty " +
            "GROUP BY u.id, u.nickname, u.profileImage " +
            "ORDER BY bestScore DESC")
    List<Object[]> findAllUserBestScores(@Param("gameId") Long gameId, @Param("difficulty") Difficulty difficulty);

    // 통계 요약 (기존 Summary 페이지용)
    @Query("SELECT r.difficulty, COUNT(r), AVG(r.accuracy), AVG(r.avgReactionTime), AVG(r.duration) " +
            "FROM GameRecord r WHERE r.user.id = :userId AND r.game.id = :gameId AND r.createdAt >= :since GROUP BY r.difficulty")
    List<Object[]> getStatsSummaryRaw(@Param("userId") Long userId, @Param("gameId") Long gameId, @Param("since") LocalDateTime since);
}
