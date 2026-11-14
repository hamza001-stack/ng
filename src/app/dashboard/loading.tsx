export default function Loading() {
  return (
    <div className="acct-skel" aria-busy="true" aria-label="Loading account">
      <div className="acct-skel-line wide" />
      <div className="acct-skel-line" />
      <div className="ws-kpis">
        <div className="acct-skel-card" />
        <div className="acct-skel-card" />
        <div className="acct-skel-card" />
        <div className="acct-skel-card" />
      </div>
      <div className="ws-grid-2">
        <div className="acct-skel-card tall" />
        <div className="acct-skel-card tall" />
      </div>
    </div>
  );
}
