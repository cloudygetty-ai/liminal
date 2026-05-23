// LIMINAL Service Worker v1.0
const CACHE = 'liminal-v1';
const ASSETS = ['/', '/index.html', '/manifest.json', '/liminal-logo.svg'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fresh = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});

// ── Widget support ──────────────────────────────────────────
self.addEventListener('widgetinstall', e => {
  e.waitUntil(updateWidget(e.widget));
});

self.addEventListener('widgetresume', e => {
  e.waitUntil(updateWidget(e.widget));
});

self.addEventListener('widgetclick', async e => {
  const action = e.action;
  const clients = await self.clients.matchAll({ type: 'window' });
  const url = self.registration.scope + (action === 'scan' ? '?action=scan' : action === 'manual' ? '?action=manual' : '');
  if (clients.length > 0) {
    clients[0].navigate(url);
    clients[0].focus();
  } else {
    self.clients.openWindow(url);
  }
});

async function updateWidget(widget) {
  if (!widget) return;
  // Pull last scan data from IDB or storage
  const data = {
    iconUrl: self.registration.scope + 'icon-96.png',
    appUrl:  self.registration.scope,
    lastScanProbability: widget._lastProb  || '—',
    lastScanLabel:       widget._lastLabel || 'No scans yet',
    lastScanColor:       widget._lastColor || 'Accent',
    lastScanTime:        widget._lastTime  || 'Tap to start scanning',
    totalScans:          widget._totalScans || '0',
  };
  try {
    await self.widgets.updateByTag('liminal-widget', {
      template: JSON.stringify(await (await fetch('adaptive-card.json')).json()),
      data:     JSON.stringify(data),
    });
  } catch {}
}

// ── Push from app to SW to refresh widget ──────────────────
self.addEventListener('message', e => {
  if (e.data?.type === 'WIDGET_UPDATE') {
    const w = self.widgets?.getByTag('liminal-widget');
    if (w) {
      w._lastProb   = e.data.probability;
      w._lastLabel  = e.data.label;
      w._lastColor  = e.data.color;
      w._lastTime   = e.data.time;
      w._totalScans = e.data.totalScans;
      updateWidget(w);
    }
  }
});
