import { useTranslation } from "@/components/providers/LanguageProvider";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { TechTag } from "@/components/atoms/TechTag";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import type { ProjectSoftware } from "@/types";

interface ProjectCardProps {
  project: ProjectSoftware;
  className?: string;
  isHero?: boolean;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const { t } = useTranslation();
  const showDemoLink = !!project.demoUrl;
  const showRepoLink = project.repoVisibility === "public" && !!project.repoUrl;
  const isPrivateRepo = project.repoVisibility === "private";

  return (
    <article
      className={cn(
        "project-card bg-[rgb(var(--bg-card)/0.65)] backdrop-blur-md border border-[var(--border-color)] rounded-2xl flex flex-col h-full overflow-hidden transition-all duration-300 hover:border-[var(--color-highlight)] hover:shadow-[0_8px_30px_color-mix(in_srgb,var(--color-highlight)_15%,transparent)]",
        className,
      )}
      aria-label={project.title}
    >
      {/* Thumbnail with optional hover insight overlay */}
      <div className="project-card-thumbnail-wrapper">
        <Link
          href={`/projects/${project.slug}`}
          className="project-card-thumbnail-link focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          aria-label={`View ${project.title} case study`}
          tabIndex={0}
        >
          <Image
            src={project.thumbnail}
            alt={project.thumbnailAlt}
            className="project-card-thumbnail object-cover"
            width={800}
            height={450}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
          {/* Hover insight overlay (slide-up on hover/focus-within) */}
          {project.techInsight && (
            <div className="project-card-insight" aria-hidden="true">
              <p className="project-card-insight-text">{project.techInsight}</p>
            </div>
          )}
        </Link>
      </div>

      {/* Card body */}
      <div className="project-card-body">
        <div className="project-card-header">
          <Link
            href={`/projects/${project.slug}`}
            className="project-card-title-link focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          >
            <h3 className="project-card-title">{project.title}</h3>
          </Link>
          <StatusBadge status={project.projectStatus} />
        </div>

        <p className="project-card-summary">{project.summary}</p>

        <p className="project-card-role">
          <span className="sr-only">Role: </span>
          {project.role}
        </p>

        {/* Technologies */}
        <div
          className="project-card-tech"
          role="list"
          aria-label="Technologies used"
        >
          {project.technologies.map((tech) => (
            <TechTag key={tech} label={tech} role="listitem" />
          ))}
        </div>

        {/* Links */}
        <div className="project-card-links">
          <Link
            href={`/projects/${project.slug}`}
            className="project-card-link project-card-link--primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          >
            View Case Study
          </Link>
          {showDemoLink && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card-link project-card-link--secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
              aria-label={`${t.projectDetail.liveDemoFor} ${project.title} ${t.projectDetail.opensInNewTab}`}
            >
              {t.projectDetail.liveDemo}
            </a>
          )}
          {showRepoLink && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card-link project-card-link--secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
              aria-label={`${t.projectDetail.repositoryFor} ${project.title} ${t.projectDetail.opensInNewTab}`}
            >
              {t.projectDetail.repository}
            </a>
          )}
          {isPrivateRepo && (
            <span
              className="project-card-private-badge"
              aria-label="Private repository"
            >
              🔒 Private Repository
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
