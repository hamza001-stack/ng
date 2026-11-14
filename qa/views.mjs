import sharp from 'sharp';
for(const n of ['home','marketplace','academy','about']){await sharp(`qa/refined-${n}.png`).extract({left:0,top:0,width:1440,height:1000}).jpeg({quality:75}).toFile(`qa/view-${n}.jpg`)}
