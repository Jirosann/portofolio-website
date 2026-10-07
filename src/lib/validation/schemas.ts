import { z } from 'zod';

// Profile Schema
export const ProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  position: z.string().min(1, "Position is required"),
  focus: z.string().min(1, "Focus is required"),
  heroDescription: z.string().min(1, "Hero description is required"),
  about: z.string().min(80, "About must be at least 80 characters").max(1000, "About must be less than 1000 characters"),
  photo: z.string().optional(),
  photoAlt: z.string().optional(),
  cv: z.string().optional(),
  availability: z.enum(['open', 'limited', 'unavailable']).optional(),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.string(),
    coursework: z.array(z.string()).optional(),
  })).optional(),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    period: z.string(),
    description: z.string().optional(),
  })).optional(),
});

// Experience Schema
export const ExperienceSchema = z.object({
  id: z.string(),
  type: z.enum(['organization', 'work', 'startup', 'academic', 'competition', 'other', 'ORGANIZATION', 'ACADEMIC PROJECT', 'WORKSHOP', 'SEMINAR']),
  role: z.string().min(1),
  organization: z.string().min(1),
  period: z.string().min(1),
  description: z.string().max(300).optional(),
  highlights: z.array(z.string().max(160)).max(5).default([]),
  tags: z.array(z.string()).max(6).default([]),
  order: z.number(),
  visible: z.boolean(),
});

// Skill Category Schema
export const SkillCategorySchema = z.object({
  id: z.string().min(1, "Category ID is required"),
  name: z.string().min(1, "Category name is required"),
  order: z.number(),
  visible: z.boolean(),
});

// Skill Schema
export const SkillSchema = z.object({
  id: z.string().min(1, "Skill ID is required"),
  name: z.string().min(1, "Skill name is required"),
  categoryId: z.string().min(1, "Category ID is required"),
  icon: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['used', 'learning']).optional(),
  primaryFocus: z.boolean().default(false),
  relatedProjects: z.array(z.string()).default([]),
  order: z.number(),
  visible: z.boolean(),
});

// Project Software Schema
export const ProjectSoftwareSchema = z.object({
  id: z.string().min(1, "Project ID is required"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be URL-safe (lowercase, numbers, hyphens)"),
  title: z.string().min(1, "Title is required"),
  summary: z.string().max(200, "Summary must be 200 characters or less"),
  thumbnail: z.string().min(1, "Thumbnail path is required"),
  thumbnailAlt: z.string().min(1, "Thumbnail alt text is required"),
  role: z.string().min(1, "Role is required"),
  technologies: z.array(z.string()).min(1, "At least one technology is required"),
  projectStatus: z.enum(['in-progress', 'completed', 'archived']),
  featured: z.boolean().default(false),
  order: z.number(),
  published: z.boolean(),
  demoUrl: z.string().url("Demo URL must be valid").optional(),
  repoUrl: z.string().url("Repository URL must be valid").optional(),
  repoVisibility: z.enum(['public', 'private']).optional(),
  techInsight: z.string().max(80, "Tech insight must be 80 characters or less").optional(),
  architectureDiagram: z.object({
    type: z.enum(['mermaid', 'svg']).default('mermaid'),
    source: z.string().min(1, "Diagram source is required"),
  }).optional(),
});

// Creative Works Schema
export const CreativeWorkSchema = z.object({
  id: z.string().min(1, "Creative work ID is required"),
  title: z.string().min(1, "Title is required"),
  type: z.enum(['video-editing', 'motion-graphics', 'photo-editing', 'other']),
  brief: z.string().max(200, "Brief must be 200 characters or less"),
  contribution: z.string().min(1, "Contribution is required"),
  tools: z.array(z.string()).optional(),
  thumbnail: z.string().min(1, "Thumbnail path is required"),
  thumbnailAlt: z.string().min(1, "Thumbnail alt text is required"),
  driveUrl: z.string().url("Google Drive URL must be valid"),
  order: z.number(),
  published: z.boolean(),
});

// Contact Schema
export const ContactSchema = z.object({
  type: z.enum(['email', 'linkedin', 'github', 'instagram', 'whatsapp', 'resume']),
  label: z.string().min(1, "Label is required"),
  value: z.string().min(1, "Value is required"),
  url: z.string().optional(),
  order: z.number(),
  visible: z.boolean(),
});

// Site Settings Schema
export const SiteSettingsSchema = z.object({
  title: z.string().min(1, "Site title is required"),
  description: z.string().min(1, "Site description is required"),
  language: z.string().default('en'),
  siteUrl: z.string().url("Site URL must be valid").optional(),
  ogImage: z.string().default('/opengraph-image'),
  analytics: z.object({
    enabled: z.boolean().default(false),
    provider: z.string().optional(),
  }).optional(),
  currentlyBuilding: z.object({
    enabled: z.boolean(),
    projectName: z.string(),
    projectSlug: z.string().optional(),
    projectUrl: z.string().url().optional(),
    updatedAt: z.string().optional(),
  }).optional(),
});

// Export types
export type Profile = z.infer<typeof ProfileSchema>;
export type SkillCategory = z.infer<typeof SkillCategorySchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type ProjectSoftware = z.infer<typeof ProjectSoftwareSchema>;
export type CreativeWork = z.infer<typeof CreativeWorkSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type SiteSettings = z.infer<typeof SiteSettingsSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;

// New Project Schema for Featured Projects Update
export const ProjectSchema = z
  .object({
    slug: z.string().min(1),
    title: z.string().min(1),
    status: z.enum(["completed", "in-progress"]),
    description: z.string().min(1),          // English, 1-2 kalimat
    tags: z.array(z.string()).default([]),    // contoh: ["Python", "TensorFlow"]
    repoUrl: z.string().url(),                // wajib untuk semua status
    liveUrl: z.string().url().optional(),     // hanya boleh untuk completed
    preview: z
      .object({
        src: z.string().startsWith("/"),      // path di /public, contoh /projects/tb-detector/preview.webp
        alt: z.string().min(1),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
      })
      .optional(),
  })
  .refine((p) => !(p.status === "in-progress" && p.liveUrl), {
    message: "in-progress project must not have liveUrl",
    path: ["liveUrl"],
  });

export type Project = z.infer<typeof ProjectSchema>;
