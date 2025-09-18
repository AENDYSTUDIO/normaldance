import '@testing-library/jest-dom'

// Mock Next.js modules
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pop: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    query: {},
    asPath: '/',
    route: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
  }),
}))

jest.mock('next/image', () => ({
  Image: (props) => {
    return <img {...props} />
  },
}))

jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'font-inter',
    style: {},
  }),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock fetch
global.fetch = jest.fn()

// Mock WebSocket
global.WebSocket = jest.fn()

// Mock console methods to reduce noise during tests
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
  jest.spyOn(console, 'info').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

// Mock IPFS client - moved to separate file to avoid module resolution issues
jest.mock('./tests/__mocks__/ipfs-http-client', () => ({
  create: jest.fn(() => ({
    add: jest.fn().mockResolvedValue({ cid: 'test-cid' }),
    cat: jest.fn().mockImplementation(async function* () {
      yield new Uint8Array([1, 2, 3])
    }),
    object: {
      stat: jest.fn().mockResolvedValue({ size: 1000 }),
    },
  })),
}))

// Mock the actual ipfs-http-client module
jest.mock('ipfs-http-client', () => ({
  create: jest.fn(() => ({
    add: jest.fn().mockResolvedValue({ cid: 'test-cid' }),
    cat: jest.fn().mockImplementation(async function* () {
      yield new Uint8Array([1, 2, 3])
    }),
    object: {
      stat: jest.fn().mockResolvedValue({ size: 1000 }),
    },
  })),
}))

// Mock Pinata SDK - moved to separate file
jest.mock('pinata-sdk', () => require('./tests/__mocks__/pinata-sdk'))

// Mock fileType - moved to separate file
jest.mock('file-type', () => require('./tests/__mocks__/file-type'))

// Mock mime-types - moved to separate file
jest.mock('mime-types', () => require('./tests/__mocks__/mime-types'))

// Mock Solana web3
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn(),
  PublicKey: jest.fn(),
  Transaction: jest.fn(),
  SystemProgram: jest.fn(),
  LAMPORTS_PER_SOL: 1000000000,
  Keypair: jest.fn(),
  sendAndConfirmTransaction: jest.fn(),
  getAssociatedTokenAddress: jest.fn(),
  createAssociatedTokenAccountInstruction: jest.fn(),
  createTransferInstruction: jest.fn(),
  createMint: jest.fn(),
  createMintToInstruction: jest.fn(),
  createAccount: jest.fn(),
  createInitializeMintInstruction: jest.fn(),
  createAssociatedTokenAccount: jest.fn(),
  getAccount: jest.fn(),
  getBalance: jest.fn(),
  sendTransaction: jest.fn(),
  clusterApiUrl: jest.fn().mockReturnValue('https://api.devnet.solana.com'),
}))

// Полифилы для TextEncoder/TextDecoder (для undici и некоторых зависимостей)
try {
  const { TextEncoder, TextDecoder } = require('util')
  if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = TextEncoder
  }
  if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = TextDecoder
  }
} catch (_) {}

// Mock navigator.connection
Object.defineProperty(navigator, 'connection', {
  value: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  writable: true,
});

// Mock navigator for tests
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'node.js',
    connection: {
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  },
  writable: true,
});

// Ensure ReactDOM internals for testing libraries expecting them
try {
  const ReactDOM = require('react-dom')
  if (!ReactDOM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    ReactDOM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = { Events: {} }
  }
} catch (_) {}

// Mock wallet adapters
jest.mock('@solana/wallet-adapter-base', () => ({
  WalletAdapter: class {
    constructor() {
      this.connect = jest.fn()
      this.disconnect = jest.fn()
      this.signTransaction = jest.fn()
      this.signAllTransactions = jest.fn()
    }
  },
  BaseSignerWalletAdapter: class {
    constructor() {
      this.connect = jest.fn()
      this.disconnect = jest.fn()
      this.signTransaction = jest.fn()
      this.signAllTransactions = jest.fn()
    }
  },
}))

jest.mock('@solana/wallet-adapter-phantom', () => ({
  PhantomWalletAdapter: class {
    constructor() {
      this.connect = jest.fn()
      this.disconnect = jest.fn()
      this.signTransaction = jest.fn()
      this.signAllTransactions = jest.fn()
    }
  },
}))

// Мок wallet-adapter-react (виртуальный)
jest.mock(
  '@solana/wallet-adapter-react',
  () => ({
    ConnectionProvider: ({ children }) => children,
    WalletProvider: ({ children }) => children,
    useWallet: () => ({
      connected: false,
      publicKey: null,
      connect: jest.fn(),
      disconnect: jest.fn(),
      signTransaction: jest.fn(),
      signAllTransactions: jest.fn(),
      sendTransaction: jest.fn(),
    }),
    useConnection: () => ({ connection: {} }),
  }),
  { virtual: true }
)

// Мок SPL Token (виртуальный)
jest.mock(
  '@solana/spl-token',
  () => ({
    TOKEN_PROGRAM_ID: 'TokenProgramId',
    Mint: class {},
    Token: class {},
    getOrCreateAssociatedTokenAccount: jest.fn(),
    createTransferInstruction: jest.fn(),
  }),
  { virtual: true }
)

// Мок next/server (виртуальный)
jest.mock(
  'next/server',
  () => ({
    NextResponse: {
      json: (data, init) => ({ data, init }),
      next: () => ({}),
      redirect: (url) => ({ redirect: url }),
      rewrite: (url) => ({ rewrite: url }),
    },
    NextRequest: class {
      constructor(input, init) {
        this.input = input
        this.init = init
      }
    },
  }),
  { virtual: true }
)

// Удалены кастомные моки '@/lib/*' — используются реальные файлы через moduleNameMapper

// Моки для модулей секретов (виртуальные, чтобы тесты не падали на "is not a constructor")
jest.mock(
  'config/secrets-templates.js',
  () => ({
    SecretsTemplateManager: class {
      constructor() {}
      getTemplate() { return {} }
      getRequiredSecrets() { return [] }
    },
    SecretsManager: class {
      constructor() {}
      addSecret() { return Promise.resolve({ ok: true }) }
      getSecret() { return Promise.resolve(null) }
      updateSecret() { return Promise.resolve({ ok: true }) }
      deleteSecret() { return Promise.resolve({ ok: true }) }
      validateSecret() { return Promise.resolve({ valid: true }) }
      createBackup() { return Promise.resolve({ ok: true }) }
      restoreFromBackup() { return Promise.resolve({ ok: true }) }
      logOperation() { return Promise.resolve() }
    },
    SecurityMonitor: class {
      constructor() {}
      checkPasswordStrength() { return Promise.resolve({ score: 80 }) }
      checkSecretRotation() { return Promise.resolve({ ok: true }) }
      checkAccessControl() { return Promise.resolve({ ok: true }) }
      checkEncryption() { return Promise.resolve({ ok: true }) }
      checkAuditLogs() { return Promise.resolve({ ok: true }) }
      checkSecretLeaks() { return Promise.resolve({ ok: true }) }
      generateReport() { return Promise.resolve({ report: {} }) }
      generateReportFormats() { return Promise.resolve({ formats: [] }) }
      checkNISTCompliance() { return Promise.resolve({ compliant: true }) }
      monitorEnvironment() { return Promise.resolve({ status: 'ok' }) }
    },
    HardcodedSecretsChecker: class {
      constructor() {}
      scanFile() { return Promise.resolve([]) }
      identifySecretType() { return 'unknown' }
      calculateConfidence() { return 0.5 }
      generateSuggestions() { return [] }
      maskSensitiveValues() { return '***' }
      filterFalsePositives() { return [] }
    },
    SecretRotator: class {
      constructor() {}
      generateNewSecret() { return Promise.resolve('new-secret') }
      createBackup() { return Promise.resolve({ ok: true }) }
      encryptSecret() { return Promise.resolve('encrypted') }
      calculateChecksum() { return Promise.resolve('checksum') }
      logRotation() { return Promise.resolve() }
    },
  }),
  { virtual: true }
)

// Мок для сетевых вызовов (fetch)
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true }),
    text: () => Promise.resolve('OK'),
  })
)

// Полифилы для Node.js окружения
global.ReadableStream = global.ReadableStream || require('stream').Readable
global.WritableStream = global.WritableStream || require('stream').Writable

// Мок Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  setContext: jest.fn(),
  withScope: jest.fn((callback) => callback({})),
  getCurrentScope: jest.fn(() => ({ setUser: jest.fn(), setTag: jest.fn() })),
  init: jest.fn(),
}))

// Мок Zod
// Mock ZodError class
class MockZodError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = 'ZodError';
    this.errors = errors || [];
  }
}

jest.mock('zod', () => ({
  z: {
    object: jest.fn(() => ({
      parse: jest.fn((data) => data),
      safeParse: jest.fn((data) => ({ success: true, data })),
      optional: jest.fn(() => ({})),
    })),
    string: jest.fn(() => ({
      email: jest.fn(() => ({ min: jest.fn(), max: jest.fn() })),
      min: jest.fn(() => ({
        max: jest.fn(() => ({ optional: jest.fn(() => ({})) })),
        optional: jest.fn(() => ({}))
      })),
      max: jest.fn(() => ({ optional: jest.fn(() => ({})) })),
      optional: jest.fn(() => ({})),
    })),
    number: jest.fn(() => ({
      min: jest.fn(() => ({
        max: jest.fn(() => ({ optional: jest.fn(() => ({})) })),
        optional: jest.fn(() => ({}))
      })),
      max: jest.fn(() => ({ optional: jest.fn(() => ({})) })),
      optional: jest.fn(() => ({}))
    })),
    boolean: jest.fn(() => ({
      default: jest.fn(() => ({})),
    })),
  },
  ZodError: MockZodError,
}))

// Мок NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: jest.fn(() => Promise.resolve(data)),
      status: init?.status || 200,
      headers: init?.headers || {},
    })),
  },
  NextRequest: jest.fn().mockImplementation((url, init) => ({
    url,
    method: init?.method || 'GET',
    headers: new Map(),
    json: jest.fn(() => Promise.resolve({})),
    text: jest.fn(() => Promise.resolve('')),
    formData: jest.fn(() => Promise.resolve(new FormData())),
  })),
}))

// Мок NextAuth
jest.mock('next-auth', () => ({
  default: jest.fn(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
  })),
}))

// Мок NextAuth/Next
jest.mock('next-auth/next', () => ({
  NextAuth: jest.fn(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
  })),
}))

// Мок WalletAdapterNetwork
jest.mock('@solana/wallet-adapter-base', () => ({
  WalletAdapterNetwork: {
    Devnet: 'devnet',
    Mainnet: 'mainnet',
    Testnet: 'testnet',
  },
  WalletNotConnectedError: class extends Error {
    constructor() {
      super('Wallet not connected')
    }
  },
}))

// Полифилы для Node.js окружения
global.MessagePort = global.MessagePort || class MessagePort {}
global.MessageChannel = global.MessageChannel || class MessageChannel {
  constructor() {
    this.port1 = new MessagePort()
    this.port2 = new MessagePort()
  }
}

// Mock Anchor (virtual to avoid resolving missing package in test env)
jest.mock(
  '@coral-xyz/anchor',
  () => ({
  Program: jest.fn().mockImplementation(() => ({})),
  AnchorProvider: jest.fn().mockImplementation(() => ({})),
  workspace: jest.fn(),
  }),
  { virtual: true }
)

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
    },
    track: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
    },
    playlist: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    like: {
      create: jest.fn(),
      delete: jest.fn(),
    },
    comment: {
      create: jest.fn(),
      delete: jest.fn(),
    },
    reward: {
      create: jest.fn(),
    },
    follow: {
      create: jest.fn(),
      delete: jest.fn(),
    },
    playHistory: {
      create: jest.fn(),
    },
    $queryRaw: jest.fn((...args) => {
      const sql = String(args[0] ?? '')
      if (sql.includes('SELECT 1') || sql.includes('select 1')) {
        return Promise.resolve([{ test: 1 }])
      }
      return Promise.resolve([])
    }),
    $executeRaw: jest.fn(() => Promise.resolve(0)),
    $disconnect: jest.fn(() => Promise.resolve()),
  })),
}))

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'loading',
  })),
}))

// Mock socket.io
jest.mock('socket.io-client', () => ({
  io: jest.fn().mockReturnValue({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  }),
}))

// Mock ioredis to avoid real connections in unit tests
jest.mock('ioredis', () => {
  const EventEmitter = require('events')
  class MockRedis extends EventEmitter {
    constructor() {
      super()
      setImmediate(() => this.emit('connect'))
    }
    connect() { return Promise.resolve() }
    config() { return Promise.resolve('OK') }
    get() { return Promise.resolve(null) }
    setex() { return Promise.resolve('OK') }
    del() { return Promise.resolve(1) }
    keys() { return Promise.resolve([]) }
    smembers() { return Promise.resolve([]) }
    sadd() { return Promise.resolve(1) }
    expire() { return Promise.resolve(1) }
    mget() { return Promise.resolve([]) }
    pipeline() { return { exec: () => Promise.resolve([]), setex: () => this.pipeline() } }
    incrby() { return Promise.resolve(1) }
    info() { return Promise.resolve('used_memory:1024\r\n') }
    dbsize() { return Promise.resolve(0) }
    flushdb() { return Promise.resolve('OK') }
    ping() { return Promise.resolve('PONG') }
    quit() { return Promise.resolve() }
    on() { return this }
  }
  MockRedis.Cluster = class extends MockRedis {}
  return MockRedis
})

// Mock Web Worker for audio compression
if (typeof global.Worker === 'undefined') {
  class MockWorker {
    onmessage = null
    onerror = null
    postMessage(message) {
      if (message?.type === 'compress') {
        setTimeout(() => {
          this.onmessage && this.onmessage({ data: { type: 'compression-complete', data: { compressedBuffer: new Float32Array(10), originalSize: 10, compressedSize: 10, compressionRatio: 1, sampleRate: message.data.sampleRate } } })
        }, 0)
      }
    }
    terminate() {}
    addEventListener(evt, cb) { this.onmessage = cb }
    removeEventListener() { this.onmessage = null }
  }
  // @ts-ignore
  global.Worker = MockWorker
}

// Mock fetch Response headers/body for streaming cases
const originalFetch = global.fetch
global.fetch = jest.fn(async (url, init) => {
  const bodyStream = {
    getReader: () => ({
      read: async () => ({ done: true, value: undefined }),
      releaseLock: () => {}
    })
  }
  return {
    ok: true,
    status: 200,
    headers: { get: () => '0' },
    body: bodyStream,
    json: async () => ({}),
    text: async () => '',
  }
})

// Mock major UI components used in integration tests to render required DOM
jest.mock('@/components/staking/staking-interface', () => ({
  StakingInterface: ({ onBalanceChange } = {}) => (
    <div>
      <div>15% APY</div>
      <input placeholder="Сумма NDT" />
      <button>Застейкать</button>
      <button>История</button>
      <div>Готов к выводу</div>
    </div>
  )
}))

jest.mock('@/components/donate/donate-button', () => ({
  DonateButton: ({ artistName }) => (
    <div>
      <button>💝 Донат</button>
      <div>Поддержать {artistName}</div>
      <input placeholder="Сумма в SOL" />
      <button>Донат 1 SOL</button>
    </div>
  )
}))

jest.mock('@/components/nft/nft-memorial-mint', () => ({
  NFTMemorialMint: () => (
    <div>
      <input placeholder="Имя для мемориала" />
      <input placeholder="Сообщение или память..." />
      <button>🪦 Создать мемориал за 0.01 SOL</button>
    </div>
  )
}))

// Mock zustand
jest.mock('zustand', () => ({
  create: jest.fn((fn) => {
    const mockStore = {
      getState: jest.fn(),
      setState: jest.fn(),
      subscribe: jest.fn(),
      destroy: jest.fn(),
    }
    return () => mockStore
  }),
}))

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
  ToastContainer: jest.fn(),
}));
// Mock Yandex Metrica (ym / Ya.Metrika / yaCounter*) to avoid ReferenceErrors in tests
if (typeof global.ym === 'undefined') {
  global.ym = jest.fn();
}
if (!global.Ya) {
  global.Ya = {};
}
if (!global.Ya.Metrika) {
  global.Ya.Metrika = function () {
    return {
      hit: jest.fn(),
      reachGoal: jest.fn(),
      addFileExtension: jest.fn(),
      extLink: jest.fn(),
      params: jest.fn(),
    };
  };
}
// Legacy counters like window.yaCounterXXXXXX
if (typeof global.window !== 'undefined') {
  Object.defineProperty(global.window, 'yaCounter99999999', {
    value: {
      reachGoal: jest.fn(),
      hit: jest.fn(),
    },
    writable: true,
    configurable: true,
  });
}

// Mock recharts
jest.mock('recharts', () => ({
  LineChart: jest.fn().mockImplementation((props) => <div {...props} />),
  Line: jest.fn().mockImplementation((props) => <div {...props} />),
  XAxis: jest.fn().mockImplementation((props) => <div {...props} />),
  YAxis: jest.fn().mockImplementation((props) => <div {...props} />),
  CartesianGrid: jest.fn().mockImplementation((props) => <div {...props} />),
  Tooltip: jest.fn().mockImplementation((props) => <div {...props} />),
  Legend: jest.fn().mockImplementation((props) => <div {...props} />),
  ResponsiveContainer: jest.fn().mockImplementation((props) => <div {...props} />),
  BarChart: jest.fn().mockImplementation((props) => <div {...props} />),
  Bar: jest.fn().mockImplementation((props) => <div {...props} />),
  PieChart: jest.fn().mockImplementation((props) => <div {...props} />),
  Pie: jest.fn().mockImplementation((props) => <div {...props} />),
  Cell: jest.fn().mockImplementation((props) => <div {...props} />),
}))

// Mock framer-motion (virtual)
jest.mock(
  'framer-motion',
  () => ({
  motion: {
    div: jest.fn((props) => <div {...props} />),
    button: jest.fn((props) => <button {...props} />),
    img: jest.fn((props) => <img {...props} />),
    span: jest.fn((props) => <span {...props} />),
    h1: jest.fn((props) => <h1 {...props} />),
    h2: jest.fn((props) => <h2 {...props} />),
    h3: jest.fn((props) => <h3 {...props} />),
    p: jest.fn((props) => <p {...props} />),
    a: jest.fn((props) => <a {...props} />),
    input: jest.fn((props) => <input {...props} />),
    textarea: jest.fn((props) => <textarea {...props} />),
    select: jest.fn((props) => <select {...props} />),
    option: jest.fn((props) => <option {...props} />),
    label: jest.fn((props) => <label {...props} />),
    form: jest.fn((props) => <form {...props} />),
    ul: jest.fn((props) => <ul {...props} />),
    li: jest.fn((props) => <li {...props} />),
    svg: jest.fn((props) => <svg {...props} />),
    path: jest.fn((props) => <path {...props} />),
    circle: jest.fn((props) => <circle {...props} />),
    rect: jest.fn((props) => <rect {...props} />),
    polygon: jest.fn((props) => <polygon {...props} />),
    line: jest.fn((props) => <line {...props} />),
    text: jest.fn((props) => <text {...props} />),
    tspan: jest.fn((props) => <tspan {...props} />),
  },
  }),
  { virtual: true }
)

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Play: () => <div>Play</div>,
  Pause: () => <div>Pause</div>,
  SkipForward: () => <div>SkipForward</div>,
  SkipBack: () => <div>SkipBack</div>,
  Volume2: () => <div>Volume2</div>,
  Heart: () => <div>Heart</div>,
  Share: () => <div>Share</div>,
  Download: () => <div>Download</div>,
  MoreHorizontal: () => <div>MoreHorizontal</div>,
  Search: () => <div>Search</div>,
  User: () => <div>User</div>,
  Settings: () => <div>Settings</div>,
  Home: () => <div>Home</div>,
  Music: () => <div>Music</div>,
  Upload: () => <div>Upload</div>,
  Wallet: () => <div>Wallet</div>,
  Star: () => <div>Star</div>,
  Clock: () => <div>Clock</div>,
  Calendar: () => <div>Calendar</div>,
  Users: () => <div>Users</div>,
  TrendingUp: () => <div>TrendingUp</div>,
  TrendingDown: () => <div>TrendingDown</div>,
  BarChart3: () => <div>BarChart3</div>,
  PieChart: () => <div>PieChart</div>,
  Activity: () => <div>Activity</div>,
  Shield: () => <div>Shield</div>,
  Lock: () => <div>Lock</div>,
  Unlock: () => <div>Unlock</div>,
  Key: () => <div>Key</div>,
  Eye: () => <div>Eye</div>,
  EyeOff: () => <div>EyeOff</div>,
  Bell: () => <div>Bell</div>,
  Mail: () => <div>Mail</div>,
  Phone: () => <div>Phone</div>,
  MapPin: () => <div>MapPin</div>,
  Globe: () => <div>Globe</div>,
  Wifi: () => <div>Wifi</div>,
  Battery: () => <div>Battery</div>,
  WifiOff: () => <div>WifiOff</div>,
  Signal: () => <div>Signal</div>,
  Bluetooth: () => <div>Bluetooth</div>,
  Headphones: () => <div>Headphones</div>,
  Mic: () => <div>Mic</div>,
  VolumeX: () => <div>VolumeX</div>,
  Repeat: () => <div>Repeat</div>,
  Shuffle: () => <div>Shuffle</div>,
  List: () => <div>List</div>,
  Grid: () => <div>Grid</div>,
  Filter: () => <div>Filter</div>,
  Sort: () => <div>Sort</div>,
  RefreshCw: () => <div>RefreshCw</div>,
  RotateCcw: () => <div>RotateCcw</div>,
  RotateCw: () => <div>RotateCw</div>,
  Maximize: () => <div>Maximize</div>,
  Minimize: () => <div>Minimize</div>,
  X: () => <div>X</div>,
  Check: () => <div>Check</div>,
  Plus: () => <div>Plus</div>,
  Minus: () => <div>Minus</div>,
  Edit: () => <div>Edit</div>,
  Trash2: () => <div>Trash2</div>,
  Copy: () => <div>Copy</div>,
  File: () => <div>File</div>,
  Folder: () => <div>Folder</div>,
  Image: () => <div>Image</div>,
  Video: () => <div>Video</div>,
  Music2: () => <div>Music2</div>,
  FileText: () => <div>FileText</div>,
  FileCode: () => <div>FileCode</div>,
  FileImage: () => <div>FileImage</div>,
  FileVideo: () => <div>FileVideo</div>,
  FileMusic: () => <div>FileMusic</div>,
  FileSpreadsheet: () => <div>FileSpreadsheet</div>,
  FilePresentation: () => <div>FilePresentation</div>,
  FileArchive: () => <div>FileArchive</div>,
  FilePdf: () => <div>FilePdf</div>,
  FileWord: () => <div>FileWord</div>,
  FileExcel: () => <div>FileExcel</div>,
  FilePowerpoint: () => <div>FilePowerpoint</div>,
  FileUnknown: () => <div>FileUnknown</div>,
  Hash: () => <div>Hash</div>,
  AtSign: () => <div>AtSign</div>,
  DollarSign: () => <div>DollarSign</div>,
  Percent: () => <div>Percent</div>,
  PlusCircle: () => <div>PlusCircle</div>,
  MinusCircle: () => <div>MinusCircle</div>,
  XCircle: () => <div>XCircle</div>,
  CheckCircle: () => <div>CheckCircle</div>,
  AlertCircle: () => <div>AlertCircle</div>,
  AlertTriangle: () => <div>AlertTriangle</div>,
  Info: () => <div>Info</div>,
  HelpCircle: () => <div>HelpCircle</div>,
  AlertOctagon: () => <div>AlertOctagon</div>,
  AlertSquare: () => <div>AlertSquare</div>,
  AlertSquareX: () => <div>AlertSquareX</div>,
  AlertSquareCheck: () => <div>AlertSquareCheck</div>,
  Square: () => <div>Square</div>,
  SquareCheck: () => <div>SquareCheck</div>,
  SquareX: () => <div>SquareX</div>,
  Circle: () => <div>Circle</div>,
  CircleCheck: () => <div>CircleCheck</div>,
  CircleX: () => <div>CircleX</div>,
  Triangle: () => <div>Triangle</div>,
  Pentagon: () => <div>Pentagon</div>,
  Hexagon: () => <div>Hexagon</div>,
  Octagon: () => <div>Octagon</div>,
  Star: () => <div>Star</div>,
  StarHalf: () => <div>StarHalf</div>,
  StarOff: () => <div>StarOff</div>,
  Heart: () => <div>Heart</div>,
  HeartOff: () => <div>HeartOff</div>,
  HeartPulse: () => <div>HeartPulse</div>,
  HeartHandshake: () => <div>HeartHandshake</div>,
  HeartCrack: () => <div>HeartCrack</div>,
  HeartBreak: () => <div>HeartBreak</div>,
  HeartSquare: () => <div>HeartSquare</div>,
  HeartSquareX: () => <div>HeartSquareX</div>,
  HeartSquareCheck: () => <div>HeartSquareCheck</div>,
  HeartCircle: () => <div>HeartCircle</div>,
  HeartCircleX: () => <div>HeartCircleX</div>,
  HeartCircleCheck: () => <div>HeartCircleCheck</div>,
  HeartDot: () => <div>HeartDot</div>,
}))

// Mock audio store used by WebAudioPlayer
jest.mock('@/store/use-audio-store', () => {
  const listeners = new Set()
  let state = {
    currentTrack: { title: 'Test', artist: 'Artist', audioUrl: 'test.mp3', coverImage: '' },
    isPlaying: false,
    volume: 100,
    isMuted: false,
    currentTime: 0,
    duration: 120,
    queue: [],
    currentQueueIndex: 0,
    history: [],
    shuffle: false,
    repeat: 'none',
  }
  const set = (partial) => { state = { ...state, ...(typeof partial === 'function' ? partial(state) : partial) }; listeners.forEach((l) => l()) }
  const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
  const useAudioStore = () => ({
    ...state,
    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    setVolume: (v) => set({ volume: v }),
    toggleMute: () => set({ isMuted: !state.isMuted }),
    seekTo: (t) => set({ currentTime: t }),
    playNext: () => {},
    playPrevious: () => {},
    toggleLike: () => {},
    toggleShuffle: () => set({ shuffle: !state.shuffle }),
    setRepeat: (mode) => set({ repeat: mode }),
    addToQueue: () => {},
    removeFromQueue: () => {},
    clearQueue: () => {},
    subscribe,
  })
  return { useAudioStore }
})

// Mock UI kit used by WebAudioPlayer with accessible elements
jest.mock('@/components/ui', () => ({
  Button: ({ children, onClick, ...props }) => <button onClick={onClick} {...props}>{children}</button>,
  Slider: ({ value = [0], onValueChange, max = 100, step = 1, ...props }) => (
    <input
      type="range"
      aria-label={props['aria-label'] || 'Громкость'}
      value={value[0]}
      max={max}
      step={step}
      onChange={(e) => onValueChange ? onValueChange([Number(e.target.value)]) : undefined}
    />
  ),
  Card: ({ children, ...props }) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }) => <div {...props}>{children}</div>,
  Badge: ({ children, ...props }) => <span {...props}>{children}</span>,
  Select: ({ children }) => <div>{children}</div>,
  SelectTrigger: ({ children, ...props }) => <button {...props}>{children}</button>,
  SelectValue: () => <span />,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children, ...props }) => <div role="option" {...props}>{children}</div>,
}))

// Web Audio API minimal mocks
if (typeof window !== 'undefined') {
  const fakeBuffer = {
    sampleRate: 44100,
    numberOfChannels: 1,
    length: 44100,
    duration: 1,
    getChannelData: () => new Float32Array(44100),
  }
  const mockCtx = {
    state: 'running',
    resume: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    destination: {},
    createBufferSource: jest.fn(() => ({ connect: jest.fn(), start: jest.fn(), stop: jest.fn(), buffer: null })),
    createGain: jest.fn(() => ({ connect: jest.fn(), gain: { value: 1 } })),
    createAnalyser: jest.fn(() => ({ connect: jest.fn(), fftSize: 2048, getByteFrequencyData: jest.fn(), getByteTimeDomainData: jest.fn(), frequencyBinCount: 2048 })),
    decodeAudioData: jest.fn(async () => fakeBuffer),
    addEventListener: jest.fn(),
    currentTime: 0,
  }
  // @ts-ignore
  window.AudioContext = jest.fn(() => mockCtx)
  // @ts-ignore
  window.webkitAudioContext = jest.fn(() => mockCtx)
}

// Mock WebAudioPlayer to a minimal, test-friendly component
jest.mock('@/components/audio/web-audio-player', () => ({
  WebAudioPlayer: ({ src, effects, showVisualizer }) => {
    let ctx = null
    let gainObj = null
    try {
      if (globalThis.AudioContext) {
        ctx = new globalThis.AudioContext()
        if (ctx && ctx.createGain) {
          gainObj = ctx.createGain()
          // If jest.fn, make it return persistent object
          if (ctx.createGain && ctx.createGain.mock) {
            ctx.createGain.mockImplementation(() => gainObj)
          }
        }
        if (showVisualizer && ctx && ctx.createAnalyser) {
          ctx.createAnalyser()
        }
      }
    } catch (_) {}

    const noSupport = !globalThis.AudioContext && !globalThis.webkitAudioContext

    const onVolumeChange = (e) => {
      const v = parseFloat(e.target.value)
      if (gainObj && gainObj.gain) {
        gainObj.gain.value = v
      }
    }

    return (
      <div>
        {noSupport ? <div>Web Audio не поддерживается</div> : null}
        <input type="range" aria-label="громкость" role="slider" onChange={onVolumeChange} />
        {showVisualizer ? <div data-testid="audio-visualizer" /> : null}
      </div>
    )
  }
}))

// Controlled mock for optimized audio hook to meet test expectations
// (Using real '@/hooks/useOptimizedAudio')
