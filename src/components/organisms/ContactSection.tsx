import { Container } from '@/components/layout/Container';
import { getContactUrl } from '@/lib/content/contact';
import { ScrollReveal } from '@/components/atoms/ScrollReveal';
import { AnimatedUnderline } from '@/components/atoms/AnimatedUnderline';
import { ContactIcon } from '@/components/atoms/ContactIcon';
import type { Contact } from '@/types';
import { cookies } from 'next/headers';
import { dictionaries, resolveLocale } from '@/lib/i18n';

interface ContactSectionProps {
  contacts: Contact[];
}

const contactLabels: Record<Contact['type'], string> = {
  email: 'Email',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  resume: 'CV',
};

export async function ContactSection({ contacts }: ContactSectionProps) {
  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);
  const t = dictionaries[lang];

  if (contacts.length === 0) return null;

  const emailContact = contacts.find((c) => c.type === 'email');

  return (
    <section id="contact" className="py-16 md:py-24 border-t border-border content-visibility-auto">
      <Container>
        <ScrollReveal>
          <div 
            className="group relative p-8 md:p-12 rounded-[2rem] overflow-hidden transition-[translate,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-none"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              borderWidth: '1px',
            }}
          >
            {/* Glowing orb behind text */}
            <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full scale-150 opacity-0 group-hover:opacity-[0.12] transition-opacity duration-700 pointer-events-none"
                 style={{ background: 'radial-gradient(circle closest-side at center, var(--color-highlight) 0%, transparent 100%)' }} />
            
            <div className="relative z-10">
              <div className="max-w-2xl mb-16">
                <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter" style={{ color: 'var(--color-text)' }}>
                  {t.contact.title}
                </h2>
                <AnimatedUnderline className="w-16 h-1 rounded-full mb-6 bg-accent dark:bg-highlight" />
                <p className="text-lg md:text-xl font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  {t.contact.description}
                </p>
              </div>

              {/* Email as primary CTA */}
          {emailContact && (
            <a
              href={getContactUrl(emailContact)}
              className="contact-email-cta focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-lg"
              id="contact-email-cta"
            >
              <span className="contact-email-cta-icon" aria-hidden="true">✉</span>
              <span>{emailContact.value}</span>
            </a>
          )}

          {/* Other contact channels */}
          <div className="contact-links-grid" role="group" aria-label="Contact channels">
            {contacts
              .filter((c) => c.type !== 'email')
              .map((contact) => (
                <a
                  key={contact.type}
                  href={getContactUrl(contact)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={contact.type === 'resume' ? "MUHAMMAD NABIL AL QADRI - CV.pdf" : undefined}
                  className="contact-link focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-xl"
                  id={`contact-${contact.type}`}
                >
                  <span className="contact-link-icon" aria-hidden="true">
                    <ContactIcon type={contact.type} />
                  </span>
                  <div className="contact-link-info">
                    <span className="contact-link-type">{contactLabels[contact.type]}</span>
                    <span className="contact-link-value">{contact.type === 'resume' ? t.contact.downloadPdf : contact.value}</span>
                  </div>
                  <span className="sr-only">{t.contactLabel.opensInNewTab}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </Container>
  </section>
  );
}
