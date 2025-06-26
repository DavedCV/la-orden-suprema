import { LogOut, Shield } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import type { User } from "../../../shared/types";

interface DashboardHeaderProps {
  user: User;
  onLogout: () => void;
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
    <header className="bg-orden-800 border-b border-orden-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gold-500/20 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-gold-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gold-400">
                La Orden Suprema
              </h1>
              <p className="text-sm text-orden-400">
                {user.role === "admin"
                  ? "Panel de Administración"
                  : "Portal del Asesino"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-orden-200">{user.alias}</p>
              <p className="text-xs text-orden-400">
                {user.role === "admin" ? "Administrador" : "Asesino"}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-orden-300 hover:text-orden-100"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
