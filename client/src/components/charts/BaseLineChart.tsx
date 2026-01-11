import React from "react";
import {
  LineChart,
  //Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
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

export function BaseLineChart<T>({
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

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="gray" />
          <XAxis
            dataKey={resolvedXKey as string}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis
            unit={yUnit}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <Tooltip formatter={(value: number | undefined) => [`${value} ${tooltipUnit}`, ""]} />
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
      </ResponsiveContainer>
    </div>
  );
}
