import { Line } from "recharts";
import { BaseLineChart } from "../../components/charts/BaseLineChart";

interface AccuracyTrendPoint {
  index: number;
  raw: number;
  smooth: number;
}

interface Props {
  data: AccuracyTrendPoint[];
  overallAvg: number;
}

export function AccuracyTrendChart({ data, overallAvg }: Props) {
  return (
    <BaseLineChart<AccuracyTrendPoint>
      data={data}
      yUnit="%"
      tooltipUnit="%"
      avg={overallAvg}
    >
      <Line type="monotone" dataKey="raw" stroke="#93c5fd" name="개별 정확도" dot />
      <Line type="monotone" dataKey="smooth" stroke="#2563eb" strokeWidth={3} name="이동 평균" dot={false} />
    </BaseLineChart>
  );
}
