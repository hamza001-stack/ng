import {chromium} from '@playwright/test';
const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:1440,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
for(const route of ['/','/marketplace','/marketplace/bague-aura','/marketplace/category/connected-jewellery']){const r=await p.goto('http://127.0.0.1:3103'+route,{waitUntil:'networkidle',timeout:60000});console.log(route,r?.status());}
await p.getByRole('button',{name:/Zoom Bague Aura/}).click();console.log('zoom',await p.getByRole('dialog',{name:/Bague Aura image/}).isVisible());await p.getByRole('button',{name:/Close Bague Aura image/}).click();console.log('errors',errors);await b.close();
