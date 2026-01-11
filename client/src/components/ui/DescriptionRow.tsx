interface Props {
  left: string;
  right: string;
}

export default function DescriptionRow({ left, right }: Props) {
  return (
    <div className="grid grid-cols-2 text-xs text-surface-600">
      <div className="flex items-center gap-2">
        <span className="text-[#2563eb]">●</span>
        {left}
      </div>
      <div className="flex items-center justify-end gap-2">
        <span className="text-[#93c5fd]">●</span>
        {right}
      </div>
    </div>
  );
}
