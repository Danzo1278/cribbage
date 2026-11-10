// Checks the menus, then plays one full game against the computer with real taps on an iPhone-sized screen.
// Run:  node classic/tests/quick.js   (prints any page errors at the end)
const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext({...devices['iPhone 13'],deviceScaleFactor:2});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../index.html'));await p.waitForTimeout(600);
console.log('home buttons:',await p.$$eval('#home button',bs=>bs.map(b=>b.id+':'+b.innerText.trim()).join(' | ')));
await p.screenshot({path:require('path').resolve(__dirname,'home.png')});
await p.click('#t7');await p.waitForTimeout(200);console.log('stats:',(await p.$eval('#stats',e=>e.innerText)).replace(/\n/g,' ').slice(0,300));await p.click('#sbk');
await p.click('#t6');await p.waitForTimeout(200);console.log('settings:',(await p.$eval('#shs',e=>e.innerText)).replace(/\n/g,' '));console.log('locked themes:',await p.$$eval('#th option',o=>o.filter(x=>x.disabled).length));await p.click('#shc');
await p.click('#t4');console.log('how to:',(await p.$eval('#tut',e=>e.innerText)).slice(-80).replace(/\n/g,' '));await p.click('#tx');
// play a full quick game with real taps
await p.click('#t1');let it=0;
while(it++<3000){const st=await p.evaluate(`({ph:G.phase,t:G.turn,ov:!$('ov').hidden,ovt:$('ov').hidden?'':$('ovb').innerText.slice(0,30),sc:G.score.join()})`);
 if(st.ov){if(/win/i.test(st.ovt)){console.log('game finished:',st.sc,'| summary:',st.ovt.replace(/\n/g,' '),'| gems row:',(await p.$eval('#ovb',e=>e.innerText)).includes('gems'));break}await p.click('#oc',{timeout:3000}).catch(()=>{});continue}
 if(st.ph=='discard'){const cs=await p.$$('#table .hand:not(.opp) button.c');if(cs.length==6){await cs[0].click();await (await p.$$('#table .hand:not(.opp) button.c'))[1].click();await p.click('#go')}}
 else if(st.ph=='peg'&&st.t==0){const cs=await p.$$('#table button.c:not(:disabled)');if(cs.length)await cs[0].click().catch(()=>{})}
 else if(st.ph=='show'){const n=await p.$('#nx')||await p.$('#cl');if(n)await n.click().catch(()=>{})}
 await p.waitForTimeout(40)}
console.log('saved under crib-classic:',await p.evaluate(`!!localStorage.getItem('crib-classic')&&!localStorage.getItem('crib')`));
console.log('errors',errs);await b.close()})()
