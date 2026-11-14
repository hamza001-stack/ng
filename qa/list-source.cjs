const fs=require('fs');const html=fs.readFileSync('qa/original-source.html','utf8');console.log((html.match(/<img[^>]+>/g)||[]).join('\n'));
