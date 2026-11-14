import { NEVIELoader } from '@/components/nevie-loader';

export default function Loading() {
  return (
    <div className="ws-loading" role="status" aria-live="polite" aria-label="Loading admin">
      <NEVIELoader variant="page" />
      <p className="ws-hint">Loading live admin data…</p>
    </div>
  );
}
