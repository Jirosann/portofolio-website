 
import fs from 'fs';
import path from 'path';
import { SkillCategorySchema, SkillSchema, type SkillCategory, type Skill } from '@/lib/validation/schemas';

export type SkillCategoryWithSkills = SkillCategory & {
  skills: Skill[];
  isPrimary: boolean; // Computed: true if any skill in category has primaryFocus
};

export function getSkills(): SkillCategoryWithSkills[] {
  const categoriesPath = path.join(process.cwd(), 'content/skills/categories.json');
  const skillsPath = path.join(process.cwd(), 'content/skills/skills.json');
  
  if (!fs.existsSync(categoriesPath) || !fs.existsSync(skillsPath)) {
    throw new Error('Skills data not found');
  }
  
  const categoriesRaw = fs.readFileSync(categoriesPath, 'utf-8');
  const skillsRaw = fs.readFileSync(skillsPath, 'utf-8');
  
  const categoriesData = JSON.parse(categoriesRaw);
  const skillsData = JSON.parse(skillsRaw);
  
  // Validate categories
  const categories = categoriesData
    .map((cat: any) => {
      const result = SkillCategorySchema.safeParse(cat);
      if (!result.success) {
        throw new Error(`Category validation failed: ${result.error.message}`);
      }
      return result.data;
    })
    .filter((cat: SkillCategory) => cat.visible)
    .sort((a: SkillCategory, b: SkillCategory) => a.order - b.order);
  
  // Validate skills
  const skills = skillsData
    .map((skill: any) => {
      const result = SkillSchema.safeParse(skill);
      if (!result.success) {
        throw new Error(`Skill validation failed: ${result.error.message}`);
      }
      return result.data;
    })
    .filter((skill: Skill) => skill.visible)
    .sort((a: Skill, b: Skill) => a.order - b.order);
  
  // Group skills by category and compute isPrimary
  const result: SkillCategoryWithSkills[] = categories.map((category: SkillCategory) => {
    const categorySkills = skills.filter((skill: Skill) => skill.categoryId === category.id);
    const isPrimary = categorySkills.some((skill: Skill) => skill.primaryFocus);
    
    return {
      ...category,
      skills: categorySkills,
      isPrimary,
    };
  });
  
  // Filter out empty categories (no visible skills)
  return result.filter(cat => cat.skills.length > 0);
}
