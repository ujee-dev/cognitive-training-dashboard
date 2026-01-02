import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface SkillScoreTrendPoint {
  index: number;
  raw: number;
  smooth: number;
}

interface Props {
  data: SkillScoreTrendPoint[];
  overallAvg: number;
}

// 최근 10회 집중도 추이
export function SkillScoreTrendChart({ data, overallAvg }: Props) {

    if (!data || !overallAvg) {
      return (
        <div className='flex justify-between text-sm text-white/80'>
            <p>데이터가 없습니다.</p>
        </div>
      );
    }

    return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          {/* 배경 격자선 색상 */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="gray" />

          <XAxis dataKey="index"
            tick={{ fill: '#9ca3af', fontSize: 12 }}  /* 축 텍스트 색상 (gray-400) */
            axisLine={{ stroke: '#e5e7eb' }}          /* 축 선 색상 (gray-200) */
          />
          <YAxis unit="점"
            tick={{ fill: '#9ca3af', fontSize: 12 }}  /* 축 텍스트 색상 (gray-400) */
            axisLine={{ stroke: '#e5e7eb' }}          /* 축 선 색상 (gray-200) */
          />

          <Tooltip
            formatter={(value) => [`${value} 점`, '집중도']}
          />

          {/* 원본 값 */}
          <Line
            type="monotone"
            dataKey="raw"
            stroke="#93c5fd"
            name="개별 집중도"
            dot
          />

          {/* 이동 평균 */}
          <Line
            type="monotone"
            dataKey="smooth"
            stroke="#2563eb"
            strokeWidth={3}
            name="이동 평균"
            dot={false}
          />

          {/* 전체 평균 기준선 */}
          <ReferenceLine
            y={overallAvg}
            stroke="#cd0000"
            strokeWidth={2}
            strokeDasharray="3 3"
            label="전체 평균"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}