export function orderRef(id: string, createdAt?: string | Date) {
  const year = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
  return `NG-${year}-${id.slice(-6).toUpperCase()}`;
}

export function humanDate(value: string | Date) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function humanDateTime(value: string | Date) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function growthLabel(current: number, previous: number) {
  if (previous === 0 && current === 0) return { text: 'No previous data', tone: 'flat' as const };
  if (previous === 0) return { text: 'New', tone: 'new' as const };
  const pct = Math.round(((current - previous) / previous) * 1000) / 10;
  return {
    text: `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct)}% vs prior 14 days`,
    tone: pct >= 0 ? ('up' as const) : ('down' as const),
  };
}

export function quoteStage(status: string) {
  if (status === 'NEW') return 'New';
  if (status === 'QUALIFIED') return 'Qualified';
  if (status === 'WON') return 'Won';
  if (status === 'LOST') return 'Lost';
  return status;
}
