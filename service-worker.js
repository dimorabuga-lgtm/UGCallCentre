/* Base registration only. Add a versioned cache strategy after deployment requirements are defined. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
