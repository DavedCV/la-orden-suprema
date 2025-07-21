import React from "react";
import { Award, X } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import type { UseSkillsManagerReturn } from "../hooks/useSkillsManager";
import type { Assassin } from "../../../shared/types";

interface SkillsSectionProps {
  profile: Assassin;
  isEditing: boolean;
  skillsManager: UseSkillsManagerReturn;
  addSkill: () => void;
  removeSkill: (skill: string) => void;
}

export const SkillsSection = React.memo(function SkillsSection({
  profile,
  isEditing,
  skillsManager,
  addSkill,
  removeSkill,
}: SkillsSectionProps) {
  return (
    <div className="bg-orden-800 rounded-lg p-6 border border-orden-700">
      <h3 className="text-lg font-semibold text-orden-100 mb-4 flex items-center">
        <Award className="h-5 w-5 mr-2 text-gold-400" />
        Habilidades Especializadas
      </h3>

      {!isEditing ? (
        <div>
          {profile.skills && profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orden-700 text-orden-200 text-sm rounded-md border border-orden-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-orden-500 italic">
              No se han especificado habilidades
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Add Skill */}
          <div className="flex gap-2">
            <Input
              value={skillsManager.newSkill}
              onChange={(e) => skillsManager.setNewSkill(e.target.value)}
              placeholder="Agregar nueva habilidad"
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSkill())
              }
              className="flex-1"
            />
            <Button
              type="button"
              onClick={addSkill}
              disabled={!skillsManager.canAddSkill}
              size="sm"
              variant="secondary"
            >
              Agregar
            </Button>
          </div>

          {/* Skills List */}
          {skillsManager.skills.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-orden-300">
                Habilidades ({skillsManager.skills.length}/10):
              </p>
              <div className="flex flex-wrap gap-2">
                {skillsManager.skills.map((skill: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center bg-orden-700 text-orden-200 px-3 py-1 rounded-md text-sm border border-orden-600"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-orden-400 hover:text-red-400 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
