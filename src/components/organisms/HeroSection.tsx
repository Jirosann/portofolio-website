import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { HeroClient } from './HeroClient';
import type { Profile } from '@/types';

interface HeroSectionProps {
  profile: Profile;
}

export function HeroSection({ profile }: HeroSectionProps) {
  return (
    <Section className="pt-24 md:pt-36 pb-16 md:pb-24">
      <Container>
        <HeroClient profile={profile} />
      </Container>
    </Section>
  );
}
