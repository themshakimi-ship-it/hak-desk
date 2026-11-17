// HAK Client Desk: opens instantly and works offline. Pages: newest when online, saved copy when not.
const C = 'hak-v1';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(['./', 'index.html', 'config.js', 'manifest.json', 'projects.json', 'icon-192.png']).catch(() => {}))); });
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.hostname.endsWith('supabase.co')) return;
  if (u.hostname === 'cdn.jsdelivr.net' || u.hostname === 'cdnjs.cloudflare.com' || u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com' || u.hostname.startsWith('reelly-backend')) {
    e.respondWith(caches.open(C).then(async c => { const m = await c.match(r); if (m) return m; const n = await fetch(r); if (n.ok || n.type === 'opaque') c.put(r, n.clone()); return n; }));
    return;
  }
  if (u.origin === location.origin) {
    const key = u.origin + u.pathname;
    e.respondWith(fetch(r).then(n => { if (n.ok) { const cl = n.clone(); caches.open(C).then(c => c.put(key, cl)); } return n; }).catch(() => caches.match(key).then(m => m || caches.match('index.html'))));
  }
});
self.addEventListener('push', e => {
  let d = {}; try { d = e.data.json(); } catch (x) { d = {body:e.data ? e.data.text() : ''}; }
  e.waitUntil(self.registration.showNotification(d.title || 'HAK Client Desk', {body:d.body || '', icon:'icon-192.png', badge:'icon-192.png', data:{url:d.url || './#now'}}));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window', includeUncontrolled:true}).then(ws => { for (const w of ws) { if ('focus' in w) { w.navigate(e.notification.data.url); return w.focus(); } } return clients.openWindow(e.notification.data.url); }));
});
