import { AuthPage } from '@/features/auth-page';
import { metadata as makeMetadata } from '@/lib/seo';

export const metadata = makeMetadata(
  'Sign in',
  'Sign in to your NEVIE-GLOBAL UK workspace for products, orders and learning.',
  '/sign-in',
  true,
);

export default function SignInPage() {
  return <AuthPage mode="signin" />;
}
