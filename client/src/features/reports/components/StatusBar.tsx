interface StatusBarProps {
  label: string;
  value: number;
  total: number;
  color: "green" | "blue" | "red" | "yellow";
  "aria-label"?: string;
}

export function StatusBar({
  label,
  value,
  total,
  color,
  "aria-label": ariaLabel,
}: StatusBarProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  const colorClasses = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
  };

  const effectiveAriaLabel =
    ariaLabel || `${label}: ${value} de ${total} (${percentage.toFixed(1)}%)`;

  return (
    <div role="region" aria-label={effectiveAriaLabel}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-orden-300">{label}</span>
        <span className="text-sm font-medium text-orden-100">
          {value} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div
        className="w-full bg-orden-800 rounded-full h-2"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
