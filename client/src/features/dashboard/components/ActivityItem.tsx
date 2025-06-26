import { Clock } from "lucide-react";
import { formatDate } from "../../../shared/utils";

interface ActivityItemProps {
  title: string;
  subtitle: string;
  time: string;
}

export function ActivityItem({ title, subtitle, time }: ActivityItemProps) {
  return (
    <div className="flex items-start space-x-3 p-3 bg-orden-700/50 rounded-lg">
      <div className="bg-orden-600 p-2 rounded-lg">
        <Clock className="h-4 w-4 text-orden-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-orden-200">{title}</p>
        <p className="text-xs text-orden-400">{subtitle}</p>
        <p className="text-xs text-orden-500 mt-1">{formatDate(time)}</p>
      </div>
    </div>
  );
}
