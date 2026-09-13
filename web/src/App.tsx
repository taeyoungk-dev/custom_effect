import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createOrder, getPlatformStatus, getProducts } from './api'
import type { CartItem, OrderResponse, PlatformStatus, Product } from './types'

const formatPrice = (value: number) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}).format(value)

function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return

    let frame = 0
    let targetX = -100
    let targetY = -100
    let ringX = -100
    let ringY = -100

    const render = () => {
      ringX += (targetX - ringX) * 0.16
      ringY += (targetY - ringY) * 0.16
      dot.current?.style.setProperty('transform', `translate3d(${targetX}px, ${targetY}px, 0)`)
      ring.current?.style.setProperty('transform', `translate3d(${ringX}px, ${ringY}px, 0)`)
      frame = requestAnimationFrame(render)
    }
    const move = (event: PointerEvent) => {
      targetX = event.clientX
      targetY = event.clientY
    }
    const down = () => document.body.classList.add('is-pointer-down')
    const up = () => document.body.classList.remove('is-pointer-down')
    const hover = (event: MouseEvent) => {
      const interactive = (event.target as HTMLElement).closest('a, button, [data-cursor]')
      document.body.classList.toggle('is-pointer-hover', Boolean(interactive))
    }

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.addEventListener('mouseover', hover)
    frame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.removeEventListener('mouseover', hover)
    }
  }, [])

  return <div className="cursor" aria-hidden="true"><div ref={ring} className="cursor__ring" /><div ref={dot} className="cursor__dot" /></div>
}

function Intro({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const frame = useRef(0)
  const previous = useRef(0)
  const pressing = useRef(false)

  const animate = useCallback((time: number) => {
    const delta = Math.min(time - previous.current, 40)
    previous.current = time
    setProgress((current) => {
      const next = Math.max(0, Math.min(100, current + (pressing.current ? delta / 9 : -delta / 5)))
      if (next >= 100) window.setTimeout(onComplete, 120)
      return next
    })
    frame.current = requestAnimationFrame(animate)
  }, [onComplete])

  useEffect(() => {
    previous.current = performance.now()
    frame.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame.current)
  }, [animate])

  const start = () => { pressing.current = true }
  const stop = () => { pressing.current = false }

  return (
    <div className="intro" role="dialog" aria-label="EFFECT OPS 시작 화면">
      <span className="intro__index mono">SYS.INIT / 001</span>
      <div className="intro__center">
        <p className="eyebrow eyebrow--light"><span />Interaction meets infrastructure</p>
        <button
          className="launch-button"
          style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}
          onPointerDown={start}
          onPointerUp={stop}
          onPointerLeave={stop}
          onKeyDown={(event) => { if (event.key === ' ' || event.key === 'Enter') start() }}
          onKeyUp={stop}
          aria-label="길게 눌러 프로젝트 시작"
        >
          <span className="launch-button__core"><small>{Math.round(progress)}%</small>HOLD<br />TO ENTER</span>
        </button>
        <p className="intro__hint mono">PRESS &amp; HOLD · 약 1초</p>
      </div>
      <button className="intro__skip mono" onClick={onComplete}>SKIP INTRO ↗</button>
    </div>
  )
}

function Header({ cartCount, onCart }: { cartCount: number; onCart: () => void }) {
  return (
    <header className="site-header">
      <button className="brand" onClick={() => navigate('/')} aria-label="홈으로 이동">
        <span className="brand__mark">E/</span><span>EFFECT<sup>OPS</sup></span>
      </button>
      <nav aria-label="주요 메뉴">
        <a href="#collection">Collection</a>
        <a href="#system">System</a>
        <a href="#about">About</a>
      </nav>
      <button className="cart-button" onClick={onCart}>CART <span>{String(cartCount).padStart(2, '0')}</span></button>
    </header>
  )
}

function Hero() {
  const visual = useRef<HTMLDivElement>(null)
  const onMove = (event: React.PointerEvent) => {
    if (!visual.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bounds = visual.current.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    visual.current.style.setProperty('--rx', `${y * -8}deg`)
    visual.current.style.setProperty('--ry', `${x * 10}deg`)
    visual.current.style.setProperty('--mx', `${x * 16}px`)
    visual.current.style.setProperty('--my', `${y * 16}px`)
  }

  return (
    <main className="hero">
      <div className="hero__copy">
        <p className="eyebrow"><span />Resilient commerce · Seoul, KR</p>
        <h1>Design the <em>delight.</em><br />Engineer the <strong>recovery.</strong></h1>
        <p className="hero__lede">감각적인 인터랙션 뒤에서 주문 데이터가 안전하게 흐르고, 장애 순간에도 사용자가 길을 잃지 않는 커머스 시스템.</p>
        <div className="hero__actions">
          <a className="button button--dark" href="#collection">Explore the store <span>↘</span></a>
          <button className="text-link" onClick={() => navigate('/signal-lost')}>Experience failure mode <span>↗</span></button>
        </div>
        <dl className="hero__metrics">
          <div><dt>03</dt><dd>source projects<br />integrated</dd></div>
          <div><dt>01</dt><dd>transactional<br />event pipeline</dd></div>
          <div><dt>250<span>ms</span></dt><dd>API latency<br />design SLO</dd></div>
        </dl>
      </div>
      <div className="hero__visual" ref={visual} onPointerMove={onMove}>
        <div className="visual-grid" />
        <div className="orbit orbit--outer"><span>EVENT</span></div>
        <div className="orbit orbit--inner" />
        <img src="/assets/cube.png" alt="반투명 3D 큐브" className="hero__cube" />
        <div className="visual-card visual-card--top mono"><i /> API / HEALTHY</div>
        <div className="visual-card visual-card--bottom"><span className="mono">ORDER.QUEUED</span><strong>01</strong></div>
        <p className="visual-caption mono">POINTER-DRIVEN<br />RAF / 60 FPS</p>
      </div>
    </main>
  )
}

function ProductCard({ product, index, onAdd }: { product: Product; index: number; onAdd: (product: Product) => void }) {
  return (
    <article className="product-card" style={{ '--accent': product.accent } as React.CSSProperties}>
      <div className="product-card__image">
        <span className="product-card__number mono">/{String(index + 1).padStart(2, '0')}</span>
        <img src={product.image} alt="" loading="lazy" />
        <button onClick={() => onAdd(product)} aria-label={`${product.name} 장바구니에 담기`}>ADD <span>＋</span></button>
      </div>
      <div className="product-card__meta">
        <div><h3>{product.name}</h3><p>{product.description}</p></div>
        <strong>{formatPrice(product.price)}</strong>
      </div>
    </article>
  )
}

function Collection({ products, live, onAdd }: { products: Product[]; live: boolean; onAdd: (product: Product) => void }) {
  return (
    <section className="collection section" id="collection">
      <div className="section-heading">
        <div><p className="section-index mono">01 / STOREFRONT</p><h2>Objects with<br /><em>a signal.</em></h2></div>
        <div className="section-heading__aside">
          <span className={`mode-badge ${live ? 'is-live' : ''}`}><i />{live ? 'LIVE API' : 'DEMO DATA'}</span>
          <p>원본 포스터 아트를 실제 상품 카탈로그로 재해석했습니다. 가격과 합계는 API가 다시 계산해 클라이언트 조작을 신뢰하지 않습니다.</p>
        </div>
      </div>
      <div className="product-grid">
        {products.map((product, index) => <ProductCard key={product.sku} product={product} index={index} onAdd={onAdd} />)}
      </div>
    </section>
  )
}

function SystemSection({ status }: { status: PlatformStatus | null }) {
  const services = status?.services ?? []
  return (
    <section className="system section" id="system">
      <div className="system__title">
        <p className="section-index mono">02 / UNDER THE SURFACE</p>
        <h2>One click.<br /><em>Four boundaries.</em></h2>
        <p>화면의 “구매” 한 번을 원자적 저장, 중복 방지, 비동기 이벤트, 관측 가능한 상태로 분해했습니다.</p>
      </div>
      <div className="architecture" aria-label="시스템 아키텍처">
        <div className="architecture__rail" aria-hidden="true"><span /><span /><span /></div>
        <article className="node node--client"><span className="node__index mono">01</span><div><p className="mono">CLIENT</p><h3>React / TypeScript</h3><small>Optimistic interaction</small></div><b>↘</b></article>
        <article className="node"><span className="node__index mono">02</span><div><p className="mono">COMMAND</p><h3>Spring Boot API</h3><small>Validation · idempotency</small></div><b>↘</b></article>
        <article className="node"><span className="node__index mono">03</span><div><p className="mono">COMMIT</p><h3>PostgreSQL + Outbox</h3><small>Single transaction</small></div><b>↘</b></article>
        <article className="node node--event"><span className="node__index mono">04</span><div><p className="mono">EVENT</p><h3>RabbitMQ</h3><small>Async order.created</small></div><b>✓</b></article>
      </div>
      <div className="status-panel">
        <div className="status-panel__header"><span className="mono">PLATFORM / LIVE STATUS</span><strong><i />{status?.status ?? 'CHECKING'}</strong></div>
        {services.map((service) => (
          <div className="status-row" key={service.name}>
            <span>{service.name}</span><small>{service.detail}</small><b className="mono">{service.status}</b>
          </div>
        ))}
      </div>
    </section>
  )
}

function FailureLab() {
  return (
    <section className="failure section" id="about">
      <div className="failure__copy">
        <p className="section-index mono">03 / FAILURE IS A FEATURE</p>
        <h2>A dead end can still<br /><em>feel intentional.</em></h2>
        <p>404를 감추지 않고 복구 흐름으로 설계했습니다. 원본 UFO 애니메이션은 SPA 라우팅과 키보드 접근성을 갖춘 시스템 상태 화면으로 진화했습니다.</p>
        <button className="button button--light" onClick={() => navigate('/signal-lost')}>Open recovery page <span>↗</span></button>
      </div>
      <div className="failure__preview" data-cursor>
        <div className="browser-bar"><i /><i /><i /><span className="mono">effect.ops/unknown-route</span></div>
        <img src="/ufo.svg" alt="UFO가 404의 숫자 0을 끌어올리는 애니메이션" />
        <span className="failure__code mono">HTTP_STATUS / 404</span>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer>
      <div><span className="brand__mark">E/</span><h2>Built for the space<br />between UI and systems.</h2></div>
      <div className="footer__links"><a href="https://github.com/taeyoungk-dev" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://www.linkedin.com/in/katiekim412" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="mailto:katiekim412@gmail.com">Email ↗</a></div>
      <p className="mono">© 2026 KIM TAEYOUNG · SEOUL, KR</p>
    </footer>
  )
}

function CartDrawer({ items, onClose, onRemove, onCheckout, result, loading }: {
  items: CartItem[]
  onClose: () => void
  onRemove: (sku: string) => void
  onCheckout: () => void
  result: OrderResponse | null
  loading: boolean
}) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const isDemoOrder = result?.status === 'DEMO_ACCEPTED'
  return (
    <div className="drawer-shell" role="dialog" aria-modal="true" aria-label="장바구니">
      <button className="drawer-backdrop" onClick={onClose} aria-label="장바구니 닫기" />
      <aside className="drawer">
        <div className="drawer__header"><div><p className="mono">ORDER / DRAFT</p><h2>Your objects</h2></div><button onClick={onClose} aria-label="닫기">×</button></div>
        {result ? (
          <div className="order-success"><span>✓</span><p className="mono">{isDemoOrder ? 'DEMO FLOW COMPLETE' : 'EVENT COMMITTED'}</p><h3>{isDemoOrder ? 'Simulation complete.' : 'Order accepted.'}</h3><p>{isDemoOrder ? 'API가 연결되지 않아 브라우저에서만 시뮬레이션했습니다. 전체 스택을 실행하면 실제 트랜잭션을 확인할 수 있습니다.' : '주문과 outbox 이벤트가 같은 트랜잭션으로 기록되었습니다.'}</p><dl><dt>ORDER ID</dt><dd>{result.orderId}</dd><dt>STATUS</dt><dd>{result.status}</dd><dt>TOTAL</dt><dd>{formatPrice(result.total)}</dd></dl><button className="button button--dark" onClick={onClose}>Continue exploring</button></div>
        ) : items.length === 0 ? (
          <div className="drawer__empty"><span>◎</span><h3>No signal yet.</h3><p>컬렉션에서 오브젝트를 선택해 주문 흐름을 시작하세요.</p></div>
        ) : (
          <>
            <div className="drawer__items">{items.map((item) => <div className="cart-item" key={item.sku}><img src={item.image} alt="" /><div><p className="mono">{item.sku} · QTY {item.quantity}</p><h3>{item.name}</h3><strong>{formatPrice(item.price * item.quantity)}</strong></div><button onClick={() => onRemove(item.sku)} aria-label={`${item.name} 제거`}>×</button></div>)}</div>
            <div className="drawer__total"><span>Estimated total</span><strong>{formatPrice(total)}</strong></div>
            <button className="button button--dark drawer__checkout" onClick={onCheckout} disabled={loading}>{loading ? 'COMMITTING…' : 'COMMIT ORDER'} <span>→</span></button>
            <p className="drawer__note mono">IDEMPOTENCY KEY · SERVER-SIDE TOTAL · OUTBOX EVENT</p>
          </>
        )}
      </aside>
    </div>
  )
}

function NotFound() {
  return (
    <main className="not-found">
      <header className="not-found__header"><button className="brand brand--light" onClick={() => navigate('/')}><span className="brand__mark">E/</span><span>EFFECT<sup>OPS</sup></span></button><span className="mono">RECOVERY MODE / ACTIVE</span></header>
      <div className="not-found__copy"><p className="eyebrow eyebrow--light"><span />Signal interrupted</p><h1>You found the<br /><em>space between.</em></h1><p>요청한 경로는 존재하지 않지만 시스템은 정상입니다. 우주선이 경로를 복구하는 동안 안전하게 스토어로 돌아가세요.</p><button className="button button--acid" onClick={() => navigate('/')}>Return to signal <span>↙</span></button></div>
      <div className="not-found__art"><img src="/ufo.svg" alt="UFO 404 애니메이션" /></div>
      <div className="not-found__meta mono"><span>ERROR / 404</span><span>TRACE ID / {crypto.randomUUID().slice(0, 8).toUpperCase()}</span><span>RECOVERABLE / TRUE</span></div>
    </main>
  )
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [intro, setIntro] = useState(() => sessionStorage.getItem('effect-ops-intro') !== 'seen')
  const [products, setProducts] = useState<Product[]>([])
  const [live, setLive] = useState(false)
  const [status, setStatus] = useState<PlatformStatus | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null)
  const [ordering, setOrdering] = useState(false)

  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname)
    window.addEventListener('popstate', updatePath)
    return () => window.removeEventListener('popstate', updatePath)
  }, [])

  useEffect(() => {
    void getProducts().then(({ products: catalog, live: isLive }) => { setProducts(catalog); setLive(isLive) })
    void getPlatformStatus().then(setStatus)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('has-modal', intro || cartOpen)
  }, [intro, cartOpen])

  const addItem = (product: Product) => {
    setCart((current) => {
      const found = current.find((item) => item.sku === product.sku)
      return found ? current.map((item) => item.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }]
    })
    setOrderResult(null)
    setCartOpen(true)
  }

  const cartCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart])
  const finishIntro = () => { sessionStorage.setItem('effect-ops-intro', 'seen'); setIntro(false) }
  const checkout = async () => {
    setOrdering(true)
    try { setOrderResult(await createOrder(cart)); setCart([]) } finally { setOrdering(false) }
  }

  return (
    <>
      <Cursor />
      {intro && path === '/' && <Intro onComplete={finishIntro} />}
      {path === '/' ? (
        <div className="page"><Header cartCount={cartCount} onCart={() => setCartOpen(true)} /><Hero /><Collection products={products} live={live} onAdd={addItem} /><SystemSection status={status} /><FailureLab /><Footer /></div>
      ) : <NotFound />}
      {cartOpen && <CartDrawer items={cart} onClose={() => setCartOpen(false)} onRemove={(sku) => setCart((current) => current.filter((item) => item.sku !== sku))} onCheckout={checkout} result={orderResult} loading={ordering} />}
    </>
  )
}
