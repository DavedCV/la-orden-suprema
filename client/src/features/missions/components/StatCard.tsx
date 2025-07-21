import React from "react";
import { MISSION_STAT_COLORS } from "../constants";

interface StatCardProps {
  title: string;
  value: string | number;
  color: keyof typeof MISSION_STAT_COLORS;
  icon?: React.ReactNode;
  subtitle?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = React.memo(
  ({ title, value, color, icon, subtitle, isActive, onClick }) => {
    const colorClass = MISSION_STAT_COLORS[color];
    const [textColor, bgColor, borderColor] = colorClass.split(" ");

    return (
      <div
        className={`card p-4 cursor-pointer transition-all hover:scale-105 ${
          isActive ? `border ${borderColor} shadow-lg` : ""
        } ${onClick ? "hover:border-orden-600" : ""}`}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        aria-pressed={isActive}
        aria-label={`${title}: ${value}${subtitle ? `. ${subtitle}` : ""}`}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-orden-300">{title}</h4>
          {icon && (
            <div className={`p-1.5 rounded ${bgColor}`}>
              <div className={textColor}>{icon}</div>
            </div>
          )}
        </div>
        <div>
          <p className={`text-lg font-bold ${textColor}`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-orden-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    );
  }
);

StatCard.displayName = "StatCard";
