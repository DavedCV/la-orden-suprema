import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../utils";
import { LoadingSpinner } from "./LoadingSpinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-orden-900 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-gold-600 hover:bg-gold-700 focus:ring-gold-500 text-orden-900",
      secondary:
        "bg-orden-700 hover:bg-orden-600 focus:ring-orden-500 text-orden-100 border border-orden-600",
      ghost:
        "hover:bg-orden-800 focus:ring-orden-500 text-orden-300 hover:text-orden-100",
      danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm rounded-md",
      md: "px-4 py-2 text-sm rounded-lg",
      lg: "px-6 py-3 text-base rounded-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <LoadingSpinner size="sm" className="mr-2" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
