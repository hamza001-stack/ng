import { ForgotPasswordForm } from '@/features/auth-forms';
import { metadata as makeMetadata } from '@/lib/seo';

export const metadata = makeMetadata(
  'Forgot password',
  'Reset your NEVIE-GLOBAL UK password.',
  '/forgot-password',
  true,
);

export default function ForgotPasswordPage() {
  return (
    <div className="auth-page">
      <div className="auth-form-wrap" style={{ margin: 'auto' }}>
        <h1>Reset password</h1>
        <p>We will email a time-limited link if the account exists.</p>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
