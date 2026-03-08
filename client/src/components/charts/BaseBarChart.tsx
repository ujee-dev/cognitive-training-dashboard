import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";

interface BaseBarChartProps<T> {
  data: T[];
  xKey: string;
  yKey: keyof T; //원본 데이터 그대로 사용
  yUnit?: string;
  height?: number;

  /** tooltip에 표시할 값 이름 */
  valueLabel?: string;
  barColor?: (item: T) => string;
}

function BaseBarChartInner<T>({
  data,
  xKey,
  yKey,
  yUnit = "",
  height = 250,
  barColor,
}: BaseBarChartProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="text-sm">
        데이터가 없습니다.
      </div>
    );
  }

  const tooltipFormatter = (value: number | undefined) => [
    `${value} ${yUnit}`,
    "",
  ];
  const tickStyle = { fill: "#9ca3af", fontSize: 12 };
  const strokeStyle = { stroke: "e5e7eb"};

  return (
    <div className={`w-full h-[${height}px]`}>

        <BarChart
          width="100%" height={height}
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid
            vertical={false} stroke="e5e7eb"
          />
          <XAxis
            dataKey={xKey as string}
            tick={tickStyle}
            axisLine={strokeStyle}
          />
          <YAxis
            tick={tickStyle}
            axisLine={strokeStyle}
            unit={yUnit}
          />
          <Tooltip
            formatter={tooltipFormatter}
            cursor={false}
            animationDuration={0}
          />

          <Bar dataKey={yKey as string}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={barColor ? barColor(entry) : "#8884d8"}
              />
            ))}
          </Bar>
        </BarChart>

    </div>
  );
}

export const BaseBarChart = React.memo(BaseBarChartInner) as typeof BaseBarChartInner;
