import r from './lighthouse-home.json' with {type:'json'};
for(const id of ['color-contrast','link-in-text-block','errors-in-console']){const a=r.audits[id];console.log('\n',id);for(const item of a.details?.items||[])console.log(item.node?.selector,item.node?.snippet,item.node?.explanation,item.description||item.url);}
