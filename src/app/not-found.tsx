import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'This NEVIE-GLOBAL UK page is off the map. Return home to continue.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="container section empty">
      <span className="eyebrow">404 / A DIFFERENT DIRECTION</span>
      <h1>
        This page is
        <br />
        off the map.
      </h1>
      <p>Let’s get you back to what comes next.</p>
      <Button asChild>
        <Link href="/">
          Return home <ArrowRight size={16} />
        </Link>
      </Button>
    </div>
  );
}
