import r from './lighthouse-home.json' with {type:'json'};
for(const id of ['mainthread-work-breakdown','bootup-time','unused-javascript','render-blocking-resources','uses-responsive-images','offscreen-images','uses-optimized-images','uses-text-compression','color-contrast','button-name','link-name']){const a=r.audits[id];if(a)console.log(id,a.score,a.displayValue,a.details?.items?.slice(0,8).map(x=>({url:x.url,total:x.totalTime,wasted:x.wastedBytes})));}
console.log('a11y failures',r.categories.accessibility.auditRefs.filter(x=>r.audits[x.id].score!==null&&r.audits[x.id].score<1).map(x=>[x.id,r.audits[x.id].title]));
console.log('best failures',r.categories['best-practices'].auditRefs.filter(x=>r.audits[x.id].score!==null&&r.audits[x.id].score<1).map(x=>[x.id,r.audits[x.id].title]));
