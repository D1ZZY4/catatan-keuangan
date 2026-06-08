import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils/misc";

interface AppBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
  transparent?: boolean;
}

export function AppBar({
  title,
  showBack,
  onBack,
  actions,
  className,
  transparent,
}: AppBarProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <header
      className={cn(
        "flex items-center h-14 px-2 gap-1 sticky top-0 z-30 safe-top",
        transparent ? "bg-transparent" : "bg-bg-page border-b border-bg-card",
        className,
      )}
    >
      {showBack && (
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-bg-card active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Kembali"
        >
          <ChevronLeft size={22} className="text-text-primary" />
        </button>
      )}
      <h1 className={cn("flex-1 text-base font-semibold text-text-primary truncate", showBack ? "ml-0" : "ml-3")}>
        {title}
      </h1>
      {actions !== undefined && <div className="flex items-center gap-1">{actions}</div>}
    </header>
  );
}
