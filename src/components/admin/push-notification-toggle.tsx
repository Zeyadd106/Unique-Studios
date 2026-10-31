/**
 * Push Notification Toggle Component
 *
 * Allows admins to enable/disable push notifications for new orders.
 */

'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { usePushNotification } from '@/hooks/use-push-notification'

export function PushNotificationToggle() {
  const {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
  } = usePushNotification()

  const [isLoading, setIsLoading] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    setIsEnabled(!!subscription)
  }, [subscription])

  const handleToggle = async () => {
    setIsLoading(true)

    try {
      if (isEnabled) {
        // Disable notifications
        const success = await unsubscribe()
        if (success) {
          setIsEnabled(false)
        }
      } else {
        // Enable notifications
        const sub = await subscribe()
        if (sub) {
          setIsEnabled(true)
        }
      }
    } catch (error) {
      console.error('[Push] Toggle error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestPermission = async () => {
    setIsLoading(true)
    try {
      const granted = await requestPermission()
      if (granted) {
        const sub = await subscribe()
        if (sub) {
          setIsEnabled(true)
        }
      }
    } catch (error) {
      console.error('[Push] Permission request error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
        <BellOff className="h-4 w-4" />
        <span>Notifications not supported</span>
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg text-sm text-red-600">
        <BellOff className="h-4 w-4" />
        <span>Notifications blocked</span>
      </div>
    )
  }

  if (permission === 'default') {
    return (
      <button
        onClick={handleRequestPermission}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        <span>Enable Notifications</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isEnabled
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isEnabled ? (
        <Bell className="h-4 w-4" />
      ) : (
        <BellOff className="h-4 w-4" />
      )}
      <span>{isEnabled ? 'Notifications On' : 'Notifications Off'}</span>
    </button>
  )
}
