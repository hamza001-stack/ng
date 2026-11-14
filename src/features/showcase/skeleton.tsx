export function ShowcaseSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="container" aria-busy="true" aria-label="Loading">
      <div className="sx-skeleton sx-skeleton-hero" />
      <div className="sx-skeleton-grid">
        {Array.from({ length: cards }, (_, index) => (
          <div className="sx-skeleton sx-skeleton-card" key={index} />
        ))}
      </div>
    </div>
  );
}
