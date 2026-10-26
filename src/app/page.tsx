import { Header } from '@/components/organisms/Header';
import { HeroSection } from '@/components/organisms/HeroSection';
import { AboutSection } from '@/components/organisms/AboutSection';
import { StackSection } from '@/components/organisms/StackSection';
import { FeaturedProjects } from '@/components/projects/FeaturedProjects';
import { ContactSection } from '@/components/organisms/ContactSection';
import { Footer } from '@/components/organisms/Footer';
import { ExperienceSection } from '@/components/organisms/ExperienceSection';
import { VideoSection } from '@/components/organisms/VideoSection';
import { getProfile } from '@/lib/content/profile';
import { getContacts } from '@/lib/content/contact';
import { getFeaturedProjects } from '@/lib/content/projects';
import { getExperience } from '@/lib/content/experience';
import { getVideoSection } from '@/lib/content/videos';
import { getVisibleSections } from '@/lib/content/sections';
import { videoCopy } from '@/lib/videos/copy';

import { cookies } from 'next/headers';
import { dictionaries, resolveLocale } from '@/lib/i18n';

export default async function Home() {
  const profile = getProfile();
  const contacts = getContacts();
  const featuredProjects = getFeaturedProjects();
  const experiences = getExperience();
  const videoSection = getVideoSection();

  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);
  const t = dictionaries[lang];

  // Section opsional (Experience, Video Creation) hanya ada di daftar ini bila dirender; nav dan nomor label ikut.
  const sections = getVisibleSections();
  const navLinks = sections.map((id) => ({ href: `#${id}`, label: id === 'videos' ? videoCopy[lang].nav : t.nav[id] }));

  return (
    <>
      <Header navLinks={navLinks} />
      <main className="flex-1">
        <HeroSection profile={profile} />
        <AboutSection profile={profile} />
        <FeaturedProjects projects={featuredProjects} />
        {sections.includes('experience') && <ExperienceSection experiences={experiences} />}
        {videoSection && <VideoSection data={videoSection} />}
        <StackSection projects={featuredProjects} />
        <ContactSection contacts={contacts} />
      </main>
      <Footer contacts={contacts} />
    </>
  );
}
