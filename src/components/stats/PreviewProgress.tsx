interface Props {
  left: number;
  total: number;
}

export function PreviewProgress({ left, total }: Props) {
  const percent = (left / total) * 100;

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="h-3 bg-gray-200 rounded overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-1000"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-center text-sm mt-1">
        미리보기 {left}초
      </p>
    </div>
  );
}