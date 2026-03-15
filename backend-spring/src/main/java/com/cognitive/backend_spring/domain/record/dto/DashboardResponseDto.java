package com.cognitive.backend_spring.domain.record.dto;

import com.cognitive.backend_spring.domain.record.GameRecord;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponseDto {
    private List<GameRecord> recentRecords;
    private double avgReactionRecent10;
    private double avgReaction30dValue;
    private double overallAvgSkillScore;
    private double avgAccuracy30dValue;
    private int bestSkillScore;
    private int worstSkillScore;
    private List<RankingEntry> ranking;
    private Integer myRank;
    private long totalPlayers;
    private Double topPercentage;
    private ProgressDto progress; // 판정 결과 객체

    @Getter @Setter @Builder
    public static class RankingEntry {
        private int rank;
        private String userId;
        private int score;
        private String nickname;
        private String profileImage;
        private boolean isMe;
    }

    @Getter @Setter @Builder
    public static class ProgressDto {
        private String status;
        private String color;
        private String trend;
        private String duration;
        private String message;
        private Double changeRate;
    }
}
