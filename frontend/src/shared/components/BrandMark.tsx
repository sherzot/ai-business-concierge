import React from "react";
import { cn } from "../ui/utils";

type Props = {
  className?: string;
  title?: string;
};

export function BrandMark({ className, title = "AI Business Concierge" }: Props) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label={title}
      className={cn("h-10 w-10", className)}
    >
      <path
        d="M7 28.5 15.5 8h9L33 28.5h-7.1l-1.5-4.2h-8.9L14 28.5H7Zm10.5-9.8h4.9L20 12.2l-2.5 6.5Z"
        fill="currentColor"
      />
      <circle cx="31.5" cy="9" r="2.5" fill="var(--brand-primary)" />
    </svg>
  );
}

export function BrandLockup({
  compact = false,
  inverse = false,
  className,
}: {
  compact?: boolean;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", inverse ? "text-background" : "text-foreground", className)}>
      <BrandMark className={compact ? "h-8 w-8" : "h-10 w-10"} />
      <span className="flex flex-col leading-none">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.18em]">
          AI Concierge<span className="text-primary">.</span>
        </span>
        {!compact && (
          <span className={cn("mt-1 text-[10px] font-medium tracking-[0.08em]", inverse ? "text-background/55" : "text-muted-foreground")}>
            Business operating system
          </span>
        )}
      </span>
    </span>
  );
}
