interface StatItemProps {
  label: string;
  value: string | number;
  unit?: string;
}

export default function StatItem({
  label,
  value,
  unit,
}: StatItemProps) {
  return (
    <div className="flex justify-between text-sm text-white/80">
      <span>{label}</span>
      <span className="font-semibold text-white">
        {value}
        {unit && <span className="ml-1 text-xs tracking-widest text-white/60">{unit}</span>}
      </span>
    </div>
  );
}
