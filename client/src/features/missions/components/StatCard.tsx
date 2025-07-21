import { memo } from "react";

interface StatCardProps {
  title: string;
  value: number;
  color: "blue" | "gray" | "yellow" | "green" | "red";
  isActive: boolean;
  onClick: () => void;
}

const colorClasses = {
  blue: {
    active: "bg-blue-500/20 border-blue-500 text-blue-400",
    hover: "hover:bg-blue-500/10 hover:border-blue-500/50",
  },
  gray: {
    active: "bg-gray-500/20 border-gray-500 text-gray-400",
    hover: "hover:bg-gray-500/10 hover:border-gray-500/50",
  },
  yellow: {
    active: "bg-yellow-500/20 border-yellow-500 text-yellow-400",
    hover: "hover:bg-yellow-500/10 hover:border-yellow-500/50",
  },
  green: {
    active: "bg-green-500/20 border-green-500 text-green-400",
    hover: "hover:bg-green-500/10 hover:border-green-500/50",
  },
  red: {
    active: "bg-red-500/20 border-red-500 text-red-400",
    hover: "hover:bg-red-500/10 hover:border-red-500/50",
  },
} as const;

export const StatCard = memo(function StatCard({
  title,
  value,
  color,
  isActive,
  onClick,
}: StatCardProps) {
  const classes = colorClasses[color];

  return (
    <button
      onClick={onClick}
      className={`card p-4 text-center transition-all cursor-pointer border focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-orden-900 ${
        isActive ? classes.active : `${classes.hover} hover:scale-105`
      }`}
      aria-pressed={isActive}
      aria-label={`Filter by ${title}: ${value} missions`}
    >
      <div className="text-2xl font-bold text-orden-100 mb-1">{value}</div>
      <div className="text-xs text-orden-400">{title}</div>
    </button>
  );
});
