import {
  createConnection,
  createPhantomWallet,
  useSolanaWallet,
  formatAddress,
  isValidAddress,
  solToLamports,
  lamportsToSol,
  formatSol,
  formatTokens,
  createTransaction,
  WalletEventEmitter,
  walletEmitter,
  NDT_PROGRAM_ID,
  NDT_MINT_ADDRESS,
  TRACKNFT_PROGRAM_ID,
  STAKING_PROGRAM_ID
} from '../wallet-adapter'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'

// Mock external dependencies
jest.mock('@solana/web3.js')
jest.mock('@solana/wallet-adapter-base')
jest.mock('@solana/wallet-adapter-phantom')

describe('Wallet Adapter - Unit Tests', () => {
  describe('createConnection', () => {
    it('should create connection with default RPC URL', () => {
      const connection = createConnection()
      expect(connection).toBeInstanceOf(Connection)
      expect(connection.rpcEndpoint).toBe('https://api.devnet.solana.com')
      expect(connection.commitment).toBe('confirmed')
    })

    it('should create connection with custom RPC URL from environment', () => {
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL = 'https://custom.rpc.url'
      const connection = createConnection()
      expect(connection.rpcEndpoint).toBe('https://custom.rpc.url')
      expect(connection.commitment).toBe('confirmed')
      delete process.env.NEXT_PUBLIC_SOLANA_RPC_URL
    })
  })

  describe('createPhantomWallet', () => {
    it('should create Phantom wallet adapter', () => {
      const wallet = createPhantomWallet()
      expect(wallet).toBeDefined()
      expect(wallet).toHaveProperty('connected')
      expect(wallet).toHaveProperty('publicKey')
      expect(wallet).toHaveProperty('signTransaction')
      expect(wallet).toHaveProperty('signAllTransactions')
      expect(wallet).toHaveProperty('connect')
      expect(wallet).toHaveProperty('disconnect')
      expect(wallet).toHaveProperty('sendTransaction')
    })
  })

  describe('formatAddress', () => {
    it('should format address with default length', () => {
      const publicKey = new PublicKey('11111111111111111111111111111111')
      const formatted = formatAddress(publicKey)
      expect(formatted).toBe('1111...1111')
    })

    it('should format address with custom length', () => {
      const publicKey = new PublicKey('11111111111111111111111111111111')
      const formatted = formatAddress(publicKey, 6)
      expect(formatted).toBe('111111...111111')
    })
  })

  describe('isValidAddress', () => {
    it('should return true for valid address', () => {
      const valid = isValidAddress('11111111111111111111111111111111')
      expect(valid).toBe(true)
    })

    it('should return false for invalid address', () => {
      const invalid = isValidAddress('invalid-address')
      expect(invalid).toBe(false)
    })

    it('should return false for empty address', () => {
      const invalid = isValidAddress('')
      expect(invalid).toBe(false)
    })
  })

  describe('solToLamports', () => {
    it('should convert SOL to lamports correctly', () => {
      const lamports = solToLamports(1.5)
      expect(lamports).toBe(1500000000)
    })

    it('should handle zero SOL', () => {
      const lamports = solToLamports(0)
      expect(lamports).toBe(0)
    })

    it('should handle fractional SOL', () => {
      const lamports = solToLamports(0.001)
      expect(lamports).toBe(1000000)
    })
  })

  describe('lamportsToSol', () => {
    it('should convert lamports to SOL correctly', () => {
      const sol = lamportsToSol(1500000000)
      expect(sol).toBe(1.5)
    })

    it('should handle zero lamports', () => {
      const sol = lamportsToSol(0)
      expect(sol).toBe(0)
    })
  })

  describe('formatSol', () => {
    it('should format SOL with Russian locale', () => {
      const formatted = formatSol(1.23456789)
      expect(formatted).toBe('1,234567')
    })

    it('should handle zero SOL', () => {
      const formatted = formatSol(0)
      expect(formatted).toBe('0,00')
    })
  })

  describe('formatTokens', () => {
    it('should format tokens with default decimals', () => {
      const formatted = formatTokens(1000000000)
      expect(formatted).toBe('1,000000000')
    })

    it('should format tokens with custom decimals', () => {
      const formatted = formatTokens(1000000000, 6)
      expect(formatted).toBe('1,000000')
    })

    it('should handle zero tokens', () => {
      const formatted = formatTokens(0)
      expect(formatted).toBe('0,00')
    })
  })

  describe('NDT Program Constants', () => {
    it('should have valid NDT_PROGRAM_ID', () => {
      expect(NDT_PROGRAM_ID).toBeInstanceOf(PublicKey)
      expect(NDT_PROGRAM_ID.toBase58()).toBe('NDT111111111111111111111111111111111111111')
    })

    it('should have valid NDT_MINT_ADDRESS', () => {
      expect(NDT_MINT_ADDRESS).toBeInstanceOf(PublicKey)
      expect(NDT_MINT_ADDRESS.toBase58()).toBe('11111111111111111111111111111111')
    })

    it('should have valid TRACKNFT_PROGRAM_ID', () => {
      expect(TRACKNFT_PROGRAM_ID).toBeInstanceOf(PublicKey)
      expect(TRACKNFT_PROGRAM_ID.toBase58()).toBe('TRACKNFT111111111111111111111111111111111111111')
    })

    it('should have valid STAKING_PROGRAM_ID', () => {
      expect(STAKING_PROGRAM_ID).toBeInstanceOf(PublicKey)
      expect(STAKING_PROGRAM_ID.toBase58()).toBe('STAKING111111111111111111111111111111111111111')
    })
  })
})

describe('Wallet Adapter - Integration Tests', () => {
  let mockWallet: any
  let mockConnection: any

  beforeEach(() => {
    mockWallet = {
      connected: false,
      publicKey: null,
      signTransaction: jest.fn(),
      signAllTransactions: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      sendTransaction: jest.fn(),
      signMessage: jest.fn()
    }

    mockConnection = {
      getBalance: jest.fn(),
      getLatestBlockhash: jest.fn(),
      sendRawTransaction: jest.fn(),
      confirmTransaction: jest.fn(),
      onAccountChange: jest.fn(),
      removeAccountChangeListener: jest.fn()
    }

    // Mock useWallet and useConnection hooks
    jest.mock('@solana/wallet-adapter-react', () => ({
      useWallet: () => mockWallet,
      useConnection: () => ({ connection: mockConnection })
    }))
  })

  describe('useSolanaWallet Hook', () => {
    let useSolanaWallet: any

    beforeEach(() => {
      // Reset module cache to get fresh implementation
      jest.resetModules()
      const module = require('../wallet-adapter')
      useSolanaWallet = module.useSolanaWallet
    })

    it('should return wallet state and methods', () => {
      const wallet = useSolanaWallet()
      expect(wallet).toBeDefined()
      expect(wallet).toHaveProperty('connected')
      expect(wallet).toHaveProperty('publicKey')
      expect(wallet).toHaveProperty('connectWallet')
      expect(wallet).toHaveProperty('disconnectWallet')
      expect(wallet).toHaveProperty('signMessage')
      expect(wallet).toHaveProperty('sendTransaction')
      expect(wallet).toHaveProperty('getBalance')
      expect(wallet).toHaveProperty('getTokenBalance')
    })

    it('should connect wallet when not connected', async () => {
      mockWallet.connected = false
      mockWallet.connect.mockResolvedValue(undefined)
      
      const wallet = useSolanaWallet()
      await wallet.connectWallet()
      
      expect(mockWallet.connect).toHaveBeenCalled()
    })

    it('should not connect wallet when already connected', async () => {
      mockWallet.connected = true
      mockWallet.connect.mockResolvedValue(undefined)
      
      const wallet = useSolanaWallet()
      await wallet.connectWallet()
      
      expect(mockWallet.connect).not.toHaveBeenCalled()
    })

    it('should disconnect wallet when connected', async () => {
      mockWallet.connected = true
      mockWallet.disconnect.mockResolvedValue(undefined)
      
      const wallet = useSolanaWallet()
      await wallet.disconnectWallet()
      
      expect(mockWallet.disconnect).toHaveBeenCalled()
    })

    it('should get balance successfully', async () => {
      mockWallet.connected = true
      mockWallet.publicKey = new PublicKey('11111111111111111111111111111111')
      mockConnection.getBalance.mockResolvedValue(1500000000) // 1.5 SOL
      
      const wallet = useSolanaWallet()
      const balance = await wallet.getBalance()
      
      expect(balance).toBe(1.5)
      expect(mockConnection.getBalance).toHaveBeenCalledWith(mockWallet.publicKey)
    })

    it('should return 0 balance when wallet not connected', async () => {
      mockWallet.connected = false
      
      const wallet = useSolanaWallet()
      const balance = await wallet.getBalance()
      
      expect(balance).toBe(0)
    })

    it('should return 0 balance on error', async () => {
      mockWallet.connected = true
      mockWallet.publicKey = new PublicKey('11111111111111111111111111111111')
      mockConnection.getBalance.mockRejectedValue(new Error('Network error'))
      
      const wallet = useSolanaWallet()
      const balance = await wallet.getBalance()
      
      expect(balance).toBe(0)
    })

    it('should sign message successfully', async () => {
      mockWallet.connected = true
      mockWallet.signMessage.mockResolvedValue(new Uint8Array([1, 2, 3]))
      const message = new Uint8Array([1, 2, 3])
      
      const wallet = useSolanaWallet()
      const result = await wallet.signMessage(message)
      
      expect(result).toEqual(new Uint8Array([1, 2, 3]))
      expect(mockWallet.signMessage).toHaveBeenCalledWith(message)
    })

    it('should throw WalletNotConnectedError when not connected', async () => {
      mockWallet.connected = false
      
      const wallet = useSolanaWallet()
      await expect(wallet.signMessage(new Uint8Array([1, 2, 3]))).rejects.toThrow(WalletNotConnectedError)
    })

    it('should send transaction successfully', async () => {
      mockWallet.connected = true
      mockWallet.sendTransaction.mockResolvedValue('signature123')
      const transaction = new Transaction()
      
      const wallet = useSolanaWallet()
      const signature = await wallet.sendTransaction(transaction)
      
      expect(signature).toBe('signature123')
      expect(mockWallet.sendTransaction).toHaveBeenCalledWith(transaction, mockConnection)
    })

    it('should throw WalletNotConnectedError when sending transaction without connection', async () => {
      mockWallet.connected = false
      
      const wallet = useSolanaWallet()
      await expect(wallet.sendTransaction(new Transaction())).rejects.toThrow(WalletNotConnectedError)
    })
  })

  describe('createTransaction', () => {
    it('should create transaction with instructions', async () => {
      const instructions = [SystemProgram.transfer({
        fromPubkey: new PublicKey('11111111111111111111111111111111'),
        toPubkey: new PublicKey('22222222222222222222222222222222'),
        lamports: 1000000
      })]
      
      mockConnection.getLatestBlockhash.mockResolvedValue({
        blockhash: 'blockhash123',
        lastValidBlockHeight: 100
      })
      
      const mockWalletAdapter = {
        connected: true,
        publicKey: new PublicKey('11111111111111111111111111111111'),
        signTransaction: jest.fn(),
        signAllTransactions: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
        sendTransaction: jest.fn()
      }
      
      const transaction = await createTransaction(mockConnection, mockWalletAdapter, instructions)
      
      expect(transaction).toBeInstanceOf(Transaction)
      expect(transaction.instructions).toHaveLength(1)
      expect(transaction.recentBlockhash).toBe('blockhash123')
      expect(transaction.feePayer).toEqual(mockWalletAdapter.publicKey)
    })

    it('should throw error when wallet public key is not available', async () => {
      const mockWalletAdapter = {
        connected: false,
        publicKey: null,
        signTransaction: jest.fn(),
        signAllTransactions: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
        sendTransaction: jest.fn()
      }
      
      await expect(createTransaction(mockConnection, mockWalletAdapter, [])).rejects.toThrow('Wallet public key is not available')
    })
  })
})

describe('Wallet Adapter - Error Handling Tests', () => {
  let mockWallet: any
  let mockConnection: any

  beforeEach(() => {
    mockWallet = {
      connected: false,
      publicKey: null,
      signTransaction: jest.fn(),
      signAllTransactions: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      sendTransaction: jest.fn(),
      signMessage: jest.fn()
    }

    mockConnection = {
      getBalance: jest.fn(),
      getLatestBlockhash: jest.fn(),
      sendRawTransaction: jest.fn(),
      confirmTransaction: jest.fn(),
      onAccountChange: jest.fn(),
      removeAccountChangeListener: jest.fn()
    }
  })

  it('should handle connection errors gracefully', async () => {
    mockWallet.connected = false
    mockWallet.connect.mockRejectedValue(new Error('Connection failed'))
    
    const { useSolanaWallet } = require('../wallet-adapter')
    const wallet = useSolanaWallet()
    
    await expect(wallet.connectWallet()).rejects.toThrow('Connection failed')
  })

  it('should handle disconnection errors gracefully', async () => {
    mockWallet.connected = true
    mockWallet.disconnect.mockRejectedValue(new Error('Disconnection failed'))
    
    const { useSolanaWallet } = require('../wallet-adapter')
    const wallet = useSolanaWallet()
    
    await expect(wallet.disconnectWallet()).rejects.toThrow('Disconnection failed')
  })

  it('should handle message signing errors gracefully', async () => {
    mockWallet.connected = true
    mockWallet.signMessage.mockRejectedValue(new Error('Signing failed'))
    
    const { useSolanaWallet } = require('../wallet-adapter')
    const wallet = useSolanaWallet()
    
    await expect(wallet.signMessage(new Uint8Array([1, 2, 3]))).rejects.toThrow('Signing failed')
  })

  it('should handle transaction sending errors gracefully', async () => {
    mockWallet.connected = true
    mockWallet.sendTransaction.mockRejectedValue(new Error('Transaction failed'))
    
    const { useSolanaWallet } = require('../wallet-adapter')
    const wallet = useSolanaWallet()
    
    await expect(wallet.sendTransaction(new Transaction())).rejects.toThrow('Transaction failed')
  })

  it('should handle balance retrieval errors gracefully', async () => {
    mockWallet.connected = true
    mockWallet.publicKey = new PublicKey('11111111111111111111111111111111')
    mockConnection.getBalance.mockRejectedValue(new Error('Network error'))
    
    const { useSolanaWallet } = require('../wallet-adapter')
    const wallet = useSolanaWallet()
    
    const balance = await wallet.getBalance()
    expect(balance).toBe(0)
  })
})

describe('Wallet Adapter - Edge Cases Tests', () => {
  describe('formatAddress', () => {
    it('should handle very short addresses', () => {
      const publicKey = new PublicKey('111')
      const formatted = formatAddress(publicKey, 2)
      expect(formatted).toBe('11...11')
    })

    it('should handle very long addresses', () => {
      const publicKey = new PublicKey('1111111111111111111111111111111111111111111111111111111111111111')
      const formatted = formatAddress(publicKey, 8)
      expect(formatted).toHaveLength(17) // 8 + 3 + 6
    })
  })

  describe('solToLamports', () => {
    it('should handle very large SOL amounts', () => {
      const lamports = solToLamports(1000000)
      expect(lamports).toBe(1000000000000000)
    })

    it('should handle negative SOL amounts', () => {
      const lamports = solToLamports(-1)
      expect(lamports).toBe(-1000000000)
    })
  })

  describe('lamportsToSol', () => {
    it('should handle very large lamport amounts', () => {
      const sol = lamportsToSol(1000000000000000)
      expect(sol).toBe(1000000)
    })

    it('should handle negative lamport amounts', () => {
      const sol = lamportsToSol(-1000000000)
      expect(sol).toBe(-1)
    })
  })

  describe('isValidAddress', () => {
    it('should handle very long strings', () => {
      const longAddress = '1'.repeat(100)
      const valid = isValidAddress(longAddress)
      expect(valid).toBe(false)
    })

    it('should handle special characters', () => {
      const specialAddress = '1111-1111-1111-1111'
      const valid = isValidAddress(specialAddress)
      expect(valid).toBe(false)
    })
  })
})

describe('WalletEventEmitter', () => {
  let emitter: WalletEventEmitter

  beforeEach(() => {
    emitter = new WalletEventEmitter()
  })

  it('should register event listeners', () => {
    const callback = jest.fn()
    emitter.on('connect', callback)
    
    emitter.emit('connect', { data: 'test' })
    
    expect(callback).toHaveBeenCalledWith({ data: 'test' })
  })

  it('should unregister event listeners', () => {
    const callback = jest.fn()
    emitter.on('connect', callback)
    emitter.off('connect', callback)
    
    emitter.emit('connect', { data: 'test' })
    
    expect(callback).not.toHaveBeenCalled()
  })

  it('should handle multiple listeners for same event', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()
    
    emitter.on('connect', callback1)
    emitter.on('connect', callback2)
    
    emitter.emit('connect', { data: 'test' })
    
    expect(callback1).toHaveBeenCalledWith({ data: 'test' })
    expect(callback2).toHaveBeenCalledWith({ data: 'test' })
  })

  it('should handle unknown events gracefully', () => {
    const callback = jest.fn()
    emitter.on('unknown', callback)
    
    emitter.emit('connect', { data: 'test' })
    
    expect(callback).not.toHaveBeenCalled()
  })
})

describe('Global Wallet Emitter', () => {
  it('should be instance of WalletEventEmitter', () => {
    expect(walletEmitter).toBeInstanceOf(WalletEventEmitter)
  })

  it('should allow global event registration', () => {
    const callback = jest.fn()
    walletEmitter.on('test', callback)
    
    walletEmitter.emit('test', { data: 'global' })
    
    expect(callback).toHaveBeenCalledWith({ data: 'global' })
  })
})