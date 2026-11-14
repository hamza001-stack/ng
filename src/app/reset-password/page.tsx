import { ResetPasswordForm } from '@/features/auth-forms';
import { metadata as makeMetadata } from '@/lib/seo';

export const metadata = makeMetadata(
  'Set a new password',
  'Choose a new NEVIE-GLOBAL UK password.',
  '/reset-password',
  true,
);

export default function ResetPasswordPage() {
  return (
    <div className="auth-page">
      <div className="auth-form-wrap" style={{ margin: 'auto' }}>
        <h1>Set a new password</h1>
        <p>Use at least 12 characters.</p>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
