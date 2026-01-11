import { Line } from "recharts";
import { BaseLineChart } from "../../components/charts/BaseLineChart";

interface SkillScoreTrendPoint {
  index: number;
  raw: number;
  smooth: number;
}

interface Props {
  data: SkillScoreTrendPoint[];
  overallAvg: number;
}

export function SkillScoreTrendChart({ data, overallAvg }: Props) {
  return (
    <BaseLineChart<SkillScoreTrendPoint>
      data={data}
      yUnit="점"
      tooltipUnit="점"
      avg={overallAvg}
    >
      <Line
        type="monotone" dataKey="raw" stroke="#93c5fd"
        name="개별 집중도" dot />
      <Line type="monotone" dataKey="smooth"
        stroke="#2563eb" strokeWidth={3} name="이동 평균" dot={false} />
    </BaseLineChart>
  );
}

