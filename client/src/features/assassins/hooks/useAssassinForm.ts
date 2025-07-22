import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "../../../shared/utils/toast";
import { apiService } from "../../../shared/services/api";
import type { Assassin } from "../../../shared/types";

// Schema for editing assassin
const editAssassinSchema = z.object({
  alias: z
    .string()
    .min(2, "El alias debe tener al menos 2 caracteres")
    .max(50, "El alias no puede exceder 50 caracteres"),
  realName: z
    .string()
    .min(2, "El nombre real debe tener al menos 2 caracteres")
    .max(100, "El nombre real no puede exceder 100 caracteres"),
  lastKnownLocation: z
    .string()
    .max(100, "La ubicación no puede exceder 100 caracteres")
    .optional(),
  goldCoins: z
    .number()
    .min(0, "Las monedas de oro no pueden ser negativas")
    .max(1000000, "Cantidad máxima excedida"),
  status: z.enum(["Activo", "Retirado", "Excommunicado"], {
    required_error: "El estado es requerido",
  }),
});

type EditAssassinFormData = z.infer<typeof editAssassinSchema>;

export const useAssassinForm = (assassin: Assassin, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const [skills, setSkills] = useState<string[]>(assassin.skills || []);
  const [newSkill, setNewSkill] = useState("");

  // Form setup
  const form = useForm<EditAssassinFormData>({
    resolver: zodResolver(editAssassinSchema),
    defaultValues: {
      alias: assassin.alias,
      realName: assassin.realName || "",
      lastKnownLocation: assassin.lastKnownLocation || "",
      goldCoins: assassin.goldCoins,
      status: assassin.status,
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: EditAssassinFormData & { skills: string[] }) => {
      return apiService.updateAssassin(assassin.id, {
        ...data,
        skills,
      });
    },
    onSuccess: () => {
      toast({
        type: "success",
        title: "Asesino actualizado",
        message: "La información ha sido actualizada correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["assassins"] });
      onSuccess?.();
    },
    onError: () => {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo actualizar la información del asesino",
      });
    },
  });

  const onSubmit = (formData: EditAssassinFormData) => {
    updateMutation.mutate({ ...formData, skills });
  };

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

  const resetForm = () => {
    form.reset();
    setSkills(assassin.skills || []);
    setNewSkill("");
  };

  return {
    form,
    skills,
    newSkill,
    setNewSkill,
    addSkill,
    removeSkill,
    resetForm,
    onSubmit: form.handleSubmit(onSubmit),
    isUpdating: updateMutation.isPending,
  };
};
