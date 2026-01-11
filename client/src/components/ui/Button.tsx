import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "brandLight" | "brandGradient"; // 버튼 테마
  size?: "sm" | "md" | "lg"; // 버튼 크기
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}) => {
  const baseClasses =
    "font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-1 border-2"; // border-2 추가

  const variantClasses = {
    primary: "bg-brand text-white border-brand hover:bg-brand-dark hover:border-brand-dark shadow-brand/20",
    secondary: "bg-surface-100 text-surface-900 border-surface-300 hover:bg-surface-200 hover:border-surface-400 shadow-slate/20",
    danger: "bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600 shadow-red-300",
    // brand 색상 조합 예시
    brandLight: "bg-brand-light text-white border-brand-light hover:bg-brand-dark hover:border-brand-dark shadow-brand/20",
    brandGradient: "bg-gradient-to-r from-brand-light to-brand-dark text-white border-brand-light hover:border-brand-dark shadow-brand/20",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-3 text-base",
    lg: "px-6 py-4 text-lg",
  };

  return (
    <button
      className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
