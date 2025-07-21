import { useState, useCallback, useMemo } from 'react';

interface UseSkillsManagerProps {
  initialSkills?: string[];
  maxSkills?: number;
}

export interface UseSkillsManagerReturn {
  skills: string[];
  newSkill: string;
  setNewSkill: (skill: string) => void;
  setSkills: (skills: string[]) => void;
  addSkill: () => void;
  removeSkill: (skillToRemove: string) => void;
  resetSkills: (skills: string[]) => void;
  canAddSkill: boolean;
}

export function useSkillsManager({
  initialSkills = [],
  maxSkills = 10
}: UseSkillsManagerProps = {}): UseSkillsManagerReturn {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [newSkill, setNewSkill] = useState('');

  const addSkill = useCallback(() => {
    const trimmedSkill = newSkill.trim();
    if (
      trimmedSkill &&
      !skills.includes(trimmedSkill) &&
      skills.length < maxSkills
    ) {
      setSkills([...skills, trimmedSkill]);
      setNewSkill('');
    }
  }, [newSkill, skills, maxSkills]);

  const removeSkill = useCallback((skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  }, [skills]);

  const resetSkills = useCallback((newSkills: string[]) => {
    setSkills(newSkills);
    setNewSkill('');
  }, []);

  const canAddSkill = useMemo(() =>
    !!(newSkill.trim() && skills.length < maxSkills && !skills.includes(newSkill.trim())),
    [newSkill, skills, maxSkills]
  );

  return useMemo(() => ({
    skills,
    newSkill,
    setNewSkill,
    setSkills,
    addSkill,
    removeSkill,
    resetSkills,
    canAddSkill,
  }), [skills, newSkill, setNewSkill, setSkills, addSkill, removeSkill, resetSkills, canAddSkill]);
}
