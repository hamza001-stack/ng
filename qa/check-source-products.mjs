import {chromium} from '@playwright/test';
const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:1440,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
for(const route of ['/','/marketplace','/marketplace/bague-aura','/marketplace/bracelet-weave']){const r=await p.goto('http://127.0.0.1:3100'+route,{waitUntil:'networkidle',timeout:60000});console.log(route,r?.status(),await p.title());}
console.log('actual products',await p.locator('text=Bague Aura').count(),await p.locator('text=€149').count());console.log('clean logo',await p.locator('.nevie-logo-clean').count());console.log('errors',errors);await p.screenshot({path:'qa/nevie-source-products.png'});await b.close();
