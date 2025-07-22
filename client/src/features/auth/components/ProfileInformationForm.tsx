import React from "react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { User as UserIcon, MapPin } from "lucide-react";
import { Input } from "../../../shared/components/Input";
import type { User, Assassin } from "../../../shared/types";

interface ProfileUpdateFormData {
  alias: string;
  lastKnownLocation?: string;
}

interface ProfileInformationFormProps {
  profile: User | Assassin;
  isEditing: boolean;
  isUserAssassin: boolean;
  userRole?: string;
  register: UseFormRegister<ProfileUpdateFormData>;
  errors: FieldErrors<ProfileUpdateFormData>;
}

export const ProfileInformationForm = React.memo(
  function ProfileInformationForm({
    profile,
    isEditing,
    isUserAssassin,
    userRole,
    register,
    errors,
  }: ProfileInformationFormProps) {
    const assassinProfile = isUserAssassin ? (profile as Assassin) : null;

    return (
      <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
        <h3 className="text-lg font-semibold text-orden-100 mb-4 flex items-center">
          <UserIcon className="h-5 w-5 mr-2 text-gold-400" />
          Información Personal
        </h3>

        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-orden-400 mb-1">
                {userRole === "admin" ? "Alias de Administrador" : "Alias"}
              </label>
              <p className="text-orden-100">{profile.alias}</p>
            </div>

            {isUserAssassin && assassinProfile && (
              <div>
                <label className="block text-sm font-medium text-orden-400 mb-1">
                  Nombre Real
                </label>
                <p className="text-orden-100">
                  {assassinProfile.realName || "No especificado"}
                </p>
                <p className="text-xs text-orden-500 mt-1">
                  Solo visible para administradores
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-orden-400 mb-1">
                Email {userRole === "admin" ? "Corporativo" : ""}
              </label>
              <p className="text-orden-100">{profile.email}</p>
              {userRole === "admin" && (
                <p className="text-xs text-orden-500 mt-1">
                  Email principal para comunicaciones administrativas
                </p>
              )}
            </div>

            {isUserAssassin && assassinProfile && (
              <div>
                <label className="block text-sm font-medium text-orden-400 mb-1">
                  Última Ubicación Conocida
                </label>
                <p className="text-orden-100 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-orden-400" />
                  {assassinProfile.lastKnownLocation || "No especificada"}
                </p>
              </div>
            )}
          </div>
        ) : (
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-orden-200 mb-2">
                {userRole === "admin" ? "Alias de Administrador" : "Alias"} *
              </label>
              <Input
                {...register("alias")}
                error={errors.alias?.message}
                placeholder={
                  userRole === "admin"
                    ? "Ingresa tu alias de administrador"
                    : "Ingresa tu alias"
                }
              />
              {userRole === "admin" && (
                <p className="text-xs text-orden-500 mt-1">
                  Este nombre aparecerá en todos los registros administrativos
                </p>
              )}
            </div>

            {isUserAssassin && assassinProfile && (
              <div>
                <label className="block text-sm font-medium text-orden-400 mb-1">
                  Nombre Real
                </label>
                <Input
                  value={assassinProfile.realName || ""}
                  disabled
                  className="bg-orden-700 opacity-50"
                />
                <p className="text-xs text-orden-500 mt-1">
                  No editable - Solo administradores pueden modificar
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-orden-400 mb-1">
                Email {userRole === "admin" ? "Corporativo" : ""}
              </label>
              <Input
                value={profile.email}
                disabled
                className="bg-orden-700 opacity-50"
              />
              <p className="text-xs text-orden-500 mt-1">
                No editable - Contacta a un administrador para cambios
              </p>
            </div>

            {isUserAssassin && (
              <div>
                <label className="block text-sm font-medium text-orden-200 mb-2">
                  Última Ubicación Conocida
                </label>
                <Input
                  {...register("lastKnownLocation")}
                  placeholder="ej. Nueva York, Continental Hotel"
                  error={errors.lastKnownLocation?.message}
                />
                <p className="text-xs text-orden-500 mt-1">
                  Información opcional para registro interno
                </p>
              </div>
            )}
          </form>
        )}
      </div>
    );
  }
);
