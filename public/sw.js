/**
 * Service Worker for UNIQUE STUDIOS PWA
 *
 * Handles:
 * - Push notifications
 * - Background sync
 * - Cache management
 */

const CACHE_NAME = 'unique-studios-v1'
const urlsToCache = [
  '/',
  '/shop',
  '/admin/login',
  '/admin/dashboard',
  '/manifest.json',
]

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell')
      return cache.addAll(urlsToCache)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }
      return fetch(event.request)
    })
  )
})

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received')

  let data = {
    title: 'New Order Received',
    body: 'A new order has been placed on your store.',
    icon: '/logo-light.png',
    badge: '/logo-light.png',
    tag: 'new-order',
    url: '/admin/orders',
  }

  if (event.data) {
    try {
      const payload = event.data.json()
      data = { ...data, ...payload }
    } catch (e) {
      console.error('[SW] Failed to parse push data:', e)
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: {
      url: data.url,
    },
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Order',
        icon: '/logo-light.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/logo-light.png',
      },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click event')

  event.notification.close()

  if (event.action === 'view') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Check if a client is already open
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus()
          }
        }
        // If no client is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url)
        }
      })
    )
  }
})

// Background sync (optional - for offline order submission)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag)
  // Handle background sync for offline orders
})
