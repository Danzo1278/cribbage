// Two-phone online test. Uses a stand-in for PeerJS (BroadcastChannel between two pages), so it runs offline.
// Run from anywhere:  node classic/tests/online.js
const {chromium,devices}=require('playwright');const {spawn}=require('child_process');
const SRV=require('path').resolve(__dirname,'..'); // serves classic/ (index.html)
const MOCK=`(()=>{const bc=new BroadcastChannel('mockpeer');const ids=new Set();window.__drop=()=>{for(const c of window.__conns||[])c._close()};
class Ev{constructor(){this.h={}}on(e,f){(this.h[e]=this.h[e]||[]).push(f)}emit(e,...a){(this.h[e]||[]).forEach(f=>f(...a))}}
class Conn extends Ev{constructor(peer,remote,cid){super();this.peer=remote;this.open=false;this.cid=cid;this.me=peer;(window.__conns=window.__conns||[]).push(this)}
 send(d){if(!this.open)throw new Error('closed');bc.postMessage({t:'data',cid:this.cid,to:this.peer,from:this.me.id,d:JSON.parse(JSON.stringify(d))})}
 _close(){if(!this.open)return;this.open=false;bc.postMessage({t:'close',cid:this.cid,to:this.peer});this.emit('close')}close(){this._close()}}
window.Peer=class extends Ev{constructor(id,opts){super();if(typeof id=='object'){opts=id;id=null}this.id=id||('g'+Math.random().toString(36).slice(2,8));this.conns={};this.disconnected=false;this.destroyed=false;window.__peer=this;
 bc.addEventListener('message',e=>{const m=e.data;if(this.destroyed)return;
  if(m.t=='claim'&&m.id==this.id&&!m.reply)bc.postMessage({t:'claim',id:this.id,reply:true});
  if(m.to!==this.id)return;
  if(m.t=='connect'){const c=new Conn(this,m.from,m.cid);this.conns[m.cid]=c;this.emit('connection',c);setTimeout(()=>{c.open=true;c.emit('open');bc.postMessage({t:'opened',cid:m.cid,to:m.from})},30)}
  else if(m.t=='opened'){const c=this.conns[m.cid];if(c){c.open=true;c.emit('open')}}
  else if(m.t=='data'){const c=this.conns[m.cid];if(c&&c.open)c.emit('data',m.d)}
  else if(m.t=='close'){const c=this.conns[m.cid];if(c&&c.open){c.open=false;c.emit('close')}}});
 let taken=false;const h=e=>{if(e.data.t=='claim'&&e.data.id==this.id&&e.data.reply)taken=true};bc.addEventListener('message',h);if(id)bc.postMessage({t:'claim',id:this.id});
 setTimeout(()=>{bc.removeEventListener('message',h);if(taken)this.emit('error',Object.assign(new Error('taken'),{type:'unavailable-id'}));else this.emit('open',this.id)},120)}
 connect(id){const cid=Math.random().toString(36).slice(2);const c=new Conn(this,id,cid);this.conns[cid]=c;bc.postMessage({t:'connect',cid,to:id,from:this.id});return c}
 reconnect(){this.disconnected=false}destroy(){this.destroyed=true;Object.values(this.conns).forEach(c=>c._close())}}})()`;
const BOT=`(()=>{if(!$('ov').hidden){const b=$('oc')||$('mx');if(b&&/OK|Continue|Play again/.test(b.textContent)){b.click();return 'ov'}return 'ovwait'}
 if(G.phase=='discard'&&!G.dd0&&G.hands[0].length==6){G.sel=[0,1];render();$('go').click();return 'd'}
 if(G.phase=='peg'&&G.turn==0){const b=[...document.querySelectorAll('#table button.c:not(:disabled)')];if(b.length){b[0].click();return 'p'}}
 if((G.phase=='show'||G.phase=='over')){const b=$('nx')||$('again')||$('cl');if(b){b.click();return 'n'}}return 'w'})()`;
(async()=>{const srv=spawn('python3',['-m','http.server','8765','-d',SRV],{stdio:'ignore'});await new Promise(r=>setTimeout(r,800));
const b=await chromium.launch();const ctx=await b.newContext({...devices['iPhone 13']});await ctx.addInitScript(MOCK);await ctx.addInitScript('window.__nogate=1');
const H=await ctx.newPage(),J=await ctx.newPage();const errs=[];for(const [n,p] of [['host',H],['guest',J]])p.on('pageerror',e=>errs.push(n+': '+e.message));
for(const p of [H,J]){await p.goto('http://localhost:8765/');await p.waitForTimeout(400);await p.evaluate(`S.anim=false;setArt()`)}
await H.click('#t3');await H.waitForTimeout(150);console.log('menu text:',(await H.$eval('#ovb p',e=>e.textContent)).slice(0,80));
await H.click('#mh');await H.waitForTimeout(600);const code=await H.evaluate(`MP&&MP.code`);console.log('host code',code,await H.evaluate(`$('ovb').innerText.slice(0,40).replace(/\\n/g,' ')`));
// guest typo first
await J.click('#t3');await J.fill('#mc','zzzz');await J.click('#mj');await J.waitForTimeout(1200);
await J.evaluate(`window.__peer.emit('error',{type:'peer-unavailable'})`);await J.waitForTimeout(100);console.log('wrong code msg:',(await J.evaluate(`$('ovb').innerText`)).replace(/\n/g,' ').slice(0,110));
await J.evaluate(`mpStop();titleScreen()`);await J.click('#t3');await J.fill('#mc',code);await J.click('#mj');
await J.waitForTimeout(3000);
console.log('guest home hidden:',await J.evaluate(`$('home').hidden`),'host home hidden:',await H.evaluate(`$('home').hidden`));
{const before=await J.evaluate(`G.hands[0].map(c=>c.r+'/'+c.s).join(' ')`);const cs=await J.$$('#table .hand:not(.opp) button.c');await cs[0].click({timeout:3000}).catch(async()=>{await (await J.$$('#table .hand:not(.opp) button.c'))[0].click({timeout:3000})});await cs[1].click({timeout:3000}).catch(async()=>{await (await J.$$('#table .hand:not(.opp) button.c'))[1].click({timeout:3000})});await J.click('#go',{timeout:3000});await J.waitForTimeout(800);console.log('guest discarded by real taps:',await H.evaluate('G.dd1'));for(let k=0;k<40&&(await J.evaluate('G.phase'))!='peg';k++){await H.evaluate(BOT);await J.waitForTimeout(150)}const after=await J.evaluate(`G.pegHands[0].map(c=>c.r+'/'+c.s).join(' ')`);const kept=before.split(' ').slice(2).join(' ');console.log('guest order before:',before,'| in pegging:',after,'| same order:',after==kept)}
console.log('seated:',await H.evaluate(`[MP.seated,G.phase,NM[1]]`),await J.evaluate(`[MP.got,G.phase,NM[1],$('ov').hidden]`));
await J.evaluate(`equip('av','zola');equip('peg','gold')`);await H.evaluate(`equip('av','walt')`);await J.waitForTimeout(3500);
console.log('names/avatars:',JSON.stringify(await H.evaluate(`[NM[1],MP.oav,MP.opg,PC]`)),JSON.stringify(await J.evaluate(`[NM[1],MP.oav,PC]`)));
let games=0,dropped=false,steps=0;const t0=Date.now();
while(games<2&&Date.now()-t0<420000){steps++;
 for(const p of [H,J]){await p.evaluate(BOT).catch(()=>{})}
 await H.waitForTimeout(60);
 const hs=await H.evaluate(`[G.phase,G.score.join(),G.winner]`);
 if(!dropped&&hs[1]>'' && steps==120){dropped=true;await J.evaluate(`window.__drop()`);console.log('-- dropped the connection at',hs)}
 if(hs[0]=='over'&&!H.__seen){H.__seen=true;games++;console.log('game',games,'over',hs, 'guest sees',await J.evaluate(`[G.phase,G.score.join()]`))}
 if(hs[0]!='over')H.__seen=false}
const fin=await Promise.all([H,J].map(p=>p.evaluate(`[G.score.join(),G.phase,G.hands[0].length]`)));console.log('final',fin,'steps',steps);
// mirror check: guest score is host score swapped
const ms=await H.evaluate('G.score'),gs=await J.evaluate('G.score');console.log('mirror ok',ms[0]==gs[1]&&ms[1]==gs[0]);
// guest hand never visible to host: host's view of guest hand is real cards only on host side, guest view of host hand masked
console.log('guest sees host cards masked:',await J.evaluate(`(G.hands[1]||[]).every(c=>c.r==1&&c.s==0)`));
// host leaves -> guest watchdog
await J.waitForTimeout(4000);await J.evaluate(`$('oc')&&$('oc').click()`);await J.waitForTimeout(1800);await J.evaluate(`$('oc')&&$('oc').click()`);await H.evaluate(`MP.rm.leave();clearInterval(MP.hb)`);await J.waitForTimeout(12000);console.log('guest after host gone:',(await J.evaluate(`$('ov').hidden?'(no dialog)':$('ovb').innerText`)).replace(/\n/g,' ').slice(0,120));
await J.click('#mt');await J.waitForTimeout(800);console.log('takeover:',(await J.evaluate(`$('ovb').innerText`)).replace(/\n/g,' ').slice(0,60),await J.evaluate('MP&&MP.host&&MP.code'));
console.log('errors',errs);await b.close();srv.kill()})()
