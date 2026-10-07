import fs from 'fs';
import path from 'path';
import {
  ProfileSchema,
  SkillCategorySchema,
  SkillSchema,
  ProjectSoftwareSchema,
  CreativeWorkSchema,
  ContactSchema,
  SiteSettingsSchema,
  ExperienceSchema,
} from '../src/lib/validation/schemas';

type ValidationError = {
  file: string;
  field?: string;
  message: string;
};

function validate() {
  const errors: ValidationError[] = [];
  
  // Validate profile
  const profilePath = 'content/profile/profile.json';
  if (fs.existsSync(profilePath)) {
    try {
      const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
      const result = ProfileSchema.safeParse(profile);
      if (!result.success) {
        result.error.issues.forEach(issue => {
          errors.push({
            file: profilePath,
            field: issue.path.join('.'),
            message: issue.message,
          });
        });
      }
    } catch (err: any) {
      errors.push({ file: profilePath, message: `Parse error: ${err.message}` });
    }
  } else {
    errors.push({ file: profilePath, message: 'File not found' });
  }
  
  // Validate skill categories
  const categoriesPath = 'content/skills/categories.json';
  const categoryIds = new Set<string>();
  if (fs.existsSync(categoriesPath)) {
    try {
      const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
      if (!Array.isArray(categories)) {
        errors.push({ file: categoriesPath, message: 'Must be an array' });
      } else {
        categories.forEach((cat, idx) => {
          const result = SkillCategorySchema.safeParse(cat);
          if (!result.success) {
            result.error.issues.forEach(issue => {
              errors.push({
                file: categoriesPath,
                field: `[${idx}].${issue.path.join('.')}`,
                message: issue.message,
              });
            });
          } else {
            categoryIds.add(cat.id);
          }
        });
      }
    } catch (err: any) {
      errors.push({ file: categoriesPath, message: `Parse error: ${err.message}` });
    }
  } else {
    errors.push({ file: categoriesPath, message: 'File not found' });
  }
  
  // Validate skills
  const skillsPath = 'content/skills/skills.json';
  if (fs.existsSync(skillsPath)) {
    try {
      const skills = JSON.parse(fs.readFileSync(skillsPath, 'utf-8'));
      if (!Array.isArray(skills)) {
        errors.push({ file: skillsPath, message: 'Must be an array' });
      } else {
        skills.forEach((skill, idx) => {
          const result = SkillSchema.safeParse(skill);
          if (!result.success) {
            result.error.issues.forEach(issue => {
              errors.push({
                file: skillsPath,
                field: `[${idx}].${issue.path.join('.')}`,
                message: issue.message,
              });
            });
          }
          
          // Check category reference
          if (skill.categoryId && !categoryIds.has(skill.categoryId)) {
            errors.push({
              file: skillsPath,
              field: `[${idx}].categoryId`,
              message: `References non-existent category "${skill.categoryId}"`,
            });
          }
        });
      }
    } catch (err: any) {
      errors.push({ file: skillsPath, message: `Parse error: ${err.message}` });
    }
  } else {
    errors.push({ file: skillsPath, message: 'File not found' });
  }
  
  // Validate projects (software)
  const softwareDir = 'content/projects/software';
  const projectIds = new Set<string>();
  const projectSlugs = new Set<string>();
  
  if (fs.existsSync(softwareDir)) {
    const softwareFiles = fs.readdirSync(softwareDir).filter(f => f.endsWith('.json'));
    
    softwareFiles.forEach(file => {
      const filePath = path.join(softwareDir, file);
      try {
        const project = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const result = ProjectSoftwareSchema.safeParse(project);
        
        // Check duplicate slug
        if (project.slug && projectSlugs.has(project.slug)) {
          errors.push({
            file: filePath,
            field: 'slug',
            message: `Duplicate slug "${project.slug}"`,
          });
        }
        if (project.slug) projectSlugs.add(project.slug);
        if (project.id) projectIds.add(project.id);
        
        // Zod validation errors
        if (!result.success) {
          result.error.issues.forEach(issue => {
            errors.push({
              file: filePath,
              field: issue.path.join('.'),
              message: issue.message,
            });
          });
        }
        
        // Check thumbnail file exists (explicit path validation per PRD 21.3)
        if (project.thumbnail && !fs.existsSync(path.join('public', project.thumbnail))) {
          errors.push({
            file: filePath,
            field: 'thumbnail',
            message: `Referenced file does not exist: public${project.thumbnail}`,
          });
        }
      } catch (err: any) {
        errors.push({ file: filePath, message: `Parse error: ${err.message}` });
      }
    });
  }
  
  // Validate creative works
  const creativeDir = 'content/projects/creative';
  if (fs.existsSync(creativeDir)) {
    const creativeFiles = fs.readdirSync(creativeDir).filter(f => f.endsWith('.json'));
    
    creativeFiles.forEach(file => {
      const filePath = path.join(creativeDir, file);
      try {
        const creative = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const result = CreativeWorkSchema.safeParse(creative);
        
        if (!result.success) {
          result.error.issues.forEach(issue => {
            errors.push({
              file: filePath,
              field: issue.path.join('.'),
              message: issue.message,
            });
          });
        }
        
        // Check thumbnail exists
        if (creative.thumbnail && !fs.existsSync(path.join('public', creative.thumbnail))) {
          errors.push({
            file: filePath,
            field: 'thumbnail',
            message: `Referenced file does not exist: public${creative.thumbnail}`,
          });
        }
      } catch (err: any) {
        errors.push({ file: filePath, message: `Parse error: ${err.message}` });
      }
    });
  }
  
  // Validate contacts
  const contactsPath = 'content/contact/contacts.json';
  if (fs.existsSync(contactsPath)) {
    try {
      const contacts = JSON.parse(fs.readFileSync(contactsPath, 'utf-8'));
      if (!Array.isArray(contacts)) {
        errors.push({ file: contactsPath, message: 'Must be an array' });
      } else {
        contacts.forEach((contact, idx) => {
          const result = ContactSchema.safeParse(contact);
          if (!result.success) {
            result.error.issues.forEach(issue => {
              errors.push({
                file: contactsPath,
                field: `[${idx}].${issue.path.join('.')}`,
                message: issue.message,
              });
            });
          }
        });
      }
    } catch (err: any) {
      errors.push({ file: contactsPath, message: `Parse error: ${err.message}` });
    }
  } else {
    errors.push({ file: contactsPath, message: 'File not found' });
  }

  // Validate experience
  const experiencePath = 'content/experience/experience.json';
  if (fs.existsSync(experiencePath)) {
    try {
      const experiences = JSON.parse(fs.readFileSync(experiencePath, 'utf-8'));
      if (!Array.isArray(experiences)) {
        errors.push({ file: experiencePath, message: 'Must be an array' });
      } else {
        const expIds = new Set<string>();
        experiences.forEach((exp, idx) => {
          const result = ExperienceSchema.safeParse(exp);
          if (!result.success) {
            result.error.issues.forEach(issue => {
              errors.push({
                file: experiencePath,
                field: `[${idx}].${issue.path.join('.')}`,
                message: issue.message,
              });
            });
          }
          if (exp.id) {
            if (expIds.has(exp.id)) {
               errors.push({
                file: experiencePath,
                field: `[${idx}].id`,
                message: `Duplicate ID "${exp.id}"`,
              });
            }
            expIds.add(exp.id);
          }
        });
      }
    } catch (err: any) {
      errors.push({ file: experiencePath, message: `Parse error: ${err.message}` });
    }
  }
  
  // Validate site settings
  const settingsPath = 'content/site/settings.json';
  if (fs.existsSync(settingsPath)) {
    try {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      const result = SiteSettingsSchema.safeParse(settings);
      if (!result.success) {
        result.error.issues.forEach(issue => {
          errors.push({
            file: settingsPath,
            field: issue.path.join('.'),
            message: issue.message,
          });
        });
      }
    } catch (err: any) {
      errors.push({ file: settingsPath, message: `Parse error: ${err.message}` });
    }
  } else {
    errors.push({ file: settingsPath, message: 'File not found' });
  }
  
  // Output errors
  if (errors.length > 0) {
    console.error('\n❌ Validation failed:\n');
    errors.forEach(err => {
      console.error(`   ${err.file}`);
      if (err.field) console.error(`   → field "${err.field}": ${err.message}`);
      else console.error(`   → ${err.message}`);
      console.error('');
    });
    process.exit(1);
  }
  
  console.log('✅ Content validation passed');
}

validate();
