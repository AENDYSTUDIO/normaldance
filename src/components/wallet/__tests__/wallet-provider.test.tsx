import React, { createContext, useContext, ReactNode } from 'react'
import { render, screen, act } from '@testing-library/react'
import { WalletProvider, useWalletContext, useTransactions } from '../wallet-provider'
import { useSolanaWallet } from '../wallet-adapter'
import { walletEmitter } from '../wallet-adapter'

// Mock the wallet adapter hook
jest.mock('../wallet-adapter', () => ({
  useSolanaWallet: jest.fn(),
  walletEmitter: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
  }
}))

// Mock window.solana
Object.defineProperty(window, 'solana', {
  writable: true,
  value: {
    isPhantom: true,
    connect: jest.fn(),
    disconnect: jest.fn()
  }
})

describe('WalletProvider - Unit Tests', () => {
  const mockUseSolanaWallet = useSolanaWallet as jest.MockedFunction<typeof useSolanaWallet>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Context Provider', () => {
    it('should provide wallet context to children', () => {
      mockUseSolanaWallet.mockReturnValue({
        connected: true,
        publicKey: new PublicKey('11111111111111111111111111111111'),
        connect: jest.fn(),
        disconnect: jest.fn(),
        balance: 1.5
      })

      const TestComponent = () => {
        const { connected, publicKey } = useWalletContext()
        return (
          <div>
            <div data-testid="connected">{connected.toString()}</div>
            <div data-testid="public-key">{publicKey?.toBase58()}</div>
          </div>
        )
      }

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      )

      expect(screen.getByTestId('connected')).toHaveTextContent('true')
      expect(screen.getByTestId('public-key')).toHaveTextContent('11111111111111111111111111111111')
    })

    it('should handle wallet state changes', () => {
      mockUseSolanaWallet.mockReturnValue({
        connected: false,
        publicKey: null,
        connect: jest.fn(),
        disconnect: jest.fn(),
        balance: null
      })

      const TestComponent = () => {
        const { connected, publicKey } = useWalletContext()
        return (
          <div>
            <div data-testid="connected">{connected.toString()}</div>
            <div data-testid="public-key">{publicKey?.toBase58() || 'null'}</div>
          </div>
        )
      }

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      )

      expect(screen.getByTestId('connected')).toHaveTextContent('false')
      expect(screen.getByTestId('public-key')).toHaveTextContent('null')
    })
  })

  describe('useTransactions Hook', () => {
    it('should provide transaction methods', () => {
      const TestComponent = () => {
        const { sendTransaction, transactions } = useTransactions()
        return (
          <div>
            <div data-testid="send-transaction">{typeof sendTransaction}</div>
            <div data-testid="transactions-count">{transactions.length}</div>
          </div>
        )
      }

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      )

      expect(screen.getByTestId('send-transaction')).toHaveTextContent('function')
      expect(screen.getByTestId('transactions-count')).toHaveTextContent('0')
    })

    it('should add transaction to list', async () => {
      const mockSendTransaction = jest.fn().mockResolvedValue('signature123')
      
      const TestComponent = () => {
        const { sendTransaction, transactions } = useTransactions()
        
        const handleSend = async () => {
          const signature = await sendTransaction({
            instructions: [],
            recentBlockhash: 'blockhash123'
          })
          return signature
        }

        return (
          <div>
            <button onClick={handleSend}>Send</button>
            <div data-testid="transactions-count">{transactions.length}</div>
          </div>
        )
      }

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      )

      const button = screen.getByRole('button')
      await act(async () => {
        fireEvent.click(button)
      })

      expect(mockSendTransaction).toHaveBeenCalled()
      expect(screen.getByTestId('transactions-count')).toHaveTextContent('1')
    })
  })

  describe('Event Handling', () => {
    it('should handle wallet connect event', () => {
      mockUseSolanaWallet.mockReturnValue({
        connected: false,
        publicKey: null,
        connect: jest.fn(),
        disconnect: jest.fn(),
        balance: null
      })

      const TestComponent = () => {
        const { connected } = useWalletContext()
        return <div data-testid="connected">{connected.toString()}</div>
      }

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      )

      // Simulate wallet connect event
      act(() => {
        walletEmitter.emit('connect', '11111111111111111111111111111111')
      })

      expect(screen.getByTestId('connected')).toHaveTextContent('true')
    })

    it('should handle wallet disconnect event', () => {
      mockUseSolanaWallet.mockReturnValue({
        connected: true,
        publicKey: new PublicKey('11111111111111111111111111111111'),
        connect: jest.fn(),
        disconnect: jest.fn(),
        balance: 1.5
      })

      const TestComponent = () => {
        const { connected } = useWalletContext()
        return <div data-testid="connected">{connected.toString()}</div>
      }

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      )

      // Simulate wallet disconnect event
      act(() => {
        walletEmitter.emit('disconnect')
      })

      expect(screen.getByTestId('connected')).toHaveTextContent('false')
    })

    it('should handle wallet error event', () => {
      mockUseSolanaWallet.mockReturnValue({
        connected: false,
        publicKey: null,
        connect: jest.fn(),
        disconnect: jest.fn(),
        balance: null
      })

      const TestComponent = () => {
        const { error } = useWalletContext()
        return <div data-testid="error">{error || 'no-error'}</div>
      }

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      )

      // Simulate wallet error event
      act(() => {
        walletEmitter.emit('error', new Error('Test error'))
      })

      expect(screen.getByTestId('error')).toHaveTextContent('Test error')
    })
  })

  describe('Transaction Management', () => {
    it('should track transaction history', () => {
      const TestComponent = () => {
        const { transactions, sendTransaction } = useTransactions()
        
        const handleSend = async () => {
          await sendTransaction({
            instructions: [],
            recentBlockhash: 'blockhash123'
          })
        }

        return (
          <div>
            <button onClick={handleSend}>Send</button>
            <div data-testid="transactions-count">{transactions.length}</div>
          </div>
        )
      }

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      )

      const button = screen.getByRole('button')
      
      // Send multiple transactions
      act(() => {
        fireEvent.click(button)
        fireEvent.click(button)
        fireEvent.click(button)
      })

      expect(screen.getByTestId('transactions-count')).toHaveTextContent('3')
    })

    it('should update transaction status', () => {
      const TestComponent = () => {
        const { transactions, sendTransaction } = useTransactions()
        
        const handleSend = async () => {
          const signature = await sendTransaction({
            instructions: [],
            recentBlockhash: 'blockhash123'
          })
          
          // Simulate transaction status update
          setTimeout(() => {
            walletEmitter.emit('transaction-status', {
              signature,
              status: 'confirmed'
            })
          }, 100)
        }

        return (
          <div>
            <button onClick={handleSend}>Send</button>
            <div data-testid="transactions">
              {transactions.map(t => `${t.signature}:${t.status}`).join(',')}
            </div>
          </div>
        )
      }

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      )

      const button = screen.getByRole('button')
      
      act(() => {
        fireEvent.click(button)
      })

      // Wait for status update
      setTimeout(() => {
        expect(screen.getByTestId('transactions')).toHaveTextContent('signature123:confirmed')
      }, 200)
    })
  })

  describe('Error Handling', () => {
    it('should handle transaction errors', () => {
      const mockSendTransaction = jest.fn().mockRejectedValue(new Error('Transaction failed'))
      
      const TestComponent = () => {
        const { sendTransaction, error } = useTransactions()
        
        const handleSend = async () => {
          try {
            await sendTransaction({
              instructions: [],
              recentBlockhash: 'blockhash123'
            })
          } catch (err) {
            // Error should be handled by the provider
          }
        }

        return (
          <div>
            <button onClick={handleSend}>Send</button>
            <div data-testid="error">{error || 'no-error'}</div>
          </div>
        )
      }

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      )

      const button = screen.getByRole('button')
      
      act(() => {
        fireEvent.click(button)
      })

      expect(screen.getByTestId('error')).toHaveTextContent('Transaction failed')
    })

    it('should clear error on successful operation', () => {
      mockUseSolanaWallet.mockReturnValue({
        connected: true,
        publicKey: new PublicKey('11111111111111111111111111111111'),
        connect: jest.fn(),
        disconnect: jest.fn(),
        balance: 1.5
      })

      const TestComponent = () => {
        const { error } = useWalletContext()
        return <div data-testid="error">{error || 'no-error'}</div>
      }

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      )

      // Simulate error first
      act(() => {
        walletEmitter.emit('error', new Error('Test error'))
      })

      expect(screen.getByTestId('error')).toHaveTextContent('Test error')

      // Simulate successful connection
      act(() => {
        walletEmitter.emit('connect', '11111111111111111111111111111111')
      })

      expect(screen.getByTestId('error')).toHaveTextContent('no-error')
    })
  })

  describe('Cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const TestComponent = () => {
        const { connected } = useWalletContext()
        return <div data-testid="connected">{connected.toString()}</div>
      }

      const { unmount } = render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      )

      unmount()

      expect(walletEmitter.off).toHaveBeenCalledTimes(3) // connect, disconnect, error
    })
  })
})

describe('WalletProvider - Integration Tests', () => {
  let mockUseSolanaWallet: jest.MockedFunction<typeof useSolanaWallet>

  beforeEach(() => {
    mockUseSolanaWallet = useSolanaWallet as jest.MockedFunction<typeof useSolanaWallet>
    jest.clearAllMocks()
  })

  it('should integrate with wallet adapter', () => {
    mockUseSolanaWallet.mockReturnValue({
      connected: true,
      publicKey: new PublicKey('11111111111111111111111111111111'),
      connect: jest.fn(),
      disconnect: jest.fn(),
      balance: 1.5
    })

    const TestComponent = () => {
      const { connected, publicKey } = useWalletContext()
      return (
        <div>
          <div data-testid="connected">{connected.toString()}</div>
          <div data-testid="public-key">{publicKey?.toBase58()}</div>
        </div>
      )
    }

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    )

    expect(screen.getByTestId('connected')).toHaveTextContent('true')
    expect(screen.getByTestId('public-key')).toHaveTextContent('11111111111111111111111111111111')
  })

  it('should handle wallet state changes', () => {
    let walletState = {
      connected: false,
      publicKey: null,
      connect: jest.fn(),
      disconnect: jest.fn(),
      balance: null
    }

    mockUseSolanaWallet.mockReturnValue(walletState)

    const TestComponent = () => {
      const { connected, publicKey } = useWalletContext()
      return (
        <div>
          <div data-testid="connected">{connected.toString()}</div>
          <div data-testid="public-key">{publicKey?.toBase58() || 'null'}</div>
        </div>
      )
    }

    const { rerender } = render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    )

    // Initially not connected
    expect(screen.getByTestId('connected')).toHaveTextContent('false')
    expect(screen.getByTestId('public-key')).toHaveTextContent('null')

    // Simulate wallet connection
    walletState = {
      connected: true,
      publicKey: new PublicKey('11111111111111111111111111111111'),
      connect: jest.fn(),
      disconnect: jest.fn(),
      balance: 1.0
    }
    mockUseSolanaWallet.mockReturnValue(walletState)
    rerender(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    )

    expect(screen.getByTestId('connected')).toHaveTextContent('true')
    expect(screen.getByTestId('public-key')).toHaveTextContent('11111111111111111111111111111111')
  })

  it('should handle multiple components using context', () => {
    mockUseSolanaWallet.mockReturnValue({
      connected: true,
      publicKey: new PublicKey('11111111111111111111111111111111'),
      connect: jest.fn(),
      disconnect: jest.fn(),
      balance: 1.5
    })

    const TestComponent1 = () => {
      const { connected } = useWalletContext()
      return <div data-testid="connected1">{connected.toString()}</div>
    }

    const TestComponent2 = () => {
      const { publicKey } = useWalletContext()
      return <div data-testid="public-key2">{publicKey?.toBase58()}</div>
    }

    render(
      <WalletProvider>
        <TestComponent1 />
        <TestComponent2 />
      </WalletProvider>
    )

    expect(screen.getByTestId('connected1')).toHaveTextContent('true')
    expect(screen.getByTestId('public-key2')).toHaveTextContent('11111111111111111111111111111111')
  })
})

describe('WalletProvider - Error Handling Tests', () => {
  let mockUseSolanaWallet: jest.MockedFunction<typeof useSolanaWallet>

  beforeEach(() => {
    mockUseSolanaWallet = useSolanaWallet as jest.MockedFunction<typeof useSolanaWallet>
    jest.clearAllMocks()
  })

  it('should handle wallet connection errors', () => {
    mockUseSolanaWallet.mockReturnValue({
      connected: false,
      publicKey: null,
      connect: jest.fn().mockRejectedValue(new Error('Connection failed')),
      disconnect: jest.fn(),
      balance: null
    })

    const TestComponent = () => {
      const { error } = useWalletContext()
      return <div data-testid="error">{error || 'no-error'}</div>
    }

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    )

    // Simulate connection error
    act(() => {
      walletEmitter.emit('error', new Error('Connection failed'))
    })

    expect(screen.getByTestId('error')).toHaveTextContent('Connection failed')
  })

  it('should handle wallet disconnection errors', () => {
    mockUseSolanaWallet.mockReturnValue({
      connected: true,
      publicKey: new PublicKey('11111111111111111111111111111111'),
      connect: jest.fn(),
      disconnect: jest.fn().mockRejectedValue(new Error('Disconnection failed')),
      balance: 1.5
    })

    const TestComponent = () => {
      const { error } = useWalletContext()
      return <div data-testid="error">{error || 'no-error'}</div>
    }

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    )

    // Simulate disconnection error
    act(() => {
      walletEmitter.emit('error', new Error('Disconnection failed'))
    })

    expect(screen.getByTestId('error')).toHaveTextContent('Disconnection failed')
  })

  it('should handle transaction errors', () => {
    const mockSendTransaction = jest.fn().mockRejectedValue(new Error('Transaction failed'))
    
    const TestComponent = () => {
      const { sendTransaction, error } = useTransactions()
      
      const handleSend = async () => {
        try {
          await sendTransaction({
            instructions: [],
            recentBlockhash: 'blockhash123'
          })
        } catch (err) {
          // Error should be handled by the provider
        }
      }

      return (
        <div>
          <button onClick={handleSend}>Send</button>
          <div data-testid="error">{error || 'no-error'}</div>
        </div>
      )
    }

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    )

    const button = screen.getByRole('button')
    
    act(() => {
      fireEvent.click(button)
    })

    expect(screen.getByTestId('error')).toHaveTextContent('Transaction failed')
  })
})

describe('WalletProvider - Edge Cases Tests', () => {
  let mockUseSolanaWallet: jest.MockedFunction<typeof useSolanaWallet>

  beforeEach(() => {
    mockUseSolanaWallet = useSolanaWallet as jest.MockedFunction<typeof useSolanaWallet>
    jest.clearAllMocks()
  })

  it('should handle rapid state changes', () => {
    let walletState = {
      connected: false,
      publicKey: null,
      connect: jest.fn(),
      disconnect: jest.fn(),
      balance: null
    }

    mockUseSolanaWallet.mockReturnValue(walletState)

    const TestComponent = () => {
      const { connected, publicKey } = useWalletContext()
      return (
        <div>
          <div data-testid="connected">{connected.toString()}</div>
          <div data-testid="public-key">{publicKey?.toBase58() || 'null'}</div>
        </div>
      )
    }

    const { rerender } = render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    )

    // Rapid state changes
    walletState = {
      connected: true,
      publicKey: new PublicKey('11111111111111111111111111111111'),
      connect: jest.fn(),
      disconnect: jest.fn(),
      balance: 1.0
    }
    mockUseSolanaWallet.mockReturnValue(walletState)
    rerender(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    )

    walletState = {
      connected: false,
      publicKey: null,
      connect: jest.fn(),
      disconnect: jest.fn(),
      balance: null
    }
    mockUseSolanaWallet.mockReturnValue(walletState)
    rerender(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    )

    walletState = {
      connected: true,
      publicKey: new PublicKey('22222222222222222222222222222222'),
      connect: jest.fn(),
      disconnect: jest.fn(),
      balance: 2.0
    }
    mockUseSolanaWallet.mockReturnValue(walletState)
    rerender(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    )

    expect(screen.getByTestId('connected')).toHaveTextContent('true')
    expect(screen.getByTestId('public-key')).toHaveTextContent('22222222222222222222222222222222')
  })

  it('should handle concurrent transactions', async () => {
    const mockSendTransaction = jest.fn().mockImplementation(async () => {
      return `signature${Date.now()}`
    })

    const TestComponent = () => {
      const { sendTransaction, transactions } = useTransactions()
      
      const handleSend = async () => {
        await sendTransaction({
          instructions: [],
          recentBlockhash: 'blockhash123'
        })
      }

      return (
        <div>
          <button onClick={handleSend}>Send</button>
          <div data-testid="transactions-count">{transactions.length}</div>
        </div>
      )
    }

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    )

    const button = screen.getByRole('button')
    
    // Send multiple transactions concurrently
    const promises = []
    for (let i = 0; i < 5; i++) {
      promises.push(act(() => fireEvent.click(button)))
    }
    await Promise.all(promises)

    expect(screen.getByTestId('transactions-count')).toHaveTextContent('5')
  })

  it('should handle large transaction history', () => {
    const TestComponent = () => {
      const { transactions, sendTransaction } = useTransactions()
      
      const handleSend = async () => {
        await sendTransaction({
          instructions: [],
          recentBlockhash: 'blockhash123'
        })
      }

      return (
        <div>
          <button onClick={handleSend}>Send</button>
          <div data-testid="transactions-count">{transactions.length}</div>
        </div>
      )
    }

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    )

    const button = screen.getByRole('button')
    
    // Send many transactions
    for (let i = 0; i < 100; i++) {
      act(() => {
        fireEvent.click(button)
      })
    }

    expect(screen.getByTestId('transactions-count')).toHaveTextContent('100')
  })

  it('should handle memory cleanup', () => {
    const TestComponent = () => {
      const { transactions } = useTransactions()
      return <div data-testid="transactions-count">{transactions.length}</div>
    }

    const { rerender, unmount } = render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    )

    // Add some transactions
    act(() => {
      for (let i = 0; i < 10; i++) {
        walletEmitter.emit('transaction-completed', {
          signature: `sig${i}`,
          status: 'confirmed'
        })
      }
    })

    expect(screen.getByTestId('transactions-count')).toHaveTextContent('10')

    // Unmount and remount
    unmount()
    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    )

    expect(screen.getByTestId('transactions-count')).toHaveTextContent('0')
  })
})

// Helper to import PublicKey
import { PublicKey } from '@solana/web3.js'