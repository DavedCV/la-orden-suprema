import React from "react";
import { X } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";

interface SkillsEditorProps {
  skills: string[];
  newSkill: string;
  setNewSkill: (skill: string) => void;
  addSkill: () => void;
  removeSkill: (skill: string) => void;
  isEditing: boolean;
  maxSkills?: number;
}

export const SkillsEditor: React.FC<SkillsEditorProps> = ({
  skills,
  newSkill,
  setNewSkill,
  addSkill,
  removeSkill,
  isEditing,
  maxSkills = 10,
}) => {
  if (!isEditing) {
    return (
      <div>
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
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
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Skill */}
      <div className="flex gap-2">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Agregar nueva habilidad"
          onKeyPress={(e) =>
            e.key === "Enter" && (e.preventDefault(), addSkill())
          }
          className="flex-1"
        />
        <Button
          type="button"
          onClick={addSkill}
          disabled={!newSkill.trim() || skills.length >= maxSkills}
          size="sm"
          variant="secondary"
        >
          Agregar
        </Button>
      </div>

      {/* Skills List */}
      {skills.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-orden-300">
            Habilidades ({skills.length}/{maxSkills}):
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
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
  );
};
