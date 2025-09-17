import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import * as Sentry from '@sentry/nextjs'

// Конфигурация сети
const NETWORK = WalletAdapterNetwork.Devnet
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'

export interface WalletAdapter {
  connected: boolean
  publicKey: PublicKey | null
  signTransaction: (transaction: Transaction) => Promise<Transaction>
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>
}

// Создание подключения к Solana
export function createConnection(): Connection {
  const timeoutMs = Number(process.env.SOLANA_RPC_TIMEOUT || '8000')
  return new Connection(RPC_URL, {
    commitment: 'confirmed',
    // Use a fetch with AbortSignal timeout to avoid hanging requests
    // @ts-ignore - web3.js supports custom fetch
    fetch: (url: string, options?: any) => fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) as any })
  } as any)
}

// Инициализация кошелька Phantom
export function createPhantomWallet(): PhantomWalletAdapter {
  return new PhantomWalletAdapter()
}

// Хук для использования кошелька
export function useSolanaWallet() {
  const wallet = useWallet()
  const { connection } = useConnection()

  const connectWallet = async () => {
    if (!wallet.connected) {
      if (!wallet.connect) throw new Error('Wallet does not support connection')
      await wallet.connect()
    }
  }

  const disconnectWallet = async () => {
    if (wallet.connected) {
      if (!wallet.disconnect) throw new Error('Wallet does not support disconnection')
      await wallet.disconnect()
    }
  }

  const signMessage = async (message: Uint8Array): Promise<Uint8Array> => {
    if (!wallet.connected) throw new WalletNotConnectedError()
    if (!wallet.signMessage) throw new Error('Wallet does not support message signing')
    
    try {
      return await wallet.signMessage(message)
    } catch (error) {
      console.error('Error signing message:', error)
      Sentry.captureException(error)
      throw error
    }
  }

  const sendTransaction = async (transaction: Transaction): Promise<string> => {
    if (!wallet.connected) throw new WalletNotConnectedError()
    if (!wallet.sendTransaction) throw new Error('Wallet does not support transaction sending')
    
    try {
      const signature = await wallet.sendTransaction(transaction, connection)
      return signature
    } catch (error) {
      console.error('Error sending transaction:', error)
      Sentry.captureException(error)
      throw error
    }
  }

  const getBalance = async (): Promise<number> => {
    if (!wallet.publicKey) return 0
    
    try {
      const balance = await connection.getBalance(wallet.publicKey)
      return balance / LAMPORTS_PER_SOL
    } catch (error) {
      console.error('Error getting balance:', error)
      Sentry.captureException(error)
      return 0
    }
  }

  const getTokenBalance = async (mintAddress: string): Promise<number> => {
    if (!wallet.publicKey) return 0
    
    try {
      const mintPublicKey = new PublicKey(mintAddress)
      // Здесь нужно реализовать логику получения баланса токена
      // Для этого потребуется SPL Token program
      return 0
    } catch (error) {
      console.error('Error getting token balance:', error)
      Sentry.captureException(error)
      return 0
    }
  }

  return {
    ...wallet,
    connectWallet,
    disconnectWallet,
    signMessage,
    sendTransaction,
    getBalance,
    getTokenBalance,
  }
}

// Компонент WalletAdapter для тестов
export function WalletAdapter({ wallet, balance }: { wallet?: any; balance?: number }) {
  return (
    <div>
      <button>Connect Wallet</button>
      {wallet && <div>Wallet Connected</div>}
      {balance && <div>{balance} SOL</div>}
    </div>
  )
}

// Функции для работы с токенами NDT
export const NDT_PROGRAM_ID = new PublicKey('NDT111111111111111111111111111111111111111')
export const NDT_MINT_ADDRESS = new PublicKey('11111111111111111111111111111111') // Заменить на реальный адрес

// Функции для работы с TrackNFT
export const TRACKNFT_PROGRAM_ID = new PublicKey('TRACKNFT111111111111111111111111111111111111111')

// Функции для работы со стейкингом
export const STAKING_PROGRAM_ID = new PublicKey('STAKING111111111111111111111111111111111111111')

// Хелпер для создания транзакции
export async function createTransaction(
  connection: Connection,
  wallet: WalletAdapter,
  instructions: any[],
  signers: any[] = []
): Promise<Transaction> {
  const transaction = new Transaction()
  
  // Добавляем инструкции
  instructions.forEach(instruction => {
    transaction.add(instruction)
  })
  
  // Добавим recentBlockhash
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  
  if (!wallet.publicKey) {
    throw new Error('Wallet public key is not available')
  }
  transaction.feePayer = wallet.publicKey
  
  return transaction
}

// Функция для форматирования адреса
export function formatAddress(address: PublicKey, length: number = 4): string {
  const str = address.toBase58()
  return `${str.slice(0, length)}...${str.slice(-length)}`
}

// Функция для проверки валидности адреса
export function isValidAddress(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}

// Функция для конвертации SOL в lamports
export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL)
}

// Функция для конвертации lamports в SOL
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL
}

// Функция для форматирования суммы в SOL
export function formatSol(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount)
}

// Функция для форматирования суммы в токенах
export function formatTokens(amount: number, decimals: number = 9): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  }).format(amount)
}

// Типы для событий кошелька
export interface WalletEvent {
  type: 'connect' | 'disconnect' | 'accountChange' | 'chainChange'
  data?: any
}

// Эмиттер событий для кошелька
export class WalletEventEmitter {
  private listeners: Map<string, Function[]> = new Map()

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }
}

// Глобальный эмиттер событий
export const walletEmitter = new WalletEventEmitter()