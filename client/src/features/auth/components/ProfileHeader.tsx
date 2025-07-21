import React from "react";
import { Edit3, Save, X, Lock } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";

interface ProfileHeaderProps {
  isEditing: boolean;
  userRole?: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onPasswordChange: () => void;
  onBackToDashboard: () => void;
  isSaving?: boolean;
}

export const ProfileHeader = React.memo(function ProfileHeader({
  isEditing,
  userRole,
  onEdit,
  onSave,
  onCancel,
  onPasswordChange,
  onBackToDashboard,
  isSaving = false,
}: ProfileHeaderProps) {
  return (
    <div className="bg-orden-800 border-b border-orden-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Navigation Button with multiple fallback strategies */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                try {
                  onBackToDashboard();
                } catch (error) {
                  console.error("Navigation error:", error);
                  // Fallback navigation
                  window.location.href = "/dashboard";
                }
              }}
              className="text-orden-400 hover:text-orden-200"
            >
              ← Volver al Dashboard
            </Button>

            {/* Alternative: Direct link fallback (uncomment if button doesn't work) */}
            {/*
            <a
              href="/dashboard"
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-orden-400 hover:text-orden-200 hover:bg-orden-800 rounded-md transition-colors duration-200"
            >
              ← Volver al Dashboard
            </a>
            */}
            <div>
              <h1 className="text-2xl font-bold text-orden-100 flex items-center">
                Mi Perfil
                {userRole === "admin" && (
                  <span className="ml-2 text-sm font-normal text-gold-400">
                    - Administrador
                  </span>
                )}
              </h1>
              <p className="text-orden-300 mt-1">
                {userRole === "admin"
                  ? "Gestiona tu información de administrador"
                  : "Gestiona tu información personal"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="secondary" size="sm" onClick={onPasswordChange}>
              <Lock className="h-4 w-4 mr-2" />
              Cambiar Contraseña
            </Button>

            {!isEditing ? (
              <Button
                onClick={onEdit}
                className="bg-gold-500 hover:bg-gold-600 text-orden-900"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={onCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={onSave}
                  disabled={isSaving}
                  className="bg-gold-500 hover:bg-gold-600 text-orden-900"
                >
                  {isSaving ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
