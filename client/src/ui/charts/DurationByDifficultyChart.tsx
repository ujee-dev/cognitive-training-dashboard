import { BaseBarChart } from "../../components/charts/BaseBarChart"; // ui 폴더에 만든 재사용 차트
import type { DifficultyStats } from "../../utils/calcStatsByDifficulty";
import { DIFFICULTY_COLOR, DIFFICULTY_LABEL } from "../../utils/difficultyConfig";

interface Props {
  data: DifficultyStats[]; // 난이도별 통계 데이터
}

export function DurationByDifficultyChart({ data }: Props) {
  return (
    <BaseBarChart<DifficultyStats>
      data={data.map(d => ({
        ...d,
        difficultyLabel: DIFFICULTY_LABEL[d.difficulty],
      }))}
      xKey="difficultyLabel"
      yKey="avgDuration"
      yUnit="초"
      barColor={d => DIFFICULTY_COLOR[d.difficulty] ?? "#8884d8"}
    />
  );
}
