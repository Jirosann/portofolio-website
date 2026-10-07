import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import { TechTag } from "@/components/atoms/TechTag";
import type { CreativeWork } from "@/types";

interface CreativeWorkCardProps {
  work: CreativeWork;
  className?: string;
}

const typeLabel: Record<CreativeWork["type"], string> = {
  "video-editing": "Video Editing",
  "motion-graphics": "Motion Graphics",
  "photo-editing": "Photo Editing",
  other: "Creative Work",
};

export function CreativeWorkCard({ work, className }: CreativeWorkCardProps) {
  return (
    <article
      className={cn(
        "creative-card bg-[rgb(var(--bg-card)/0.65)] backdrop-blur-md border border-[var(--border-color)] rounded-2xl flex flex-col h-full overflow-hidden transition-all duration-300 hover:border-[var(--color-highlight)] hover:shadow-[0_8px_30px_color-mix(in_srgb,var(--color-highlight)_15%,transparent)]",
        className,
      )}
      aria-label={work.title}
    >
      {/* Thumbnail */}
      <div className="creative-card-thumbnail-wrapper">
        <Image
          src={work.thumbnail}
          alt={work.thumbnailAlt}
          className="creative-card-thumbnail object-cover"
          width={800}
          height={450}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
        />
        <span className="creative-card-type-badge">{typeLabel[work.type]}</span>
      </div>

      {/* Card body */}
      <div className="creative-card-body">
        <h3 className="creative-card-title">{work.title}</h3>
        <p className="creative-card-brief">{work.brief}</p>
        <p className="creative-card-contribution">{work.contribution}</p>

        {work.tools && work.tools.length > 0 && (
          <div
            className="creative-card-tools"
            role="list"
            aria-label="Tools used"
          >
            {work.tools.map((tool) => (
              <TechTag key={tool} label={tool} role="listitem" />
            ))}
          </div>
        )}

        <a
          href={work.driveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="creative-card-drive-link focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          aria-label={`View ${work.title} on Google Drive (opens in new tab)`}
        >
          View on Google Drive
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      </div>
    </article>
  );
}
