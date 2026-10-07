import fs from 'fs';
import path from 'path';
import { SiteSettingsSchema, type SiteSettings } from '@/lib/validation/schemas';

export function getSiteSettings(): SiteSettings {
  const settingsPath = path.join(process.cwd(), 'content/site/settings.json');
  
  if (!fs.existsSync(settingsPath)) {
    throw new Error('Site settings not found');
  }
  
  const raw = fs.readFileSync(settingsPath, 'utf-8');
  const data = JSON.parse(raw);
  const result = SiteSettingsSchema.safeParse(data);
  
  if (!result.success) {
    throw new Error(`Site settings validation failed: ${result.error.message}`);
  }
  
  return result.data;
}
