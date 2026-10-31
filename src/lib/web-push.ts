/**
 * Web Push Notification Utilities
 *
 * Handles VAPID key generation and push notification sending.
 */

let webpush: any = null

// Only import web-push if VAPID keys are configured
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const privateVapidKey = process.env.VAPID_PRIVATE_KEY

if (publicVapidKey && privateVapidKey) {
  try {
    webpush = require('web-push')
    webpush.setVapidDetails(
      'mailto:info@uniquestudios.com',
      publicVapidKey,
      privateVapidKey
    )
  } catch (error) {
    console.warn('[WebPush] Failed to load web-push:', error)
  }
} else {
  console.warn('[WebPush] VAPID keys not configured. Push notifications will not work.')
}

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

/**
 * Send push notification to a subscription
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: string | object
): Promise<void> {
  try {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload)

    await webpush.sendNotification(subscription, payloadString, {
      TTL: 3600, // Time to live: 1 hour
      urgency: 'high',
    })

    console.log('[WebPush] Notification sent successfully')
  } catch (error) {
    console.error('[WebPush] Failed to send notification:', error)
    throw error
  }
}

/**
 * Send push notification to multiple subscriptions
 */
export async function sendPushNotificationToAll(
  subscriptions: PushSubscription[],
  payload: string | object
): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  for (const subscription of subscriptions) {
    try {
      await sendPushNotification(subscription, payload)
      success++
    } catch (error) {
      console.error('[WebPush] Failed to send to subscription:', error)
      failed++
    }
  }

  return { success, failed }
}

/**
 * Validate subscription object
 */
export function isValidSubscription(subscription: any): subscription is PushSubscription {
  return (
    subscription &&
    typeof subscription.endpoint === 'string' &&
    subscription.keys &&
    typeof subscription.keys.p256dh === 'string' &&
    typeof subscription.keys.auth === 'string'
  )
}
