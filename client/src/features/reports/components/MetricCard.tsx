import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  total?: number;
  icon: React.ReactNode;
  color: "green" | "blue" | "gold" | "yellow" | "red";
  trend?: number;
  "aria-label"?: string;
}

export function MetricCard({
  title,
  value,
  total,
  icon,
  color,
  trend,
  "aria-label": ariaLabel,
}: MetricCardProps) {
  const colorClasses = {
    green: "text-green-400 bg-green-500/20",
    blue: "text-blue-400 bg-blue-500/20",
    gold: "text-gold-400 bg-gold-500/20",
    yellow: "text-yellow-400 bg-yellow-500/20",
    red: "text-red-400 bg-red-500/20",
  };

  const effectiveAriaLabel =
    ariaLabel || `${title}: ${value}${total ? ` de ${total}` : ""}`;

  return (
    <div className="card p-6" role="region" aria-label={effectiveAriaLabel}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-orden-300">{title}</h4>
        <div
          className={`p-2 rounded-lg ${colorClasses[color]}`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p
            className={`text-2xl font-bold ${
              colorClasses[color].split(" ")[0]
            }`}
          >
            {value}
          </p>
          {total && (
            <p className="text-xs text-orden-500 mt-1">de {total} totales</p>
          )}
        </div>
        {trend && (
          <div
            className="flex items-center space-x-1"
            aria-label={`Tendencia: ${
              trend > 0 ? "aumentó" : "disminuyó"
            } ${Math.abs(trend)}%`}
          >
            {trend > 0 ? (
              <TrendingUp
                className="h-3 w-3 text-green-400"
                aria-hidden="true"
              />
            ) : (
              <TrendingDown
                className="h-3 w-3 text-red-400"
                aria-hidden="true"
              />
            )}
            <span
              className={`text-xs font-medium ${
                trend > 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
