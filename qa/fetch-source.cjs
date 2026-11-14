const fs=require('fs');
(async()=>{const r=await fetch('https://nevie-global.com/');const html=await r.text();fs.writeFileSync('qa/original-source.html',html);console.log(html.slice(0,180));console.log([...new Set(html.match(/https?:[^\s"'<>]+\.(?:webp|png|jpg|jpeg)(?:\?[^\s"'<>]*)?/gi))].join('\n'));})();
