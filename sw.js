const CACHE='ppt-pest-os-v3';
const SHELL=['./','./index.html','./styles.css','./dist/app.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([
  self.clients.claim(),
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
])));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  if(url.pathname.startsWith('/api/')) { e.respondWith(fetch(e.request)); return; }
  if(e.request.mode==='navigate') {
    e.respondWith(fetch(e.request).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{
    if(r.ok && url.origin===self.location.origin){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
    return r;
  })));
});
