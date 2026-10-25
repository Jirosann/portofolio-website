import fs from 'fs';
import path from 'path';
import { ToolSchema, type Tool } from '@/lib/validation/schemas';

/** Tools I use. Berkas opsional: tanpa berkas, sub-bagian tidak dirender. */
export function getTools(): Tool[] {
  const toolsPath = path.join(process.cwd(), 'content/tools/tools.json');
  if (!fs.existsSync(toolsPath)) return [];

  const data: unknown = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));
  if (!Array.isArray(data)) throw new Error('Tools data must be an array');

  return data
    .map((tool) => {
      const result = ToolSchema.safeParse(tool);
      if (!result.success) {
        throw new Error(`Tool validation failed: ${result.error.message}`);
      }
      return result.data;
    })
    .sort((a, b) => a.order - b.order);
}
