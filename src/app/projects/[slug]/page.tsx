import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/organisms/Header';
import { Footer } from '@/components/organisms/Footer';
import { TechTag } from '@/components/atoms/TechTag';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { getProjectBySlug, getAllProjectSlugs } from '@/lib/content/projects';
import { getSiteSettings } from '@/lib/content/site';
import { getContacts } from '@/lib/content/contact';
import { getExperience } from '@/lib/content/experience';
import { compileMDX } from '@/lib/mdx/compileMDX';
import { cookies } from 'next/headers';
import { dictionaries, resolveLocale } from '@/lib/i18n';

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return { title: 'Project Not Found' };
  }


  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: [project.thumbnail],
      type: 'article',
    },
    alternates: {
      canonical: `/projects/${slug}`,
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const settings = getSiteSettings();
  const contacts = getContacts();
  
  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);
  const t = dictionaries[lang];

  // Compile MDX content (includes Mermaid diagram injection)
  let mdxContent: React.ReactNode = null;
  if (project.mdxPath) {
    try {
      mdxContent = await compileMDX(project.mdxPath, project);
    } catch (error) {
      console.error(`Failed to compile MDX for ${slug}:`, error);
    }
  }

  const showDemoLink = !!project.demoUrl;
  const showRepoLink = project.repoVisibility === 'public' && !!project.repoUrl;
  const isPrivateRepo = project.repoVisibility === 'private';

  const experiences = getExperience();
  const hasExperience = experiences.some(exp => exp.visible);

  const navLinks = [
    { href: '/#about', label: t.nav.about },
    { href: '/#skills', label: t.nav.skills },
    ...(hasExperience ? [{ href: '/#experience', label: t.nav.experience }] : []),
    { href: '/#projects', label: t.nav.projects },
    { href: '/#contact', label: t.nav.contact },
  ];

  return (
    <>
      <Header navLinks={navLinks} />
      <main className="flex-1">
        <article className="project-detail">
          <div className="max-w-content mx-auto px-5 py-12 md:py-20">

            {/* Back link */}
            <Link
              href="/#projects"
              className="back-link focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
              id="back-to-projects"
            >
              {t.projectDetail.backToProjects}
            </Link>

            {/* Header */}
            <header className="project-detail-header">
              <div className="project-detail-meta">
                <StatusBadge status={project.projectStatus} />
                <span className="project-detail-role">{project.role}</span>
              </div>

              <h1 className="project-detail-title">{project.title}</h1>
              <p className="project-detail-summary">{project.summary}</p>

              {/* Technologies */}
              <div className="project-detail-tech" role="list" aria-label={t.projectDetail.technologiesUsed}>
                {project.technologies.map((tech) => (
                  <TechTag key={tech} label={tech} role="listitem" />
                ))}
              </div>

              {/* Action links */}
              <div className="project-detail-links">
                {showDemoLink && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-detail-link project-detail-link--primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
                    aria-label={`${t.projectDetail.liveDemoFor} ${project.title} ${t.projectDetail.opensInNewTab}`}
                    id="project-demo-link"
                  >
                    {t.projectDetail.viewLiveDemo}
                  </a>
                )}
                {showRepoLink && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-detail-link project-detail-link--secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
                    aria-label={`${t.projectDetail.repositoryFor} ${project.title} ${t.projectDetail.opensInNewTab}`}
                    id="project-repo-link"
                  >
                    {t.projectDetail.viewRepository}
                  </a>
                )}
                {isPrivateRepo && (
                  <span className="project-detail-private" aria-label="Private repository">
                    {t.projectDetail.privateRepository}
                  </span>
                )}
              </div>

              {/* Thumbnail */}
              {project.thumbnail && (
                <div className="project-detail-thumbnail-wrapper">
                  <img
                    src={project.thumbnail}
                    alt={project.thumbnailAlt}
                    className="project-detail-thumbnail"
                    width={1200}
                    height={675}
                    loading="eager"
                  />
                </div>
              )}
            </header>

            {/* MDX Case Study Content */}
            {mdxContent && (
              <div className="project-detail-content prose">
                {mdxContent}
              </div>
            )}
          </div>
        </article>
      </main>
      <Footer settings={settings} contacts={contacts} />
    </>
  );
}
