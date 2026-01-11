import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  variant?: "default" | "border";
  subVariant?: "default" | "border";
}

export default function CardSub({
  title,
  children,
  variant = "default",
  subVariant = variant,
}: CardProps) {
  const variants = {
    default: "flex justify-between p-3 bg-gray-500 text-surface-100 font-bold",
    border: "flex justify-between p-3 border-b border-gray-500 text-gray-500 font-bold bg-transparent",
  };

  const subVariants = {
    default: "flex text-justify p-3 bg-gray-500 text-surface-100",
    border: "flex text-justify p-3 text-gray-500 bg-transparent",
  };

  return (
    <div className="my-0 overflow-hidden space-y-0.5 leading-relaxed rounded-lg border border-gray-500 shadow-sm">
      {/* 상단 헤더 */}
      <div className={`${variants[variant]}`}>
        {title}
      </div>

      {/* 본문 영역 */}
      <div className={`${subVariants[subVariant]}`}>
        <span>{children}</span>
      </div>
    </div>
  );
}
