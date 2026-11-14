'use client';
import Link from 'next/link';
import { useState } from 'react';

import { ArrowUpRight, PackageOpen, GraduationCap } from 'lucide-react';
import { usePlatform } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { courses } from '@/lib/catalogue';
const tabs = [
  ['Overview', 'dashboard'],
  ['Profile', 'my-account'],
  ['Orders', 'orders'],
  ['Downloads', 'downloads'],
  ['Academy', 'academy'],
  ['Certificates', 'certificates'],
  ['Invoices', 'invoices'],
  ['Subscriptions', 'subscriptions'],
  ['Support', 'support'],
  ['Settings', 'settings'],
];
export function Account({ page }: { page: string }) {
  const { state } = usePlatform();

  const [saved, setSaved] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  return (
    <div className="account-layout">
      <nav className="account-nav" aria-label="Account navigation">
        <span className="account-label">YOUR NEVIE WORKSPACE</span>
        {tabs.map(([label, slug]) => (
          <Link
            className={page === slug ? 'active' : ''}
            href={'/' + slug}
            key={slug}
            aria-current={page === slug ? 'page' : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div>
        <div className="notice">
          Account preview · No authenticated account is connected. Learning and
          saved products are local to this browser.
        </div>
        {page === 'subscriptions' ? (
          <>
            <div className="workspace-intro">
              <div>
                <span className="eyebrow">FLEXIBLE BY DESIGN</span>
                <h2>Your ongoing services, together.</h2>
                <p>
                  Recurring products and managed services will appear here when
                  subscriptions become available.
                </p>
              </div>
            </div>
            <div className="subscription-options">
              <div className="card">
                <span className="badge">PLANNED</span>
                <h3>Digital product subscriptions</h3>
                <p>
                  One place to review future plans, renewal dates, licences and
                  billing preferences.
                </p>
                <Link href="/marketplace" className="text-link">
                  Explore products <ArrowUpRight size={16} />
                </Link>
              </div>
              <div className="card">
                <span className="badge">TAILORED ENGAGEMENTS</span>
                <h3>Ongoing service partnerships</h3>
                <p>
                  Discuss maintenance, product improvements and operational
                  support built around your needs.
                </p>
                <Link href="/contact" className="text-link">
                  Discuss an engagement <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </>
        ) : page === 'dashboard' ? (
          <>
            <div className="workspace-intro">
              <div>
                <span className="eyebrow">YOUR NEXT CHAPTER</span>
                <h2>Welcome to your workspace.</h2>
                <p>
                  Pick up your learning, revisit saved products and plan your
                  next step.
                </p>
              </div>
            </div>
            <div className="card-grid">
              {[
                ['Saved products', state.wishlist.length, 'wishlist'],
                ['Items in bag', state.cart.length, 'cart'],
                [
                  'Lessons completed',
                  Object.values(state.progress).reduce(
                    (n, v) => n + v.length,
                    0,
                  ),
                  'academy',
                ],
              ].map(([t, n, href]) => (
                <Link href={'/' + href} className="card" key={t}>
                  <span className="subtle">{t}</span>
                  <h2 style={{ margin: '15px 0' }}>{n}</h2>
                  <ArrowUpRight size={18} />
                </Link>
              ))}
            </div>
            <h2 style={{ fontSize: '1.6rem', marginTop: 40 }}>
              Continue learning
            </h2>
            {courses.map((c) => (
              <Link
                href={'/academy/' + c.id}
                className="feature-row"
                key={c.id}
              >
                <div>
                  <h3>{c.title}</h3>
                  <span>
                    {(state.progress[c.id] || []).length} / {c.lessons.length}{' '}
                    completed
                  </span>
                </div>
                <GraduationCap size={22} />
              </Link>
            ))}
          </>
        ) : page === 'my-account' ? (
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              setSaved(true);
            }}
          >
            <h2>Profile preview</h2>
            <p>
              Try the profile form. Changes remain in this page and are not
              saved to an account.
            </p>
            <div className="field">
              <label htmlFor="profile-name">Full name</label>
              <input
                id="profile-name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
              />
            </div>
            <div className="field">
              <label htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSaved(false);
                }}
              />
            </div>
            <Button>Preview changes</Button>
            {saved && (
              <p role="status" className="success">
                Profile preview updated for this page.
              </p>
            )}
          </form>
        ) : page === 'settings' ? (
          <div className="card">
            <h2>Privacy & preferences</h2>
            <p>
              The preview stores your bag, wishlist and learning progress on
              this device. No analytics or advertising cookies are enabled.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem('nevie-preview-v1');
                window.location.reload();
              }}
            >
              Clear preview data
            </Button>
          </div>
        ) : (
          <div className="empty">
            <PackageOpen size={32} />
            <h2>
              {page === 'certificates'
                ? 'Your learning deserves recognition.'
                : `No ${page.replaceAll('-', ' ')} yet`}
            </h2>
            <p>
              {page === 'certificates'
                ? 'Verified certificates will appear after enrolment, assessment and identity checks are connected.'
                : 'This area will show your records once secure accounts and the relevant service are connected.'}
            </p>
            <Button asChild variant="outline">
              <Link
                href={page === 'certificates' ? '/academy' : '/marketplace'}
              >
                Explore{' '}
                {page === 'certificates' ? 'the academy' : 'the marketplace'}{' '}
                <ArrowUpRight size={17} />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
