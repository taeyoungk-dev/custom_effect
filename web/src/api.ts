import { fallbackProducts, fallbackStatus } from './data'
import type { CartItem, OrderResponse, PlatformStatus, Product } from './types'

const jsonHeaders = { 'Content-Type': 'application/json' }

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, options)
  if (!response.ok) throw new Error(`Request failed with ${response.status}`)
  return response.json() as Promise<T>
}

export async function getProducts(): Promise<{ products: Product[]; live: boolean }> {
  try {
    const products = await request<Product[]>('/api/products')
    return { products, live: true }
  } catch {
    return { products: fallbackProducts, live: false }
  }
}

export async function getPlatformStatus(): Promise<PlatformStatus> {
  try {
    return await request<PlatformStatus>('/api/platform/status')
  } catch {
    return fallbackStatus
  }
}

export async function createOrder(items: CartItem[]): Promise<OrderResponse> {
  const payload = {
    email: 'portfolio.visitor@example.com',
    items: items.map(({ sku, quantity }) => ({ sku, quantity })),
  }

  try {
    return await request<OrderResponse>('/api/orders', {
      method: 'POST',
      headers: { ...jsonHeaders, 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify(payload),
    })
  } catch {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return {
      orderId: `demo-${crypto.randomUUID().slice(0, 8)}`,
      status: 'DEMO_ACCEPTED',
      total,
      createdAt: new Date().toISOString(),
    }
  }
}

