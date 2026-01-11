import { Line } from "recharts";
import { BaseLineChart } from "../../components/charts/BaseLineChart";

interface ReactionTrendPoint {
  index: number;
  raw: number;
  smooth: number;
}

interface Props {
  data: ReactionTrendPoint[];
  overallAvg: number;
}

export function ReactionTrendChart({ data, overallAvg }: Props) {
  return (
    <BaseLineChart<ReactionTrendPoint>
      data={data}
      yUnit="초"
      tooltipUnit="초"
      avg={overallAvg}
    >
      <Line type="monotone" dataKey="raw" stroke="#93c5fd" name="개별 반응속도" dot />
      <Line type="monotone" dataKey="smooth" stroke="#2563eb" strokeWidth={3} name="이동 평균" dot={false} />
    </BaseLineChart>
  );
}
