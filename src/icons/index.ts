import {
  Golang, NodeJS, PostgreSQL, Git, Docker,
  HTML5, CSS3, Sass, TailwindCSS, JavaScript, Nextjs,
  Python, Java, SpringBoot, FastAPI,
  MongoDB,
  GitHub,
  Vitest, Playwright, Pytest, JUnit,
  Linux, GNUBash, Jenkins,
  Kotlin, Swift,
  TensorFlow, Scikitlearn,
  OpenAPI, Figma,
  ReactIcon as React, TypeScript
} from './TechIcons';

export const icons: Record<string, React.ComponentType<{ className?: string, style?: React.CSSProperties }>> = {
  // Frontend
  React,
  TypeScript,
  HTML5,
  CSS3,
  Sass,
  TailwindCSS,
  JavaScript,
  Nextjs,

  // Backend
  Golang,
  Nodejs: NodeJS,
  NodeJS,
  Python,
  Java,
  SpringBoot,
  FastAPI,

  // Database
  PostgreSQL,
  MongoDB,

  // Version Control
  Git,
  GitHub,

  // Testing
  Vitest,
  Playwright,
  Pytest,
  JUnit,

  // DevOps
  Linux,
  GNUBash,
  Jenkins,
  Docker,

  // Mobile
  Kotlin,
  Swift,

  // AI/ML
  TensorFlow,
  Scikitlearn,

  // API & Security
  OpenAPI,

  // UI/UX
  Figma,
};

export function getIcon(name: string) {
  return icons[name] || null;
}
