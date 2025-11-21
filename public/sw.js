// Choose a cache name
const cacheName = 'jobtrack-pwa-v1';
// List the files to precache
const precacheResources = [
  '/',
  '/dashboard',
  '/login',
  '/signup',
  '/manifest.json'
];

// When the service worker is installed, open a new cache and add all of the precache resources to it
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll(precacheResources);
  })());
});

// When a fetch request is made, try to look for a response from the cache.
// If a response is not found, fetch from the network.
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    
    // Try to get the resource from the cache
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If the resource was not in the cache, try to get it from the network
    try {
        const fetchResponse = await fetch(event.request);
        
        // Save the resource in the cache and return it
        // We can only cache responses with a 200 status code
        if (fetchResponse.status === 200) {
            await cache.put(event.request, fetchResponse.clone());
        }

        return fetchResponse;

    } catch (e) {
        // The network failed.
        return new Response("Network error happened", {
            "status" : 408,
            "headers" : {"Content-Type" : "text/plain"}
        });
    }
  })());
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== cacheName) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});
