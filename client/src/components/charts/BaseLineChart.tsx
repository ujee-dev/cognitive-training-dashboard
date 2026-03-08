import React from "react";
import {
  LineChart,
  //Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

interface BaseLineChartProps<T> {
  data: T[];
  xKey?: keyof T;
  yUnit: string;          // Y축 단위
  tooltipUnit: string;    // 툴팁 단위
  avg?: number;           // 전체 평균 기준선 optional
  children: React.ReactNode;
  height?: number;
}

function BaseLineChartInner<T>({
  data,
  xKey,
  yUnit,
  tooltipUnit,
  avg,
  children,
  height = 250,
}: BaseLineChartProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="text-sm">
        데이터가 없습니다.
      </div>
    );
  }

  const resolvedXKey = xKey || ("index" as keyof T);
  const tooltipFormatter = (value: number | undefined) => [
    `${value} ${tooltipUnit}`,
    "",
  ];
  const tickStyle = { fill: "#9ca3af", fontSize: 12 };

  return (
    <div className="w-full h-[250px]">
      
        <LineChart
          width="100%" height={height}
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid
            vertical={false} stroke="#e5e7eb"
          />
          <XAxis
            dataKey={resolvedXKey as string}
            tick={tickStyle}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis
            unit={yUnit}
            tick={tickStyle}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <Tooltip
            formatter={tooltipFormatter}
            cursor={false}
            animationDuration={0}
          />
          {children}
          {avg !== undefined && (
            <ReferenceLine
              y={avg}
              stroke="#cd0000"
              strokeWidth={2}
              strokeDasharray="3 3"
              label="전체 평균"
            />
          )}
        </LineChart>
      
    </div>
  );
}

export const BaseLineChart = React.memo(BaseLineChartInner) as typeof BaseLineChartInner;
