import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { ProjectSoftwareSchema, CreativeWorkSchema, ProjectSchema, type ProjectSoftware, type CreativeWork, type Project } from '@/lib/validation/schemas';

export type ProjectWithMDX = ProjectSoftware & {
  mdxPath: string;
};

export function getSoftwareProjects(): ProjectWithMDX[] {
  const softwareDir = path.join(process.cwd(), 'content/projects/software');
  
  if (!fs.existsSync(softwareDir)) {
    return [];
  }
  
  const files = fs.readdirSync(softwareDir).filter(f => f.endsWith('.json'));
  
  const projects = files
    .map(file => {
      const filePath = path.join(softwareDir, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      const result = ProjectSoftwareSchema.safeParse(data);
      
      if (!result.success) {
        throw new Error(`Project validation failed for ${file}: ${result.error.message}`);
      }
      
      // Check for corresponding MDX file
      const mdxFile = file.replace('.json', '.mdx');
      const mdxPath = path.join(softwareDir, mdxFile);
      
      return {
        ...result.data,
        mdxPath: fs.existsSync(mdxPath) ? mdxPath : '',
      };
    })
    .filter(project => project.published); // Only published projects
  
  // Sort: featured first, then by order
  return projects.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.order - b.order;
  });
}

export function getCreativeWorks(): CreativeWork[] {
  const creativeDir = path.join(process.cwd(), 'content/projects/creative');
  
  if (!fs.existsSync(creativeDir)) {
    return [];
  }
  
  const files = fs.readdirSync(creativeDir).filter(f => f.endsWith('.json'));
  
  const works = files
    .map(file => {
      const filePath = path.join(creativeDir, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      const result = CreativeWorkSchema.safeParse(data);
      
      if (!result.success) {
        throw new Error(`Creative work validation failed for ${file}: ${result.error.message}`);
      }
      
      return result.data;
    })
    .filter(work => work.published); // Only published works
  
  // Sort by order
  return works.sort((a, b) => a.order - b.order);
}

export function getProjectBySlug(slug: string): ProjectWithMDX | null {
  const projects = getSoftwareProjects();
  return projects.find(p => p.slug === slug) || null;
}

export function getAllProjectSlugs(): string[] {
  const projects = getSoftwareProjects();
  return projects.map(p => p.slug);
}

export function getFeaturedProjects(): Project[] {
  const projectsFile = path.join(process.cwd(), 'content/projects.json');
  
  if (!fs.existsSync(projectsFile)) {
    return [];
  }
  
  const raw = fs.readFileSync(projectsFile, 'utf-8');
  const data = JSON.parse(raw);
  
  if (!Array.isArray(data)) {
    throw new Error('projects.json must contain an array of projects');
  }
  
  const result = z.array(ProjectSchema).safeParse(data);
  if (!result.success) {
    throw new Error(`Featured Projects validation failed: ${result.error.message}`);
  }
  
  return result.data;
}

export function getCompletedProjectsCount(): number {
  const featured = getFeaturedProjects();
  return featured.filter((p) => p.status === 'completed').length;
}

// force reload
