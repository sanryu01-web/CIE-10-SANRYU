const V='cie10-v3', SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
async function range(req,res){
  const m=/bytes=(\d*)-(\d*)/.exec(req.headers.get('range')||''); if(!m) return res;
  const buf=await res.arrayBuffer(), n=buf.byteLength;
  let a=m[1]?+m[1]:n-(+m[2]), b=m[1]&&m[2]?Math.min(+m[2],n-1):n-1;
  return new Response(buf.slice(a,b+1),{status:206,headers:{'Content-Type':res.headers.get('Content-Type')||'application/pdf','Content-Range':`bytes ${a}-${b}/${n}`,'Content-Length':b-a+1}});
}
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url); if(u.origin!==location.origin) return;
  if(u.pathname.includes('/Fuentes/')){
    e.respondWith((async()=>{
      const c=await caches.open(V); let hit=await c.match(u.pathname);
      if(!hit){ try{ const res=await fetch(u.pathname); if(res.ok) await c.put(u.pathname,res.clone()); hit=res; }catch(_){ return new Response('Sin conexión: abre este archivo una vez con Internet para guardarlo.',{status:503}); } }
      return range(r,hit);
    })()); return;
  }
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(h=>h||fetch(r)));
});
