import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

afterEach(() => {
  vi.restoreAllMocks()
  sessionStorage.clear()
  window.history.replaceState({}, '', '/')
})

describe('EFFECT/OPS storefront', () => {
  it('renders the value proposition after the intro was seen', async () => {
    sessionStorage.setItem('effect-ops-intro', 'seen')
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
    render(<App />)
    expect(screen.getByText(/Design the/)).toBeInTheDocument()
    expect(await screen.findByText('Signal No. 01')).toBeInTheDocument()
  })

  it('adds a catalog item to the cart', async () => {
    sessionStorage.setItem('effect-ops-intro', 'seen')
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
    render(<App />)
    fireEvent.click(await screen.findByLabelText('Signal No. 01 장바구니에 담기'))
    expect(screen.getByRole('dialog', { name: '장바구니' })).toBeInTheDocument()
    expect(screen.getByText('ORDER / DRAFT')).toBeInTheDocument()
  })
})

