export type Product = {
  sku: string
  name: string
  description: string
  price: number
  accent: string
  image: string
}

export type CartItem = Product & { quantity: number }

export type PlatformStatus = {
  status: string
  services: Array<{ name: string; status: string; detail: string }>
}

export type OrderResponse = {
  orderId: string
  status: string
  total: number
  createdAt: string
}

