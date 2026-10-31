/**
 * React Hook for Push Notifications
 *
 * Handles service worker registration and push subscription.
 */

import { useEffect, useState } from 'react'

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export function usePushNotification() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window
    setIsSupported(supported)

    if (!supported) {
      console.warn('[Push] Push notifications not supported')
      return
    }

    // Check current permission
    setPermission(Notification.permission)

    // Register service worker
    registerServiceWorker()
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('[Push] Service worker registered:', registration.scope)

      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription()
      if (existingSubscription) {
        console.log('[Push] Already subscribed:', existingSubscription.endpoint)
        setSubscription(existingSubscription.toJSON() as PushSubscription)
      } else {
        console.log('[Push] No existing subscription')
      }
    } catch (error) {
      console.error('[Push] Service worker registration failed:', error)
    }
  }

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('[Push] Push notifications not supported')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('[Push] Permission request failed:', error)
      return false
    }
  }

  const subscribe = async (): Promise<PushSubscription | null> => {
    if (!isSupported) {
      console.warn('[Push] Push notifications not supported')
      return null
    }

    if (permission !== 'granted') {
      const granted = await requestPermission()
      if (!granted) {
        console.warn('[Push] Permission not granted')
        return null
      }
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const existingSubscription = await registration.pushManager.getSubscription()

      if (existingSubscription) {
        setSubscription(existingSubscription.toJSON() as PushSubscription)
        return existingSubscription.toJSON() as PushSubscription
      }

      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        console.error('[Push] VAPID public key not configured')
        return null
      }

      // Convert VAPID key to Uint8Array
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey.buffer as ArrayBuffer,
      })

      const subscriptionJson = newSubscription.toJSON() as PushSubscription
      setSubscription(subscriptionJson)

      // Save subscription to server
      await saveSubscriptionToServer(subscriptionJson)

      return subscriptionJson
    } catch (error) {
      console.error('[Push] Subscription failed:', error)
      return null
    }
  }

  const unsubscribe = async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready
      const existingSubscription = await registration.pushManager.getSubscription()

      if (existingSubscription) {
        await existingSubscription.unsubscribe()
        setSubscription(null)

        // Remove subscription from server
        await removeSubscriptionFromServer(existingSubscription.endpoint)

        return true
      }

      return false
    } catch (error) {
      console.error('[Push] Unsubscribe failed:', error)
      return false
    }
  }

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
  }
}

// Helper function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

// Save subscription to server
async function saveSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    })
    console.log('[Push] Subscription saved to server')
  } catch (error) {
    console.error('[Push] Failed to save subscription:', error)
  }
}

// Remove subscription from server
async function removeSubscriptionFromServer(endpoint: string): Promise<void> {
  try {
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint }),
    })
    console.log('[Push] Subscription removed from server')
  } catch (error) {
    console.error('[Push] Failed to remove subscription:', error)
  }
}
