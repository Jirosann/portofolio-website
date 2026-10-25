import { Container } from '@/components/layout/Container';
import type { Contact } from '@/types';
import { getContactUrl } from '@/lib/content/contact';
import { cookies } from 'next/headers';
import { dictionaries, resolveLocale } from '@/lib/i18n';
import { delightCopy } from '@/lib/delight/copy';

interface FooterProps {
  contacts: Contact[];
}

// Footer minimal (sesi 9): nama, peran (sama dengan hero), tahun, tautan utama.
const footerTypes: Contact['type'][] = ['email', 'linkedin', 'github', 'resume'];

export async function Footer({ contacts }: FooterProps) {
  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);
  const t = dictionaries[lang];
  const currentYear = new Date().getFullYear();
  const links = contacts.filter((c) => footerTypes.includes(c.type));

  return (
    <footer className="py-8 border-t border-border">
      <Container>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
          <p className="text-sm text-[var(--color-text-secondary)]">
            <span className="font-semibold text-[var(--color-text)]">Muhammad Nabil Al Qadri</span>
            {' · '}
            {t.hero.position}
            {' · '}
            <span className="whitespace-nowrap">© {currentYear}</span>
          </p>

          {links.length > 0 && (
            <ul className="flex flex-wrap gap-x-5">
              {links.map((contact) => {
                const external = contact.type === 'linkedin' || contact.type === 'github';
                return (
                  <li key={contact.type}>
                    <a
                      href={getContactUrl(contact)}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noopener noreferrer' : undefined}
                      download={contact.type === 'resume' ? 'MUHAMMAD NABIL AL QADRI - CV.pdf' : undefined}
                      className="footer-link"
                    >
                      {contact.label}
                      {external && <span className="sr-only"> {t.contactLabel.opensInNewTab}</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <p className="footer-hint mt-3">{delightCopy[lang].footerHint}</p>
      </Container>
    </footer>
  );
}
