import report from './lighthouse-home-final.json' with { type: 'json' };
console.log(JSON.stringify(Object.fromEntries(Object.entries(report.categories).map(([key, value]) => [key, Math.round(value.score * 100)]))));
console.log('LCP', report.audits['largest-contentful-paint'].displayValue, 'TBT', report.audits['total-blocking-time'].displayValue, 'CLS', report.audits['cumulative-layout-shift'].displayValue);
console.log('a11y', report.categories.accessibility.auditRefs.filter((item) => report.audits[item.id].score !== null && report.audits[item.id].score < 1).map((item) => item.id));
console.log('best', report.categories['best-practices'].auditRefs.filter((item) => report.audits[item.id].score !== null && report.audits[item.id].score < 1).map((item) => item.id));
