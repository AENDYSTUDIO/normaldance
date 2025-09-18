import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import { 
  createConnection, 
  createPhantomWallet, 
  useSolanaWallet,
  createTransaction,
  formatAddress,
  STAKING_PROGRAM_ID
} from '@/components/wallet/wallet-adapter'

// Mock Solana Web3.js
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getLatestBlockhash: jest.fn().mockResolvedValue({
      blockhash: 'test-blockhash',
      lastValidBlockHeight: 100
    }),
    getBalance: jest.fn().mockResolvedValue(1000000000), // 1 SOL
    sendRawTransaction: jest.fn().mockResolvedValue('test-signature'),
    confirmTransaction: jest.fn().mockResolvedValue({ value: { err: null } })
  })),
  PublicKey: jest.fn().mockImplementation((key) => ({
    toBase58: () => key || 'test-public-key',
    toString: () => key || 'test-public-key'
  })),
  Transaction: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    recentBlockhash: '',
    feePayer: null,
    serialize: jest.fn().mockReturnValue(Buffer.from('test-transaction'))
  })),
  SystemProgram: {
    transfer: jest.fn().mockReturnValue({})
  },
  LAMPORTS_PER_SOL: 1000000000
}))

// Prepare refs for adapter-react mocks (allowed if prefixed with "mock")
let mockWalletRef: any
let mockConnectionRef: any

// Mock wallet-adapter-react hooks
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => mockWalletRef,
  useConnection: () => ({ connection: mockConnectionRef })
}))

// Mock wallet adapters
jest.mock('@solana/wallet-adapter-phantom', () => ({
  PhantomWalletAdapter: jest.fn().mockImplementation(() => ({
    name: 'Phantom',
    url: 'https://phantom.app',
    icon: 'phantom-icon',
    readyState: 'Installed',
    publicKey: { toBase58: () => 'test-public-key' },
    connected: true,
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    signTransaction: jest.fn().mockResolvedValue({}),
    signAllTransactions: jest.fn().mockResolvedValue([{}]),
    sendTransaction: jest.fn().mockResolvedValue('test-signature')
  }))
}))

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn()
}))

describe('Wallet Adapter Tests', () => {
  let mockConnection: any
  let mockWallet: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockConnection = new Connection('https://api.devnet.solana.com')
    mockWallet = {
      connected: true,
      publicKey: { toBase58: () => 'test-public-key' },
      signTransaction: jest.fn().mockResolvedValue(new Transaction()),
      signAllTransactions: jest.fn().mockResolvedValue([new Transaction()]),
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      sendTransaction: jest.fn().mockResolvedValue('test-signature'),
      signMessage: jest.fn().mockResolvedValue(new Uint8Array([1,2,3]))
    }

    // expose to adapter-react mocks
    mockWalletRef = mockWallet
    mockConnectionRef = mockConnection
  })

  describe('createConnection', () => {
    it('should create connection with default RPC URL', () => {
      const connection = createConnection()
      expect(Connection).toHaveBeenCalled()
    })

    it('should create connection with custom RPC URL', () => {
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL = 'https://custom-rpc.com'
      const connection = createConnection()
      expect(Connection).toHaveBeenCalled()
    })
  })

  describe('createPhantomWallet', () => {
    it('should create Phantom wallet adapter', () => {
      const wallet = createPhantomWallet()
      expect(wallet).toBeDefined()
      expect(wallet.name).toBe('Phantom')
    })
  })

  describe('useSolanaWallet', () => {
    it('should connect wallet successfully', async () => {
      // ensure disconnected state to trigger connect
      mockWallet.connected = false
      const { connectWallet } = useSolanaWallet()
      await connectWallet()
      expect(mockWallet.connect).toHaveBeenCalled()
    })

    it('should disconnect wallet successfully', async () => {
      const { disconnectWallet } = useSolanaWallet()
      await disconnectWallet()
      expect(mockWallet.disconnect).toHaveBeenCalled()
    })

    it('should get balance successfully', async () => {
      const { getBalance } = useSolanaWallet()
      const balance = await getBalance()
      expect(balance).toBe(1) // 1 SOL
    })

    it('should return 0 balance when wallet not connected', async () => {
      mockWallet.publicKey = null
      const { getBalance } = useSolanaWallet()
      const balance = await getBalance()
      expect(balance).toBe(0)
    })

    it('should sign message successfully', async () => {
      const { signMessage } = useSolanaWallet()
      const message = new Uint8Array([1, 2, 3])
      const signature = await signMessage(message)
      expect(mockWallet.signMessage).toHaveBeenCalledWith(message)
    })

    it('should throw error when signing message without wallet', async () => {
      mockWallet.connected = false
      const { signMessage } = useSolanaWallet()
      await expect(signMessage(new Uint8Array([1, 2, 3]))).rejects.toThrow(WalletNotConnectedError)
    })

    it('should send transaction successfully', async () => {
      const { sendTransaction } = useSolanaWallet()
      const transaction = new Transaction()
      const signature = await sendTransaction(transaction)
      expect(signature).toBe('test-signature')
    })

    it('should throw error when sending transaction without wallet', async () => {
      mockWallet.connected = false
      const { sendTransaction } = useSolanaWallet()
      await expect(sendTransaction(new Transaction())).rejects.toThrow(WalletNotConnectedError)
    })
  })

  describe('createTransaction', () => {
    it('should create transaction with instructions', async () => {
      const instructions = [{ programId: new PublicKey('test-program') }]
      const transaction = await createTransaction(mockConnection, mockWallet, instructions)
      
      expect(transaction).toBeDefined()
      expect(transaction.add).toHaveBeenCalledWith(instructions[0])
    })

    it('should set recent blockhash and fee payer', async () => {
      const instructions = [{ programId: new PublicKey('test-program') }]
      const transaction = await createTransaction(mockConnection, mockWallet, instructions)
      
      expect(transaction.recentBlockhash).toBe('test-blockhash')
      expect(transaction.feePayer).toBe(mockWallet.publicKey)
    })

    it('should throw error when wallet has no public key', async () => {
      mockWallet.publicKey = null
      const instructions = [{ programId: new PublicKey('test-program') }]
      
      await expect(createTransaction(mockConnection, mockWallet, instructions))
        .rejects.toThrow('Wallet public key is not available')
    })
  })

  describe('formatAddress', () => {
    it('should format address with default length', () => {
      const address = new PublicKey('test-public-key' as any)
      const formatted = formatAddress(address)
      expect(formatted).toContain('...')
      expect(formatted.startsWith('test')).toBe(true)
    })

    it('should format address with custom length', () => {
      const address = new PublicKey('test-public-key' as any)
      const formatted = formatAddress(address, 6)
      expect(formatted).toContain('...')
      expect(formatted.startsWith('test-p')).toBe(true)
    })
  })

  describe('Constants', () => {
    it('should have correct staking program ID', () => {
      expect(STAKING_PROGRAM_ID.toBase58()).toBe('STAKING111111111111111111111111111111111111111')
    })
  })
})

describe('Web3 Integration Tests', () => {
  describe('Transaction Flow', () => {
    it('should complete full transaction flow', async () => {
      const connection = createConnection()
      const wallet = createPhantomWallet()
      
      // Mock successful transaction
      const mockTransaction = new Transaction()
      const instructions = [SystemProgram.transfer({
        fromPubkey: wallet.publicKey!,
        toPubkey: new PublicKey('recipient-key'),
        lamports: 1000000
      })]
      
      const transaction = await createTransaction(connection, wallet, instructions)
      expect(transaction).toBeDefined()
      
      const signature = await wallet.sendTransaction(transaction, connection)
      expect(signature).toBe('test-signature')
    })
  })

  describe('Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      const connection = new Connection('invalid-url')
      // Mock connection error
      ;(connection.getLatestBlockhash as jest.Mock).mockRejectedValue(new Error('Connection failed'))
      
      const wallet = createPhantomWallet()
      const instructions = [{ programId: new PublicKey('test-program') }]
      
      await expect(createTransaction(connection, wallet, instructions))
        .rejects.toThrow('Connection failed')
    })

    it('should handle wallet errors gracefully', async () => {
      const connection = createConnection()
      const wallet = createPhantomWallet()
      
      // Mock wallet error
      ;(wallet.signTransaction as jest.Mock).mockRejectedValue(new Error('Wallet error'))
      
      const transaction = new Transaction()
      await expect(wallet.signTransaction(transaction))
        .rejects.toThrow('Wallet error')
    })
  })

  describe('Security Tests', () => {
    it('should handle invalid transaction parameters gracefully', async () => {
      const connection = createConnection()
      const wallet = createPhantomWallet()
      
      // Test with invalid instructions
      const invalidInstructions = [null, undefined, {}]
      
      for (const instruction of invalidInstructions) {
        await expect(createTransaction(connection, wallet, [instruction]))
          .resolves.toBeDefined()
      }
    })

    it('should prevent unauthorized transactions', async () => {
      const connection = createConnection()
      const wallet = createPhantomWallet()
      
      // Mock wallet not connected
      wallet.connected = false
      wallet.publicKey = null
      
      const instructions = [{ programId: new PublicKey('test-program') }]
      
      await expect(createTransaction(connection, wallet, instructions))
        .rejects.toThrow('Wallet public key is not available')
    })
  })
})
