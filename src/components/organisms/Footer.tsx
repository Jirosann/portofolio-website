import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import type { SiteSettings, Contact } from '@/types';
import { getContactUrl } from '@/lib/content/contact';
import { cookies } from 'next/headers';
import { dictionaries, resolveLocale } from '@/lib/i18n';

interface FooterProps {
  settings: SiteSettings;
  contacts: Contact[];
}

export async function Footer({ settings, contacts }: FooterProps) {
  const cookieStore = await cookies();
  const lang = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);
  const t = dictionaries[lang];
  const currentYear = new Date().getFullYear();
  
  return (
    <footer
      className="py-12"
      style={{
        background: 'transparent',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <Container>
        <div className="space-y-6">
          {/* Currently Building Status */}
          {settings.currentlyBuilding?.enabled && (
            <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: 'var(--color-highlight)' }}
              ></span>
              <span className="text-sm">
                Currently building:{' '}
                {settings.currentlyBuilding.projectUrl ? (
                  <a
                    href={settings.currentlyBuilding.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link hover:underline focus:outline-none focus:ring-2 rounded"
                    style={{ color: 'var(--color-burgundy-accent)' }}
                  >
                    {settings.currentlyBuilding.projectName}
                  </a>
                ) : settings.currentlyBuilding.projectSlug ? (
                  <Link
                    href={`/projects/${settings.currentlyBuilding.projectSlug}`}
                    className="footer-link hover:underline focus:outline-none focus:ring-2 rounded"
                    style={{ color: 'var(--color-burgundy-accent)' }}
                  >
                    {settings.currentlyBuilding.projectName}
                  </Link>
                ) : (
                  <span style={{ color: 'var(--color-text)' }}>
                    {settings.currentlyBuilding.projectName}
                  </span>
                )}
              </span>
            </div>
          )}
          
          {/* Social Links */}
          {contacts.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {contacts.map((contact) => (
                <a
                  key={contact.type}
                  href={getContactUrl(contact)}
                  target={contact.type === 'email' ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  download={contact.type === 'resume' ? "MUHAMMAD NABIL AL QADRI - CV.pdf" : undefined}
                  className="footer-social-link transition-colors focus:outline-none focus:ring-2 rounded"
                  style={{ color: 'var(--color-text-secondary)' }}
                  aria-label={`${contact.label} ${t.contactLabel.opensInNewTab}`}
                >
                  {contact.label}
                </a>
              ))}
            </div>
          )}
          
          {/* Copyright */}
          <div className="pt-6 flex justify-between items-center" style={{ borderTop: '1px solid var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              © {currentYear} {settings.title}. {t.footer.allRightsReserved}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
