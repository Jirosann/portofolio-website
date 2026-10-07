import { Container } from '@/components/layout/Container';
import { getContactUrl } from '@/lib/content/contact';
import { ScrollReveal } from '@/components/atoms/ScrollReveal';
import { AnimatedUnderline } from '@/components/atoms/AnimatedUnderline';
import type { Contact } from '@/types';
import { cookies } from 'next/headers';
import { dictionaries, resolveLocale } from '@/lib/i18n';

interface ContactSectionProps {
  contacts: Contact[];
}

const contactIcons: Record<Contact['type'], React.ReactNode> = {
  email: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z"/></svg>,
  linkedin: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>,
  github: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>,
  instagram: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.203 4.361 2.626 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  whatsapp: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>,
  resume: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6zm2-8h8v2H8v-2zm0 4h8v2H8v-2z"/></svg>,
};

const contactLabels: Record<Contact['type'], string> = {
  email: 'Email',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  resume: 'Resume',
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
            className="group relative p-8 md:p-12 rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-none"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              borderWidth: '1px',
            }}
          >
            {/* Glowing orb behind text */}
            <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-[60px] pointer-events-none"
                 style={{ background: 'var(--color-highlight)' }} />
            
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
          <div className="contact-links-grid" role="list" aria-label="Contact channels">
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
                  aria-label={`${contactLabels[contact.type]} ${t.contactLabel.opensInNewTab}`}
                  role="listitem"
                  id={`contact-${contact.type}`}
                >
                  <span className="contact-link-icon" aria-hidden="true">
                    {contactIcons[contact.type]}
                  </span>
                  <div className="contact-link-info">
                    <span className="contact-link-type">{contactLabels[contact.type]}</span>
                    <span className="contact-link-value">{contact.value}</span>
                  </div>
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
