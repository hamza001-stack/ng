import type { ReactNode } from 'react';
import { Roboto } from 'next/font/google';
import { AcademySubNav } from './subnav';
import '@/app/academy/academy.css';

const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--nv-roboto' });

/** Wraps every public academy page in the approved design + its sub navigation. */
export function AcademyShell({ children }: { children: ReactNode }) {
  return (
    <div className={'nv-academy ' + roboto.variable}>
      <AcademySubNav />
      {children}
    </div>
  );
}
