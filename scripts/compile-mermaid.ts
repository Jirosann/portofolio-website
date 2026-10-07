import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export async function compileMermaid(mermaidSyntax: string, title: string): Promise<string> {
  // Create temp directory for mermaid files
  const tempDir = path.join(os.tmpdir(), `mermaid-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });
  
  const inputFile = path.join(tempDir, 'diagram.mmd');
  const outputFile = path.join(tempDir, 'diagram.svg');
  
  try {
    // Write Mermaid syntax to temp file
    fs.writeFileSync(inputFile, mermaidSyntax, 'utf-8');
    
    // Compile using mmdc CLI (from @mermaid-js/mermaid-cli)
    await execAsync(`npx mmdc -i "${inputFile}" -o "${outputFile}" -t neutral -b transparent`);
    
    // Read generated SVG
    let svg = fs.readFileSync(outputFile, 'utf-8');
    
    // Inject accessibility attributes
    // Add title and aria-label
    svg = svg.replace(
      /<svg/,
      `<svg role="img" aria-label="${title}"`
    );
    
    // Add <title> as first child if not present
    if (!svg.includes('<title>')) {
      svg = svg.replace(
        /<svg[^>]*>/,
        (match) => `${match}\n  <title>${title}</title>`
      );
    }
    
    return svg;
  } catch (error: any) {
    throw new Error(`Mermaid compilation failed: ${error.message}`);
  } finally {
    // Cleanup temp files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }
}
