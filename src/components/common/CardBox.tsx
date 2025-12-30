import { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;  // title 스타일을 동적으로 변경할 수 있는 옵션
  titleColor?: string;      // 제목 색상도 동적으로 변경 가능
}

export default function CardBox({
  title,
  children,
  className = "",
  titleClassName = "text-yellow-300",  // 기본 값 설정
  titleColor = "#F59E0B",             // 기본 색상 지정
}: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-gray-800 backdrop-blur border border-white/10 shadow-lg p-5 ${className}`}
    >
      {title && (
        <h2
          className={`mb-4 text-sm tracking-widest font-semibold ${titleClassName}`}
          style={{ color: titleColor }}  // titleColor를 동적으로 설정
        >
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
