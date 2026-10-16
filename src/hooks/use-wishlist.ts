'use client'

import { useState, useEffect } from 'react'

const WISHLIST_STORAGE_KEY = 'unique-studios-wishlist'

function readStoredWishlist(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY)
    return savedWishlist ? (JSON.parse(savedWishlist) as string[]) : []
  } catch {
    return []
  }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setWishlist(readStoredWishlist())
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist))
    }
  }, [wishlist, mounted])

  const addToWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev
      }
      return [...prev, productId]
    })
  }

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((id) => id !== productId))
  }

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId)
  }

  const clearWishlist = () => {
    setWishlist([])
  }

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount: wishlist.length,
    mounted,
  }
}
