import { Container } from '@/components/layout/Container';
import { getContactUrl } from '@/lib/content/contact';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { ContactIcon, quickContactTypes } from '@/components/atoms/ContactIcon';
import type { Contact } from '@/types';
import { cookies } from 'next/headers';
import { dictionaries, resolveLocale } from '@/lib/i18n';

interface ContactSectionProps {
  contacts: Contact[];
}

// Penutup Lab Notebook (redesign-v2 §6.5): tanpa kartu, tanpa JS client. Gaya di globals.css (.ct-*).
export async function ContactSection({ contacts }: ContactSectionProps) {
  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);
  const t = dictionaries[lang];

  if (contacts.length === 0) return null;

  const email = contacts.find((c) => c.type === 'email');
  const resume = contacts.find((c) => c.type === 'resume');
  // Kanal yang sama dengan hero, tanpa email (sudah tampil besar di atas).
  const channels = contacts.filter(
    (c) => c.type !== 'email' && (quickContactTypes as readonly string[]).includes(c.type)
  );

  // Kalimat pertama contact.description, sama dengan kartu status di hero.
  const availability = t.contact.description.split(/(?<=\.)\s/)[0];
  const [emailUser, emailDomain] = email ? email.value.split('@') : [];

  return (
    <section id="contact" className="section-y border-t border-border content-visibility-auto">
      <Container>
        <SectionHeading
          section="contact"
          label={t.nav.contact}
          title={t.contact.title}
          description={availability}
        />

        {email && (
          <a href={getContactUrl(email)} className="ct-email font-serif">
            {/* <wbr> sebelum @: di layar sempit (320) alamat pecah di sana, bukan di tengah kata */}
            {emailUser}<wbr />@{emailDomain}
          </a>
        )}

        <div className="ct-links">
          {resume && (
            <a
              href={getContactUrl(resume)}
              download="MUHAMMAD NABIL AL QADRI - CV.pdf"
              className="ct-link ct-link--cv"
            >
              <ContactIcon type="resume" className="w-4 h-4 shrink-0" />
              {t.hero.downloadCV}
            </a>
          )}

          {channels.length > 0 && (
            <ul aria-label={t.nav.contact} className="ct-channels">
              {channels.map((contact) => (
                <li key={contact.type}>
                  <a
                    href={getContactUrl(contact)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ct-link"
                  >
                    <ContactIcon type={contact.type} className="w-4 h-4 shrink-0" />
                    {contact.label}
                    <span className="sr-only"> {t.contactLabel.opensInNewTab}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}
