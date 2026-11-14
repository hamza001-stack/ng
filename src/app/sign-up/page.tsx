import { AuthPage } from '@/features/auth-page';
import { metadata as makeMetadata } from '@/lib/seo';

export const metadata = makeMetadata(
  'Create account',
  'Create a NEVIE-GLOBAL UK workspace to manage products, orders and learning.',
  '/sign-up',
  true,
);

export default function SignUpPage() {
  return <AuthPage mode="signup" />;
}
