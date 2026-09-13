import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  sessionStorage.clear()
  localStorage.clear()
  window.history.replaceState({}, '', '/')
})

describe('CUSTOM EFFECT storefront', () => {
  it('renders the value proposition after the intro was seen', async () => {
    sessionStorage.setItem('effect-ops-intro', 'seen')
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
    render(<App />)
    expect(screen.getByText(/상품을 고르는 순간부터/)).toBeInTheDocument()
    expect(await screen.findByText('Signal No. 01')).toBeInTheDocument()
  })

  it('keeps a catalog item in the cart after closing and reopening it', async () => {
    sessionStorage.setItem('effect-ops-intro', 'seen')
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
    render(<App />)
    fireEvent.click(await screen.findByLabelText('Signal No. 01 장바구니에 담기'))
    expect(screen.getByRole('dialog', { name: '장바구니' })).toBeInTheDocument()
    expect(screen.getByText('ORDER / DRAFT')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '장바구니 01' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '닫기' }))
    fireEvent.click(screen.getByRole('button', { name: '장바구니 01' }))

    const reopenedCart = screen.getByRole('dialog', { name: '장바구니' })
    expect(within(reopenedCart).getByRole('heading', { name: 'Signal No. 01' })).toBeInTheDocument()
    expect(within(reopenedCart).getByText('SIGNAL-01 · QTY 1')).toBeInTheDocument()
  })

  it('restores the cart from browser storage', async () => {
    sessionStorage.setItem('effect-ops-intro', 'seen')
    localStorage.setItem('custom-effect-cart', JSON.stringify([{
      sku: 'SIGNAL-01',
      name: 'Signal No. 01',
      description: 'Experimental poster print',
      price: 129,
      accent: '#2d6a4f',
      image: '/assets/poster-signal.png',
      quantity: 2,
    }]))
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))

    render(<App />)

    expect(await screen.findByRole('button', { name: '장바구니 02' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '장바구니 02' }))
    expect(screen.getByText('SIGNAL-01 · QTY 2')).toBeInTheDocument()
  })
})
