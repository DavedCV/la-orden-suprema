import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../utils";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [currentType, setCurrentType] = useState(type);

    const togglePassword = () => {
      setShowPassword(!showPassword);
      setCurrentType(showPassword ? "password" : "text");
    };

    const inputClasses = cn(
      "flex h-11 w-full rounded-lg border border-orden-600 bg-orden-800 px-3 py-2 text-sm text-orden-100 placeholder-orden-400 transition-colors duration-200",
      "focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20",
      "disabled:cursor-not-allowed disabled:opacity-50",
      error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
      leftIcon && "pl-10",
      (rightIcon || showPasswordToggle) && "pr-10",
      className
    );

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-orden-200">{label}</label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orden-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={showPasswordToggle ? currentType : type}
            className={inputClasses}
            disabled={disabled}
            {...props}
          />

          {showPasswordToggle && type === "password" && (
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orden-400 hover:text-orden-200 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}

          {rightIcon && !showPasswordToggle && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orden-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1">
            <span className="h-4 w-4 text-red-400">⚠</span>
            {error}
          </p>
        )}

        {hint && !error && <p className="text-sm text-orden-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
