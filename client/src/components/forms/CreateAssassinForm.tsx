import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  User,
  UserPlus,
  Plus,
  Trash2,
  Target,
  Shield,
  Key,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { apiService } from "../../services/api";
import { toast } from "../../utils/toast";

// Validation schema
const createAssassinSchema = z.object({
  alias: z
    .string()
    .min(2, "El alias debe tener al menos 2 caracteres")
    .max(50, "El alias no puede exceder 50 caracteres")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "El alias solo puede contener letras, números, espacios, guiones y guiones bajos"
    ),
  email: z
    .string()
    .email("Debe ser un email válido")
    .min(1, "El email es requerido"),
  realName: z
    .string()
    .min(2, "El nombre real debe tener al menos 2 caracteres")
    .max(100, "El nombre real no puede exceder 100 caracteres"),
  initialStatus: z
    .enum(["Activo", "Retirado", "Excommunicado"] as const)
    .default("Activo"),
  initialGoldCoins: z
    .number()
    .min(0, "Las monedas iniciales no pueden ser negativas")
    .max(1000000, "Las monedas iniciales no pueden exceder 1,000,000")
    .default(1000),
});

type CreateAssassinFormData = z.infer<typeof createAssassinSchema>;

interface CreateAssassinFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface GeneratedCredentials {
  email: string;
  password: string;
  alias: string;
}

// Utility function to generate secure password
function generateSecurePassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function CreateAssassinForm({
  onClose,
  onSuccess,
}: CreateAssassinFormProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] =
    useState<GeneratedCredentials | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAssassinFormData>({
    resolver: zodResolver(createAssassinSchema),
    defaultValues: {
      initialStatus: "Activo",
      initialGoldCoins: 1000,
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        type: "success",
        title: "Copiado",
        message: `${label} copiado al portapapeles`,
      });
    });
  };

  const onSubmit = async (data: CreateAssassinFormData) => {
    try {
      setIsSubmitting(true);

      // Generate temporary password
      const temporaryPassword = generateSecurePassword();

      const formData = {
        ...data,
        skills,
        temporaryPassword,
      };

      await apiService.createAssassin(formData);

      // Store generated credentials
      setGeneratedCredentials({
        email: data.email,
        password: temporaryPassword,
        alias: data.alias,
      });

      setShowCredentials(true);

      toast({
        type: "success",
        title: "Asesino creado exitosamente",
        message: `${data.alias} ha sido registrado en La Orden`,
      });
    } catch (error: unknown) {
      toast({
        type: "error",
        title: "Error al crear asesino",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo crear el asesino. Inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalClose = () => {
    setShowCredentials(false);
    setGeneratedCredentials(null);
    onSuccess();
  };

  // Show credentials screen after successful creation
  if (showCredentials && generatedCredentials) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-orden-800 rounded-lg w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-orden-700">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <Key className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-orden-100">
                  Credenciales Generadas
                </h2>
                <p className="text-sm text-orden-400">
                  Asesino creado exitosamente
                </p>
              </div>
            </div>
          </div>

          {/* Credentials Display */}
          <div className="p-6 space-y-6">
            {/* Success Message */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-green-400 mb-1">
                    ¡Asesino Registrado!
                  </h4>
                  <p className="text-sm text-orden-300">
                    <strong>{generatedCredentials.alias}</strong> ha sido
                    agregado exitosamente a La Orden Suprema.
                  </p>
                </div>
              </div>
            </div>

            {/* Credentials */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-orden-100">
                Credenciales de Acceso Temporales
              </h3>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-orden-200 mb-2">
                  Email de Usuario
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={generatedCredentials.email}
                    readOnly
                    className="flex-1 bg-orden-700"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      copyToClipboard(generatedCredentials.email, "Email")
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-orden-200 mb-2">
                  Contraseña Temporal
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={generatedCredentials.password}
                      readOnly
                      className="bg-orden-700 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orden-400 hover:text-orden-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      copyToClipboard(
                        generatedCredentials.password,
                        "Contraseña"
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-gold-500/10 border border-gold-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-gold-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-gold-400 mb-2">
                    Instrucciones Importantes
                  </h4>
                  <ul className="text-sm text-orden-300 space-y-1">
                    <li>
                      • El asesino debe cambiar la contraseña en su primer
                      inicio de sesión
                    </li>
                    <li>• Estas credenciales son válidas por 7 días</li>
                    <li>• Guarda esta información en un lugar seguro</li>
                    <li>
                      • No compartas estas credenciales por medios inseguros
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6 border-t border-orden-700">
              <Button
                variant="secondary"
                onClick={() => {
                  const credentialsText = `
La Orden Suprema - Credenciales de Acceso

Asesino: ${generatedCredentials.alias}
Email: ${generatedCredentials.email}
Contraseña Temporal: ${generatedCredentials.password}

IMPORTANTE:
- Cambiar contraseña en el primer inicio de sesión
- Credenciales válidas por 7 días
- Mantener información segura
                  `.trim();

                  copyToClipboard(credentialsText, "Credenciales completas");
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Todo
              </Button>

              <Button
                onClick={handleFinalClose}
                className="bg-gold-500 hover:bg-gold-600 text-orden-900"
              >
                Finalizar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-orden-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orden-700">
          <div className="flex items-center space-x-3">
            <div className="bg-gold-500/20 p-2 rounded-lg">
              <UserPlus className="h-5 w-5 text-gold-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-orden-100">
                Registrar Nuevo Asesino
              </h2>
              <p className="text-sm text-orden-400">
                Agregar un nuevo miembro a La Orden Suprema
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-orden-400 hover:text-orden-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-orden-100 flex items-center">
              <User className="h-5 w-5 mr-2 text-gold-400" />
              Información Básica
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Alias */}
              <div>
                <label className="block text-sm font-medium text-orden-200 mb-2">
                  Alias *
                </label>
                <Input
                  {...register("alias")}
                  placeholder="ej. Baba Yaga"
                  error={errors.alias?.message}
                />
                <p className="text-xs text-orden-500 mt-1">
                  Nombre por el cual será conocido en La Orden
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-orden-200 mb-2">
                  Email *
                </label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="asesino@orden.com"
                  error={errors.email?.message}
                />
              </div>
            </div>

            {/* Real Name */}
            <div>
              <label className="block text-sm font-medium text-orden-200 mb-2">
                Nombre Real *
              </label>
              <Input
                {...register("realName")}
                placeholder="Nombre completo del asesino"
                error={errors.realName?.message}
              />
              <p className="text-xs text-orden-500 mt-1">
                Información confidencial para registros internos
              </p>
            </div>

            {/* Initial Status */}
            <div>
              <label className="block text-sm font-medium text-orden-200 mb-2">
                Estado Inicial
              </label>
              <select
                {...register("initialStatus")}
                className="w-full bg-orden-700 border border-orden-600 rounded-lg px-3 py-2 text-orden-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="Activo">Activo</option>
                <option value="Retirado">Retirado</option>
                <option value="Excommunicado">Excommunicado</option>
              </select>
              <p className="text-xs text-orden-500 mt-1">
                Estado con el que iniciará el asesino en el sistema
              </p>
            </div>

            {/* Initial Gold Coins */}
            <div>
              <label className="block text-sm font-medium text-orden-200 mb-2">
                Monedas de Oro Iniciales
              </label>
              <Input
                {...register("initialGoldCoins", { valueAsNumber: true })}
                type="number"
                min="0"
                max="1000000"
                placeholder="1000"
                error={errors.initialGoldCoins?.message}
              />
              <p className="text-xs text-orden-500 mt-1">
                Saldo inicial en la cuenta del asesino (por defecto: 1,000)
              </p>
            </div>
          </div>

          {/* Skills Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-orden-100 flex items-center">
              <Target className="h-5 w-5 mr-2 text-gold-400" />
              Habilidades Especializadas
            </h3>

            {/* Add Skill */}
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="ej. Eliminación silenciosa"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSkill())
                }
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addSkill}
                disabled={!newSkill.trim() || skills.length >= 10}
                size="sm"
                variant="secondary"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Skills List */}
            {skills.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-orden-300">
                  Habilidades agregadas ({skills.length}/10):
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-orden-700 text-orden-200 px-3 py-1 rounded-md text-sm"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-orden-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {skills.length === 0 && (
              <div className="text-center py-4 text-orden-500 bg-orden-900/50 rounded-lg border border-dashed border-orden-600">
                <p className="text-sm">No se han agregado habilidades</p>
                <p className="text-xs">
                  Las habilidades son opcionales pero recomendadas
                </p>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-gold-500/10 border border-gold-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Key className="h-5 w-5 text-gold-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-gold-400 mb-1">
                  Credenciales de Acceso
                </h4>
                <p className="text-sm text-orden-300">
                  Se generará automáticamente una contraseña temporal segura. El
                  nuevo asesino deberá cambiarla en su primer inicio de sesión.
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-orden-700">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gold-500 hover:bg-gold-600 text-orden-900"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creando...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Crear Asesino
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
