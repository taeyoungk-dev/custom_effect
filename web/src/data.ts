import type { PlatformStatus, Product } from './types'

export const fallbackProducts: Product[] = [
  {
    sku: 'SIGNAL-01',
    name: 'Signal No. 01',
    description: 'A modular light study for focused rooms.',
    price: 129,
    accent: '#521714',
    image: '/assets/poster-signal.png',
  },
  {
    sku: 'ORBIT-02',
    name: 'Orbit No. 02',
    description: 'A kinetic print about systems in motion.',
    price: 96,
    accent: '#1e4029',
    image: '/assets/poster-orbit.png',
  },
  {
    sku: 'FIELD-03',
    name: 'Field No. 03',
    description: 'A chromatic field generated from live data.',
    price: 148,
    accent: '#5b4a87',
    image: '/assets/poster-field.png',
  },
]

export const fallbackStatus: PlatformStatus = {
  status: 'DEMO',
  services: [
    { name: 'Storefront', status: 'ONLINE', detail: 'React edge client' },
    { name: 'Order API', status: 'DEMO', detail: 'Start Spring Boot to connect' },
    { name: 'Event pipeline', status: 'DEMO', detail: 'Transactional outbox' },
  ],
}
