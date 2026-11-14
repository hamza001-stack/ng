import Link from 'next/link';
import { ArrowUpRight, Globe2 } from 'lucide-react';
import { Newsletter } from '@/features/forms';
import { InfiniteRibbon } from '@/components/ui/infinite-ribbon';
import { BrandLogo } from '@/components/brand-logo';
import { SocialLinks } from '@/components/social-links';
import { publishedContact } from '@/lib/company';
const columns = [
  [
    'Platform',
    'Marketplace',
    'Products',
    'Services',
    'Solutions',
    'Academy',
    'Pricing',
  ],
  [
    'Your workspace',
    'Dashboard',
    'My Account',
    'Orders',
    'Downloads',
    'Certificates',
    'Subscriptions',
  ],
  [
    'Company',
    'About',
    'Partners',
    'Industries',
    'Case Studies',
    'Projects',
    'Investors',
    'Contact',
  ],
  ['Resources', 'Blog', 'Documentation', 'Support', 'FAQ'],
];
export function Footer() {
  return (
    <footer className="footer"><InfiniteRibbon className="footer-motion-ribbon" duration={38} reverse>NEVIE-GLOBAL · INTELLIGENCE CONNECTED · BUILD WHAT MOVES YOU FORWARD · </InfiniteRibbon>
      <div className="footer-giant" aria-hidden="true">NEVIE</div><div className="container footer-shell">
        <section className="footer-motion-cta"><div><span className="eyebrow">NEVIE-GLOBAL / UNITED KINGDOM</span><h2>Build what moves<br />you <em>forward.</em></h2></div><Link href="/contact" className="footer-motion-button">Start a conversation <ArrowUpRight size={18} /></Link></section>
        <div className="footer-top">
          <div>
            <Link href="/" className="wordmark">
              <BrandLogo priority />
            </Link>
            <h2>Ambition, meet possibility.</h2>
            <p>
              Intelligent technology. Practical learning.
              <br />A connected platform for your next chapter.
            </p>
            <Link href="/contact" className="text-link">
              Let’s talk about your next step <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="footer-newsletter">
            <span className="eyebrow">STAY ONE STEP AHEAD</span>
            <h3>A little perspective in your inbox.</h3>
            <Newsletter />
          </div>
        </div>
        <div className="footer-grid">
          {columns.map(([title, ...items]) => (
            <div key={title}>
              <h3>{title}</h3>
              {items.map((label) => (
                <Link
                  key={label}
                  href={'/' + label.toLowerCase().replaceAll(' ', '-')}
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
          <div className="footer-contact">
            <h3>Make the connection</h3>
            <p>
              Have a project in mind?
              <br />
              Tell us what comes next.
            </p>
            <a href={`mailto:${publishedContact.email}`} className="text-link">
              {publishedContact.email} <ArrowUpRight size={15} />
            </a>
            <Link href="/contact" className="text-link">
              Contact form <ArrowUpRight size={15} />
            </Link>
            <SocialLinks />
            <span className="footer-region">
              <Globe2 size={15} /> United Kingdom · English
            </span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} NEVIE-GLOBAL UK</span>
          <div>
            {['Privacy', 'Cookies', 'Terms', 'Refunds', 'Shipping', 'GDPR', 'Legal'].map((label) => (
              <Link href={'/' + label.toLowerCase()} key={label}>
                {label}
              </Link>
            ))}
          </div>
          <span>Technology with purpose.</span>
        </div>
      </div>
    </footer>
  );
}
