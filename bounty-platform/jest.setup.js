import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => (func) => {
  const DynamicComponent = (...args) => {
    const Component = func()
    return typeof Component.then === 'function'
      ? Component.then((mod) => mod.default || mod)
      : Component
  }
  DynamicComponent.displayName = 'DynamicComponent'
  return DynamicComponent
})

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: 'test-vapid-key',
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock Web APIs
global.crypto = {
  ...global.crypto,
  randomUUID: () => 'test-uuid',
  getRandomValues: (arr) => arr.fill(1),
}

// Mock Push API
global.PushManager = class PushManager {
  static supportedContentEncodings = ['aes128gcm']
}

global.ServiceWorkerRegistration = class ServiceWorkerRegistration {
  pushManager = new PushManager()
  showNotification = jest.fn()
}

// Mock Notification API
global.Notification = class Notification {
  static permission = 'default'
  static requestPermission = jest.fn(() => Promise.resolve('granted'))
  constructor(title, options) {
    this.title = title
    this.options = options
  }
  close = jest.fn()
}

// Mock service worker
Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: jest.fn(() => Promise.resolve(new ServiceWorkerRegistration())),
    ready: Promise.resolve(new ServiceWorkerRegistration()),
    controller: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
})

// Suppress console.error during tests unless it's a real error
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') ||
        args[0].includes('ReactDOM.render is no longer supported'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})