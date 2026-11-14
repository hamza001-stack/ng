import r from './lighthouse-home-final.json' with {type:'json'};
for(const id of ['color-contrast','errors-in-console']){console.log(id);for(const x of r.audits[id].details?.items||[])console.log(x.node?.selector,x.node?.explanation,x.description||x.url);}
