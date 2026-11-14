import fs from 'node:fs';import sharp from 'sharp';
const source='C:/Users/muham/.codex/generated_images/01a0a80b-9227-70f2-8dde-da9da22db0de/';
const assets={crm:'exec-d8279a36-db1a-417d-89f0-7ed69be31c32.png',academy:'exec-59eebaf5-349b-4f42-86f9-994854eff611.png',saas:'exec-fd0bbf08-4268-4780-a8ad-cb2fbc7ee68c.png'};
fs.mkdirSync('public/categories',{recursive:true});for(const [name,file] of Object.entries(assets)){await sharp(source+file).resize({width:960}).webp({quality:80}).toFile('public/categories/'+name+'.webp');}
fs.writeFileSync('public/categories/SOURCES.md','# Category art\n\nCRM, Academy and SaaS category images are original conceptual artwork generated for NEVIE-GLOBAL UK. They are category visuals, not photographs of a particular product.\n');
