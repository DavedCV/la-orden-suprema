import { Button } from "../../../shared/components/Button";
import { useNavigation } from "../../../shared/hooks/useNavigation";
import {
  User,
  Target,
  Users,
  BarChart3,
  PieChart,
  Settings,
  Skull,
} from "lucide-react";
import type { UserRole } from "../../../shared/types";

interface QuickActionsProps {
  role: UserRole;
}

export function QuickActions({ role }: QuickActionsProps) {
  const { navigateTo } = useNavigation();

  const adminActions = [
    {
      icon: User,
      label: "Mi Perfil",
      path: "/profile",
    },
    {
      icon: Users,
      label: "Gestionar Asesinos",
      path: "/assassins",
    },
    {
      icon: Target,
      label: "Gestionar Misiones",
      path: "/missions",
    },
    {
      icon: BarChart3,
      label: "Mapa Global",
      path: "/map",
    },
    {
      icon: PieChart,
      label: "Reportes",
      path: "/reports",
    },
  ];

  const assassinActions = [
    {
      icon: User,
      label: "Mi Perfil",
      path: "/profile",
    },
    {
      icon: Target,
      label: "Misiones Disponibles",
      path: "/available-missions",
    },
    {
      icon: Target,
      label: "Mis Misiones",
      path: "/my-missions",
    },
    {
      icon: Skull,
      label: "Blood Markers",
      path: "/blood-markers",
    },
    {
      icon: Users,
      label: "Directorio",
      path: "/directory",
    },
  ];

  const actions = role === "admin" ? adminActions : assassinActions;

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-orden-100 mb-4">
        Acciones Rápidas
      </h3>
      <div className="space-y-3">
        {actions.map((action) => (
          <Button
            key={action.path}
            fullWidth
            variant="secondary"
            size="sm"
            onClick={() => navigateTo(action.path)}
          >
            <action.icon className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        ))}
        <Button fullWidth variant="ghost" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configuración
        </Button>
      </div>
    </div>
  );
}
