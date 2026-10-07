import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { ExperienceSchema, type Experience } from '@/lib/validation/schemas';

export function getExperience(): Experience[] {
  const experiencePath = path.join(process.cwd(), 'content/experience/experience.json');
  
  if (!fs.existsSync(experiencePath)) {
    return [];
  }
  
  const raw = fs.readFileSync(experiencePath, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('Failed to parse experience.json');
  }
  
  const result = z.array(ExperienceSchema).safeParse(data);
  
  if (!result.success) {
    throw new Error(`Experience validation failed: ${result.error.message}`);
  }
  
  return result.data.sort((a, b) => a.order - b.order);
}
