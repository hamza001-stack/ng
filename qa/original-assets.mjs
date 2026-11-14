import {chromium} from '@playwright/test';
const b=await chromium.launch({channel:'chrome',headless:true}); const p=await b.newPage();await p.goto('https://nevie-global.com/',{waitUntil:'domcontentloaded',timeout:60000});console.log(JSON.stringify(await p.locator('img').evaluateAll(imgs=>imgs.map(i=>({src:i.currentSrc||i.src,alt:i.alt}))),null,2));await b.close();
