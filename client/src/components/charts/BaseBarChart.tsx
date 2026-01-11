//import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
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


export function BaseBarChart<T>({
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

  return (
    <div className={`w-full h-[${height}px]`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="gray" />
          <XAxis
            dataKey={xKey as string}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            axisLine={{ stroke: "#e5e7eb" }}
            unit={yUnit}
          />
          <Tooltip formatter={(value: number | undefined) => [`${value} ${yUnit}`, ""]} />

          <Bar dataKey={yKey as string}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={barColor ? barColor(entry) : "#8884d8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
