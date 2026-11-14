import {chromium} from '@playwright/test';
const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:1440,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
for(const route of ['/','/marketplace','/marketplace/bague-aura']){const r=await p.goto('http://127.0.0.1:3100'+route,{waitUntil:'networkidle',timeout:60000});console.log(route,r?.status());}
console.log('Bague Aura',await p.getByText('Bague Aura',{exact:true}).count());console.log('EUR',await p.getByText(/149/).count());console.log('logo',await p.locator('.nevie-logo-clean').count());console.log('errors',errors);await b.close();
