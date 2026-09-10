const BUILD='20260910-mobile1';
const CACHE='ppt-pest-os-v1.1.1-mobile1';
const SHELL=['./','./index.html',`./styles.css?v=${BUILD}`,`./dist/app.js?v=${BUILD}`,`./manifest.webmanifest?v=${BUILD}`,'./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([
  self.clients.claim(),
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
])));
async function networkFirst(request){
  try{
    const response=await fetch(request,{cache:'no-store'});
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(request,copy));}
    return response;
  }catch(err){
    return (await caches.match(request)) || (request.mode==='navigate' ? await caches.match('./index.html') : Promise.reject(err));
  }
}
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  if(url.pathname.startsWith('/api/')) { e.respondWith(fetch(e.request)); return; }
  const critical=e.request.mode==='navigate'||url.pathname.endsWith('/dist/app.js')||url.pathname.endsWith('/styles.css')||url.pathname.endsWith('/manifest.webmanifest')||url.pathname.endsWith('/index.html');
  if(critical){e.respondWith(networkFirst(e.request));return;}
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{
    if(r.ok && url.origin===self.location.origin){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
    return r;
  })));
});