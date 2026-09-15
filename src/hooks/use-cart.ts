'use client'

import { useState, useEffect } from 'react'
import { CartItem } from '@/types'

const CART_STORAGE_KEY = 'unique-studios-cart'

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    }
  }, [cart, mounted])

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
      )
      
      if (existingItem) {
        return prevCart.map((i) =>
          i.productId === item.productId && i.size === item.size && i.color === item.color
            ? { ...i, quantity: i.quantity + item.quantity, totalPrice: (i.quantity + item.quantity) * i.unitPrice }
            : i
        )
      }
      
      return [...prevCart, item]
    })
  }

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.productId === productId && item.size === size && item.color === color)
      )
    )
  }

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color)
      return
    }
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId && item.size === size && item.color === color
          ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
          : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const cartTotal = cart.reduce((total, item) => total + item.totalPrice, 0)
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0)

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    mounted,
  }
}