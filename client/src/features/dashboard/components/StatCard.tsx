interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: "blue" | "yellow" | "gold" | "green";
}

export function StatCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    gold: "bg-gold-500/20 text-gold-400",
    green: "bg-green-500/20 text-green-400",
  };

  return (
    <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
      <div className="flex items-start">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-orden-400">{title}</p>
          <p className="text-2xl font-bold text-orden-100">{value}</p>
          <p className="text-xs text-orden-500 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
