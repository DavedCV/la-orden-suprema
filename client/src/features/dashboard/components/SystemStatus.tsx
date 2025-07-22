// Future: could accept real status data as props
export function SystemStatus() {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-orden-100 mb-4">
        Estado del Sistema
      </h3>
      <div className="space-y-3">
        <StatusItem status="online" label="Continental Network" />
        <StatusItem status="online" label="Secure Communications" />
        <StatusItem status="warning" label="Location Services" />
      </div>
    </div>
  );
}

function StatusItem({
  status,
  label,
}: {
  status: "online" | "warning" | "offline";
  label: string;
}) {
  const statusConfig = {
    online: {
      color: "bg-green-500",
      text: "text-green-400",
      label: "Activo",
    },
    warning: {
      color: "bg-yellow-500",
      text: "text-yellow-400",
      label: "Alerta",
    },
    offline: {
      color: "bg-red-500",
      text: "text-red-400",
      label: "Inactivo",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-orden-300">{label}</span>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        <span className={`text-xs font-medium ${config.text}`}>
          {config.label}
        </span>
      </div>
    </div>
  );
}
