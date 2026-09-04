// HuntBoard Progressive Web App Service Worker
const CACHE_NAME = "huntboard-pwa-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/applications",
  "/cv",
  "/calendar",
  "/icon.svg",
  "/manifest.webmanifest",
];

// Install: Pre-cache App Shell & core resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn("PWA: Pre-cache failed for some assets:", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Stale-While-Revalidate for pages & static assets, Network-First for API
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests or browser extensions
  if (request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // API Requests: Network-first with offline fallback response
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            ok: false,
            offline: true,
            message: "Offline mode active. Using local cache.",
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 200,
          }
        );
      })
    );
    return;
  }

  // Navigation / Page requests: Stale-While-Revalidate with cached fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match("/dashboard");
          return fallback || caches.match("/");
        })
    );
    return;
  }

  // Static Assets: Cache-First with background revalidation
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to keep cache fresh
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      });
    })
  );
});

// Push Notifications: Handle incoming web push alerts
self.addEventListener("push", (event) => {
  let data = {
    title: "HuntBoard Career Alert",
    body: "You have an interview scheduled soon!",
    url: "/calendar",
  };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/icon.svg",
    badge: "/icon.svg",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/dashboard",
    },
    actions: [
      {
        action: "open",
        title: "Open HuntBoard",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification Click: Navigate to relevant application screen
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
