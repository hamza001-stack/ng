import report from './lighthouse-home.json' with { type: 'json' };
console.log(JSON.stringify(Object.fromEntries(Object.entries(report.categories).map(([key, value]) => [key, Math.round(value.score * 100)]))));
console.log('LCP', report.audits['largest-contentful-paint'].displayValue, 'TBT', report.audits['total-blocking-time'].displayValue, 'CLS', report.audits['cumulative-layout-shift'].displayValue);
