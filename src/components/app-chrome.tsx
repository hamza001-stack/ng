'use client';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { isAppShell } from '@/lib/app-shell';

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSiteChrome = isAppShell(pathname);

  if (hideSiteChrome) {
    return (
      <main id="main" className="auth-main">
        {children}
      </main>
    );
  }

  return (
    <>
      <div className="site-chrome-slot">
        <Header />
      </div>
      <main id="main">{children}</main>
      <div className="site-chrome-slot">
        <Footer />
      </div>
    </>
  );
}
