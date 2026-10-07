import { Header } from '@/components/organisms/Header';
import { HeroSection } from '@/components/organisms/HeroSection';
import { AboutSection } from '@/components/organisms/AboutSection';
import { SkillsBentoGrid } from '@/components/organisms/SkillsBentoGrid';
import { GitHubHeatmap } from '@/components/organisms/GitHubHeatmap';
import { FeaturedProjects } from '@/components/projects/FeaturedProjects';
import { ContactSection } from '@/components/organisms/ContactSection';
import { Footer } from '@/components/organisms/Footer';
import { ExperienceSection } from '@/components/organisms/ExperienceSection';
import { getProfile } from '@/lib/content/profile';
import { getSiteSettings } from '@/lib/content/site';
import { getContacts } from '@/lib/content/contact';
import { getFeaturedProjects } from '@/lib/content/projects';
import { getExperience } from '@/lib/content/experience';
import { getGitHubContributions } from '@/lib/content/github';

import { cookies } from 'next/headers';
import { dictionaries, resolveLocale } from '@/lib/i18n';

export default async function Home() {
  const profile = getProfile();
  const settings = getSiteSettings();
  const contacts = getContacts();
  const featuredProjects = getFeaturedProjects();
  const experiences = getExperience();
  const githubData = await getGitHubContributions();
  
  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);
  const t = dictionaries[lang];
  
  const hasExperience = experiences.some(exp => exp.visible);

  const navLinks = [
    { href: '#about', label: t.nav.about },
    ...(hasExperience ? [{ href: '#experience', label: t.nav.experience }] : []),
    { href: '#skills', label: t.nav.skills },
    { href: '#projects', label: t.nav.projects },
    { href: '#contact', label: t.nav.contact },
  ];

  return (
    <>
      <Header navLinks={navLinks} />
      <main className="flex-1">
        <HeroSection profile={profile} />
        <AboutSection profile={profile} />
        {hasExperience && <ExperienceSection experiences={experiences} />}
        <SkillsBentoGrid />
        {githubData && <GitHubHeatmap data={githubData} />}
        <FeaturedProjects projects={featuredProjects} />
        <ContactSection contacts={contacts} />
      </main>
      <Footer settings={settings} contacts={contacts} />
    </>
  );
}
