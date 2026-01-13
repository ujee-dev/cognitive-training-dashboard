import { useState } from "react";

interface CardToggleProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function CardToggle({
  title,
  defaultOpen = false,
  children,
}: CardToggleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-gray-50"
      >
        <span className="font-medium text-gray-900">{title}</span>

        {/* Toggle Indicator */}
        <span
          className={`text-gray-400 text-xs transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▲
        </span>
      </button>

      {/* Content */}
      {open && (
        <div className="border-t px-4 py-4">
          {children}
        </div>
      )}
    </div>
  );
}
