interface StatItemProps {
  label: string;
  value: string | number;
  unit?: string;
  textColor?: string;
}

export default function StatItem({
  label,
  value,
  unit,
  textColor,
}: StatItemProps) {
  return (
    <div className={`flex justify-between ${textColor}`}>
      <span>{label}</span>
      <span className="font-semibold">
        {value}
        {unit && <span className="ml-1 text-xs tracking-widest">{unit}</span>}
      </span>
    </div>
  );
}
