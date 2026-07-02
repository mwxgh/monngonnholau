'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export interface CartItem {
  productId: number
  sku: string
  qty: number
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  addItem: (productId: number, sku: string, qty?: number) => void
  setQty: (sku: string, qty: number) => void
  removeItem: (sku: string) => void
  replaceAll: (items: CartItem[]) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw))
    } catch {
      // ignore
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  function addItem(productId: number, sku: string, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.sku === sku)
      if (existing) {
        return prev.map((i) => (i.sku === sku ? { ...i, qty: i.qty + qty } : i))
      }
      return [...prev, { productId, sku, qty }]
    })
  }

  function setQty(sku: string, qty: number) {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.sku !== sku)
      return prev.map((i) => (i.sku === sku ? { ...i, qty } : i))
    })
  }

  function removeItem(sku: string) {
    setItems((prev) => prev.filter((i) => i.sku !== sku))
  }

  function replaceAll(next: CartItem[]) {
    setItems(next)
  }

  function clear() {
    setItems([])
  }

  const itemCount = items.reduce((s, i) => s + i.qty, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        addItem,
        setQty,
        removeItem,
        replaceAll,
        clear
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
