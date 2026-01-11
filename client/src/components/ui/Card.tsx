import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  variant?: "default" | "brand" | "brandDark" | "leafGreen" | "brandLight";
  titleVariant?: "semiBase" | "base" | "titleBrand" | "titleGreen";
}

export default function Card({
  title,
  children,
  variant = "default",
  titleVariant = "titleBrand",
}: CardProps) {
  const variants = {
    default: "bg-white text-surface-900",
    brand: "bg-brand text-white shadow-sm",
    leafGreen: "bg-leafGreen text-white",
    brandDark: "bg-brand-dark text-white shadow-sm",
    brandLight: "bg-brand-light text-white shadow-sm",
  };

  const titleVariants = {
    semiBase: "text-sm text-gray-600 font-semibold",
    base: "text-base text-black font-bold",
    titleBrand: "text-base text-orange-400 font-extrabold",
    titleGreen: "text-yellow-300 font-semibold",
  };

  return (
    <div className={`rounded-2xl p-6 leading-relaxed ${variants[variant]}`}>
      {title && (
        <h2 className={`mb-4 ${titleVariants[titleVariant]} tracking-wide opacity-90`}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
