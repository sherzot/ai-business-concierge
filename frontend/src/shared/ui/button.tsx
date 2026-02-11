import * as React from "react";
import { cn } from "./utils";

export interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: "default" | "outline" | "ghost";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" &&
          "bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2",
        variant === "outline" &&
          "border border-slate-200 bg-white hover:bg-slate-50 h-10 px-4 py-2",
        variant === "ghost" && "hover:bg-slate-100 h-10 px-4 py-2",
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button };
