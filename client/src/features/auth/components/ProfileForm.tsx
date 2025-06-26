import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X, Plus, Minus } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import type { User, Assassin } from "../../../shared/types";

// Validation schema for profile update
const profileUpdateSchema = z.object({
  alias: z
    .string()
    .min(2, "El alias debe tener al menos 2 caracteres")
    .max(50, "El alias no puede exceder 50 caracteres")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "El alias solo puede contener letras, números, espacios, guiones y guiones bajos"
    ),
  lastKnownLocation: z
    .string()
    .max(100, "La ubicación no puede exceder 100 caracteres")
    .optional(),
});

type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

interface ProfileFormProps {
  profile: User | Assassin;
  onSubmit: (data: ProfileUpdateFormData & { skills?: string[] }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

// Type guard to check if profile is an Assassin
function isAssassin(profile: User | Assassin): profile is Assassin {
  return "status" in profile && "goldCoins" in profile;
}

export function ProfileForm({
  profile,
  onSubmit,
  onCancel,
  isLoading,
}: ProfileFormProps) {
  const isUserAssassin = isAssassin(profile);
  const [skills, setSkills] = useState<string[]>(
    isUserAssassin ? profile.skills || [] : []
  );
  const [newSkill, setNewSkill] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      alias: profile.alias,
      lastKnownLocation: isUserAssassin ? profile.lastKnownLocation || "" : "",
    },
  });

  const addSkill = () => {
    if (
      newSkill.trim() &&
      !skills.includes(newSkill.trim()) &&
      skills.length < 10
    ) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleFormSubmit = (data: ProfileUpdateFormData) => {
    const submitData = isUserAssassin ? { ...data, skills } : data;
    onSubmit(submitData);
  };

  return (
    <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Alias */}
        <div>
          <Input
            {...register("alias")}
            label="Alias"
            placeholder="Tu alias en La Orden"
            error={errors.alias?.message}
            disabled={isLoading}
          />
        </div>

        {/* Location (only for assassins) */}
        {isUserAssassin && (
          <div>
            <Input
              {...register("lastKnownLocation")}
              label="Última Ubicación Conocida"
              placeholder="Ciudad, País"
              error={errors.lastKnownLocation?.message}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Skills (only for assassins) */}
        {isUserAssassin && (
          <div>
            <label className="block text-sm font-medium text-orden-200 mb-2">
              Habilidades Especiales
            </label>

            {/* Add new skill */}
            <div className="flex gap-2 mb-3">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Nueva habilidad..."
                disabled={isLoading || skills.length >= 10}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addSkill}
                disabled={!newSkill.trim() || skills.length >= 10 || isLoading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Skills list */}
            <div className="space-y-2">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-orden-700 rounded p-3"
                >
                  <span className="text-orden-200">{skill}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(skill)}
                    disabled={isLoading}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {skills.length === 0 && (
                <p className="text-orden-400 text-center py-4">
                  No hay habilidades registradas
                </p>
              )}
            </div>
            {skills.length >= 10 && (
              <p className="text-yellow-400 text-sm mt-2">
                Máximo 10 habilidades permitidas
              </p>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-orden-700">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
