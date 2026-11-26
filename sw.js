/* Service worker: abre offline. Troque VERSION a cada atualização da ficha. */
const VERSION="ficha-v28",FILES=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  /* rede primeiro (pega atualizações), cache se estiver sem sinal */
  /* rede primeiro, mas com sinal fraco (mais de 3 s) abre do cache e atualiza em segundo plano */
  const net=fetch(e.request).then(r=>{if(r&&r.ok){const c=r.clone();caches.open(VERSION).then(x=>x.put(e.request,c))}return r});
  const fall=()=>caches.match(e.request).then(r=>r||caches.match("./index.html"));
  e.respondWith(new Promise(res=>{let done=false;const go=r=>{if(!done&&r){done=true;res(r)}};
    const tm=setTimeout(()=>fall().then(r=>r?go(r):net.then(go,()=>{})),3000);
    net.then(r=>{clearTimeout(tm);go(r)},()=>{clearTimeout(tm);fall().then(r=>go(r||Response.error()))})}));
  e.waitUntil(net.catch(()=>{}))});
