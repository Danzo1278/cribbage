const C='cribbage-v10';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./favicon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x.replace(/v\d+$/,'')===C.replace(/v\d+$/,'')).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!=='GET')return;const u=new URL(q.url);if(u.origin!==location.origin)return;
  const page=q.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('.html');
  if(page){// newest version first; the saved copy only when offline
    e.respondWith(fetch(q,{cache:'no-store'}).then(r=>{if(r&&r.ok){const k=r.clone();caches.open(C).then(c=>c.put(q,k))}return r}).catch(()=>caches.match(q,{ignoreSearch:true}).then(h=>h||caches.match('./index.html'))));return}
  e.respondWith(caches.match(q,{ignoreSearch:true}).then(h=>h||fetch(q).then(r=>{if(r&&r.ok){const k=r.clone();caches.open(C).then(c=>c.put(q,k))}return r})))});
