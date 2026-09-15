'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { DashboardStats, Order } from '@/types'

const DEFAULT_INTERVAL_MS = 10000

interface LiveOrdersResult {
  orders: Order[]
  total: number
  /** Ids that arrived after the page was opened (for highlight + banner). */
  newOrderIds: string[]
  lastUpdated: Date | null
  unauthorized: boolean
  refresh: () => void
  dismissNew: () => void
}

// Polls GET /api/admin/orders and tracks orders that arrive after first load.
// Polling keeps it simple and dependency-free; a WebSocket/push channel can
// replace the interval later without changing the components.
export function useLiveOrders(limit = 50, intervalMs = DEFAULT_INTERVAL_MS): LiveOrdersResult {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [newOrderIds, setNewOrderIds] = useState<string[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [unauthorized, setUnauthorized] = useState(false)
  const knownIds = useRef<Set<string> | null>(null)

  const fetchOrders = useCallback(
    async (isFirst: boolean) => {
      try {
        const response = await fetch(`/api/admin/orders?limit=${limit}`)
        if (response.status === 401) {
          setUnauthorized(true)
          return
        }
        if (!response.ok) return
        const data = await response.json()
        const incoming: Order[] = Array.isArray(data.orders) ? data.orders : []

        if (knownIds.current === null) {
          // First load: baseline, no "new" banner for existing orders.
          knownIds.current = new Set(incoming.map((o) => o.id))
        } else {
          const fresh = incoming.filter((o) => !knownIds.current!.has(o.id))
          if (fresh.length > 0) {
            knownIds.current = new Set(incoming.map((o) => o.id))
            setNewOrderIds((prev) => [
              ...fresh.map((o) => o.id),
              ...prev.filter((id) => fresh.some((o) => o.id === id) === false),
            ])
          }
        }

        setOrders(incoming)
        setTotal(typeof data.total === 'number' ? data.total : incoming.length)
        setLastUpdated(new Date())
      } catch (error) {
        console.error('Error polling orders:', error)
      }
    },
    [limit]
  )

  useEffect(() => {
    let cancelled = false
    fetchOrders(true)
    const timer = setInterval(() => {
      if (!cancelled) fetchOrders(false)
    }, intervalMs)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [fetchOrders, intervalMs])

  const dismissNew = useCallback(() => setNewOrderIds([]), [])

  return {
    orders,
    total,
    newOrderIds,
    lastUpdated,
    unauthorized,
    refresh: () => fetchOrders(false),
    dismissNew,
  }
}

interface LiveStatsResult {
  stats: DashboardStats | null
  recentOrders: Order[]
  newOrderIds: string[]
  lastUpdated: Date | null
  unauthorized: boolean
  dismissNew: () => void
}

// Polls GET /api/admin/stats (stat cards + recent orders) for the dashboard.
export function useLiveStats(limit = 5, intervalMs = DEFAULT_INTERVAL_MS): LiveStatsResult {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [newOrderIds, setNewOrderIds] = useState<string[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [unauthorized, setUnauthorized] = useState(false)
  const knownIds = useRef<Set<string> | null>(null)

  const fetchStats = useCallback(
    async (isFirst: boolean) => {
      try {
        const response = await fetch(`/api/admin/stats?limit=${limit}`)
        if (response.status === 401) {
          setUnauthorized(true)
          return
        }
        if (!response.ok) return
        const data = await response.json()
        const incoming: Order[] = Array.isArray(data.recentOrders) ? data.recentOrders : []

        if (knownIds.current === null) {
          knownIds.current = new Set(incoming.map((o) => o.id))
        } else {
          const fresh = incoming.filter((o) => !knownIds.current!.has(o.id))
          if (fresh.length > 0) {
            knownIds.current = new Set(incoming.map((o) => o.id))
            setNewOrderIds((prev) => [
              ...fresh.map((o) => o.id),
              ...prev.filter((id) => !fresh.some((o) => o.id === id)),
            ])
          }
        }

        if (data.stats) setStats(data.stats)
        setRecentOrders(incoming)
        setLastUpdated(new Date())
      } catch (error) {
        console.error('Error polling stats:', error)
      }
    },
    [limit]
  )

  useEffect(() => {
    let cancelled = false
    fetchStats(true)
    const timer = setInterval(() => {
      if (!cancelled) fetchStats(false)
    }, intervalMs)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [fetchStats, intervalMs])

  const dismissNew = useCallback(() => setNewOrderIds([]), [])

  return { stats, recentOrders, newOrderIds, lastUpdated, unauthorized, dismissNew }
}
