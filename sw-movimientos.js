const VERSION = 'mov-v3-2026-10-08';
const CACHE = 'movimientos-ht-' + VERSION;
const EXTERNOS = [
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js',
  'https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Saira:ital,wght@1,700;1,800&display=swap'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(['./movimientos.html','./ht.css','./manifest-movimientos.json',...EXTERNOS].map(u => c.add(u).catch(()=>null))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const u = e.request.url;
  if(u.includes('/rest/v1/') || u.includes('/auth/v1/') || u.includes('/storage/v1/')) return;
  const vivo = u.includes('movimientos.html') || u.includes('ht.css');
  if(vivo){
    e.respondWith(fetch(e.request).then(res => {
      const copia = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copia)).catch(()=>{});
      return res;
    }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    const copia = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, copia)).catch(()=>{});
    return res;
  })));
});
