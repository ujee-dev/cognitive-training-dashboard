import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, CartesianGrid,
} from 'recharts';

import type { DifficultyStats } from '../../utils/calcStatsByDifficulty';
import { DIFFICULTY_COLOR, DIFFICULTY_LABEL } from '../../utils/difficultyConfig';

interface Props {
  data: DifficultyStats[];
}

export function DurationByDifficultyChart({ data }: Props) {
  const chartData = data.map(d => ({
    difficulty: DIFFICULTY_LABEL[d.difficulty],
    difficulty2: d.difficulty,
    duration: d.avgDuration,
  }));

  console.log("Duration : " + chartData[0].difficulty + " & " + chartData[0].difficulty2)

  return (
    <div className="h-64 w-full max-auto">
      {/* 🔹 난이도별 평균 소요 시간 (초) */}
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          {/* 배경 격자선 색상 */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="gray" />
          <XAxis dataKey="difficulty"
            tick={{ fill: '#9ca3af', fontSize: 12 }}  /* 축 텍스트 색상 (gray-400) */
            axisLine={{ stroke: '#e5e7eb' }}          /* 축 선 색상 (gray-200) */
          />
          <YAxis unit="초"
            tick={{ fill: '#9ca3af', fontSize: 12 }}  /* 축 텍스트 색상 (gray-400) */
            axisLine={{ stroke: '#e5e7eb' }}          /* 축 선 색상 (gray-200) */
          />
          <Tooltip />
          <Bar dataKey="duration">
            {chartData.map((entry) => (
              <Cell
                key={`coll-${entry.difficulty2}`}  // 백틱으로 수정
                fill={DIFFICULTY_COLOR[entry.difficulty2] ?? '#8884d8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}