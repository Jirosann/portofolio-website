import fs from 'fs';
import path from 'path';
import { ProfileSchema, type Profile } from '@/lib/validation/schemas';

export function getProfile(): Profile {
  const profilePath = path.join(process.cwd(), 'content/profile/profile.json');
  
  if (!fs.existsSync(profilePath)) {
    throw new Error('Profile not found');
  }
  
  const raw = fs.readFileSync(profilePath, 'utf-8');
  const data = JSON.parse(raw);
  const result = ProfileSchema.safeParse(data);
  
  if (!result.success) {
    throw new Error(`Profile validation failed: ${result.error.message}`);
  }
  
  return result.data;
}
