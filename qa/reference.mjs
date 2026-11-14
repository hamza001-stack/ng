import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
for(const [name,url] of [['france','https://nevie-global.com/'],['linear','https://linear.app/'],['uk-before','http://127.0.0.1:3100/']]){try{await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});await page.screenshot({path:`qa/${name}.png`});console.log(name,await page.title())}catch(e){console.log(name,e.message)}}await browser.close();
