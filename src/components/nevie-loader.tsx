export function NEVIELoader({
  variant = 'page',
  progress,
  leaving = false,
}: {
  variant?: 'splash' | 'page';
  progress?: number;
  leaving?: boolean;
}) {
  return (
    <div
      className={
        'nevie-loader nevie-loader-' +
        variant +
        (leaving ? ' is-leaving' : '')
      }
      role="status"
      aria-live="polite"
      aria-label="Loading NEVIE-GLOBAL UK"
    >
      <div className="nevie-loader-glow" aria-hidden="true" />
      <div className="loader-core">
        <span className="loader-ring loader-ring-outer" />
        <span className="loader-ring loader-ring-inner" />
        <span className="loader-pulse" />
        <div className="loader-mark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.webp" alt="" width={160} height={40} />
        </div>
      </div>
      <div className="loader-copy">
        <span>NEVIE-GLOBAL / UK</span>
        <strong>Connecting intelligence.</strong>
        {typeof progress === 'number' ? (
          <>
            <div className="loader-track" aria-hidden="true">
              <i style={{ width: progress + '%' }} />
            </div>
            <small>{progress}%</small>
          </>
        ) : null}
      </div>
    </div>
  );
}
