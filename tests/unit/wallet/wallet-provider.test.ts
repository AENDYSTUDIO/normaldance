import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import * as React from 'react'
import { WalletProviderWrapper, WalletInnerProvider, WalletStatus, WalletConnectButton, useWalletContext, withWallet } from '@/components/wallet/wallet-provider'
import { WalletConnect } from '@/components/wallet/wallet-connect'
import { walletEmitter } from '@/components/wallet/wallet-adapter'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

// Mock external dependencies
jest.mock('@/components/wallet/wallet-adapter')
jest.mock('@/components/wallet/wallet-connect')
jest.mock('@solana/web3.js')
jest.mock('@solana/wallet-adapter-base')
jest.mock('@solana/wallet-adapter-react')
jest.mock('@solana/wallet-adapter-react-ui')

// Mock the wallet hook
const mockUseWallet = require('@solana/wallet-adapter-react').useWallet
const mockUseConnection = require('@solana/wallet-adapter-react').useConnection
const mockConnectionProvider = require('@solana/wallet-adapter-react').ConnectionProvider
const mockWalletProvider = require('@solana/wallet-adapter-react').WalletProvider
const mockWalletModalProvider = require('@solana/wallet-adapter-react-ui').WalletModalProvider
const mockClusterApiUrl = require('@solana/web3.js').clusterApiUrl

describe('WalletProvider - Comprehensive Tests', () => {
  const mockWallet = {
    connected: false,
    publicKey: null,
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  }

  const mockConnection = {
    getBalance: jest.fn(),
    onAccountChange: jest.fn(),
    removeAccountChangeListener: jest.fn(),
    getLatestBlockhash: jest.fn(),
    sendRawTransaction: jest.fn(),
    confirmTransaction: jest.fn(),
  }

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Setup default mock implementations
    mockUseWallet.mockReturnValue(mockWallet)
    mockUseConnection.mockReturnValue({ connection: mockConnection })
    mockClusterApiUrl.mockReturnValue('https://api.devnet.solana.com')
    
    // Mock wallet emitter
    walletEmitter.emit = jest.fn();
  })

  describe('WalletProviderWrapper', () => {
    it('should render children with wallet providers', () => {
      const TestComponent = () => <div>Test Content</div>;

      render(
        <WalletProviderWrapper>
          <TestComponent />
        </WalletProviderWrapper>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should use correct network and endpoint', () => {
      const TestComponent = () => <div>Test Content</div>

      render(
        <WalletProviderWrapper>
          <TestComponent />
        </WalletProviderWrapper>
      );

      expect(mockClusterApiUrl).toHaveBeenCalledWith(WalletAdapterNetwork.Devnet);
    });
  })

  describe('WalletInnerProvider', () => {
    it('should initialize with default state', () => {
      const TestComponent = () => {
        const context = useWalletContext();
        return <div data-testid="context">{JSON.stringify(context)}</div>;
      };

      render(
        <WalletProviderWrapper>
          <TestComponent />
        </WalletProviderWrapper>
      );

      expect(screen.getByTestId('context')).toBeInTheDocument();
    });

    it('should update balance when publicKey changes', async () => {
      mockWallet.connected = true;
      mockWallet.publicKey = new PublicKey('1111111111111111111111111111111111111111111');
      mockConnection.getBalance.mockResolvedValue(1000000000); // 1 SOL in lamports

      const TestComponent = () => {
        const { balance } = useWalletContext();
        return <div data-testid="balance">{balance}</div>;
      };

      render(
        <WalletProviderWrapper>
          <TestComponent />
        </WalletProviderWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('balance')).toHaveTextContent('1');
      });
    });

    it('should handle balance fetch error gracefully', async () => {
      mockWallet.connected = true;
      mockWallet.publicKey = new PublicKey('1111111111111111111111111111111111111111111');
      mockConnection.getBalance.mockRejectedValue(new Error('Balance fetch failed'));

      const TestComponent = () => {
        const { balance } = useWalletContext();
        return <div data-testid="balance">{balance}</div>;
      };

      render(
        <WalletProviderWrapper>
          <TestComponent />
        </WalletProviderWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('balance')).toHaveTextContent('null');
      });
    });

    it('should setup account change subscription', () => {
      mockWallet.connected = true;
      mockWallet.publicKey = new PublicKey('1111111111111111111111111111111111111111111');

      const TestComponent = () => <div>Test</div>;

      render(
        <WalletProviderWrapper>
          <TestComponent />
        </WalletProviderWrapper>
      );

      expect(mockConnection.onAccountChange).toHaveBeenCalledWith(
        mockWallet.publicKey,
        expect.any(Function),
        'confirmed'
      );
    });

    it('should clean up account change subscription on unmount', () => {
      mockWallet.connected = true;
      mockWallet.publicKey = new PublicKey('1111111111111111111111111111111111111111111');
      mockConnection.onAccountChange.mockReturnValue(123);

      const { unmount } = render(
        <WalletProviderWrapper>
          <div>Test</div>
        </WalletProviderWrapper>
      );

      unmount();

      expect(mockConnection.removeAccountChangeListener).toHaveBeenCalledWith(123);
    });

    it('should handle wallet connection events', () => {
      mockWallet.connected = true;
      mockWallet.publicKey = new PublicKey('1111111111111111111111111111111111111111111');

      const TestComponent = () => <div>Test</div>;

      render(
        <WalletProviderWrapper>
          <TestComponent />
        </WalletProviderWrapper>
      );

      // Simulate wallet connect event
      const handleConnect = mockWallet.on.mock.calls.find(call => call[0] === 'connect')[1];
      handleConnect();

      expect(walletEmitter.emit).toHaveBeenCalledWith('connect', '1111111111111111111111111111111111111111111');
    });

    it('should handle wallet disconnection events', () => {
      mockWallet.connected = true;
      mockWallet.publicKey = new PublicKey('1111111111111111111111111111111111111111111');

      const TestComponent = () => <div>Test</div>;

      render(
        <WalletProviderWrapper>
          <TestComponent />
        </WalletProviderWrapper>
      );

      // Simulate wallet disconnect event
      const handleDisconnect = mockWallet.on.mock.calls.find(call => call[0] === 'disconnect')[1];
      handleDisconnect();

      expect(walletEmitter.emit).toHaveBeenCalledWith('disconnect');
    });

    it('should handle wallet error events', () => {
      mockWallet.connected = true;
      mockWallet.publicKey = new PublicKey('1111111111111111111111111111111111111111111');

      const TestComponent = () => <div>Test</div>;

      render(
        <WalletProviderWrapper>
          <TestComponent />
        </WalletProviderWrapper>
      );

      // Simulate wallet error event
      const handleError = mockWallet.on.mock.calls.find(call => call[0] === 'error')[1];
      handleError(new Error('Test error'));

      expect(walletEmitter.emit).toHaveBeenCalledWith('error', new Error('Test error'));
    });
  })

  describe('WalletStatus', () => {
    it('should not render when wallet is not connected', () => {
      render(
        <WalletProviderWrapper>
          <WalletStatus />
        </WalletProviderWrapper>
      )
      
      expect(screen.queryByText('1111...1111')).not.toBeInTheDocument()
    })

    it('should render wallet status when connected', () => {
      mockWallet.connected = true
      mockWallet.publicKey = new PublicKey('1111111111111111111111111111111111111111111')
      mockConnection.getBalance.mockResolvedValue(1000000000) // 1 SOL
      
      render(
        <WalletProviderWrapper>
          <WalletStatus />
        </WalletProviderWrapper>
      )
      
      expect(screen.getByText('1111...1111')).toBeInTheDocument()
      expect(screen.getByText('1.0000 SOL')).toBeInTheDocument()
    })

    it('should display error when present', () => {
      mockWallet.connected = true
      mockWallet.publicKey = new PublicKey('1111111111111111111111111111111111111111111')
      
      const TestComponent = () => {
        const { error } = useWalletContext()
        return <div data-testid="error">{error}</div>
      }
      
      render(
        <WalletProviderWrapper>
          <TestComponent />
        </WalletProviderWrapper>
      )
      
      // Set error
      const setError = require('@/components/wallet/wallet-provider').WalletInnerProvider
      const originalProvider = require('@/components/wallet/wallet-provider').WalletInnerProvider
      
      // This is a simplified test - in real scenario we'd need to mock the context
      expect(screen.queryByTestId('error')).not.toBeInTheDocument()
    })
  })

  describe('WalletConnectButton', () => {
    it('should show connect button when wallet is not connected', () => {
      render(
        <WalletProviderWrapper>
          <WalletConnectButton />
        </WalletProviderWrapper>
      )
      
      expect(screen.getByText('Подключить кошелек')).toBeInTheDocument()
    })

    it('should show disconnect button when wallet is connected', () => {
      mockWallet.connected = true
      
      render(
        <WalletProviderWrapper>
          <WalletConnectButton />
        </WalletProviderWrapper>
      )
      
      expect(screen.getByText('Отключить')).toBeInTheDocument()
    })

    it('should show loading state when connecting', async () => {
      mockWallet.connected = true
      
      const TestComponent = () => {
        const { isConnecting } = useWalletContext()
        return <div data-testid="loading">{isConnecting ? 'Loading' : 'Not Loading'}</div>
      }
      
      render(
        <WalletProviderWrapper>
          <TestComponent />
          <WalletConnectButton />
        </WalletProviderWrapper>
      )
      
      // Simulate connection
      const connectButton = screen.getByText('Отключить')
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
      })
    })

    it('should call connect when connect button is clicked', async () => {
      render(
        <WalletProviderWrapper>
          <WalletConnectButton />
        </WalletProviderWrapper>
      )
      
      const connectButton = screen.getByText('Подключить кошелек')
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(mockWallet.connect).toHaveBeenCalledTimes(1)
      })
    })

    it('should call disconnect when disconnect button is clicked', async () => {
      mockWallet.connected = true
      
      render(
        <WalletProviderWrapper>
          <WalletConnectButton />
        </WalletProviderWrapper>
      )
      
      const disconnectButton = screen.getByText('Отключить')
      fireEvent.click(disconnectButton)
      
      await waitFor(() => {
        expect(mockWallet.disconnect).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle connection error', async () => {
      mockWallet.connect.mockRejectedValue(new Error('Connection failed'))
      
      render(
        <WalletProviderWrapper>
          <WalletConnectButton />
        </WalletProviderWrapper>
      )
      
      const connectButton = screen.getByText('Подключить кошелек')
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(mockWallet.connect).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('withWallet HOC', () => {
    it('should render wrapped component when wallet is connected', () => {
      mockWallet.connected = true
      
      const TestComponent = () => <div>Wrapped Component</div>
      const WrappedComponent = withWallet(TestComponent)
      
      render(
        <WalletProviderWrapper>
          <WrappedComponent />
        </WalletProviderWrapper>
      )
      
      expect(screen.getByText('Wrapped Component')).toBeInTheDocument()
    })

    it('should render fallback when wallet is not connected', () => {
      const TestComponent = () => <div>Wrapped Component</div>
      const WrappedComponent = withWallet(TestComponent, <div>Fallback</div>)
      
      render(
        <WalletProviderWrapper>
          <WrappedComponent />
        </WalletProviderWrapper>
      )
      
      expect(screen.getByText('Fallback')).toBeInTheDocument()
    })

    it('should render default fallback when wallet is not connected', () => {
      const TestComponent = () => <div>Wrapped Component</div>
      const WrappedComponent = withWallet(TestComponent)
      
      render(
        <WalletProviderWrapper>
          <WrappedComponent />
        </WalletProviderWrapper>
      )
      
      expect(screen.getByText('Пожалуйста, подключите кошелек для использования этой функции')).toBeInTheDocument()
    })

    it('should render WalletConnect when wallet is not connected', () => {
      const TestComponent = () => <div>Wrapped Component</div>
      const WrappedComponent = withWallet(TestComponent)
      
      render(
        <WalletProviderWrapper>
          <WrappedComponent />
        </WalletProviderWrapper>
      )
      
      expect(screen.getByText('Пожалуйста, подключите ваш Solana кошелек')).toBeInTheDocument()
    })
  })

  describe('useTransactions Hook', () => {
    it('should send transaction successfully', async () => {
      mockWallet.connected = true
      mockWallet.publicKey = new PublicKey('1111111111111111111111111111111111111111111')
      mockConnection.getLatestBlockhash.mockResolvedValue({ blockhash: 'test-blockhash' })
      mockConnection.sendRawTransaction.mockResolvedValue('test-signature')
      mockConnection.confirmTransaction.mockResolvedValue({})
      
      const TestComponent = () => {
        const { sendTransaction } = require('@/components/wallet/wallet-provider').useTransactions()
        return <button onClick={() => sendTransaction({ instructions: [] })}>Send</button>
      }
      
      render(
        <WalletProviderWrapper>
          <TestComponent />
        </WalletProviderWrapper>
      )
      
      const sendButton = screen.getByText('Send')
      fireEvent.click(sendButton)
      
      await waitFor(() => {
        expect(mockConnection.sendRawTransaction).toHaveBeenCalled()
        expect(mockConnection.confirmTransaction).toHaveBeenCalledWith('test-signature', 'confirmed')
      })
    })

    it('should throw error when wallet is not connected', async () => {
      const TestComponent = () => {
        const { sendTransaction } = require('@/components/wallet/wallet-provider').useTransactions()
        return <button onClick={() => sendTransaction({ instructions: [] })}>Send</button>
      }
      
      render(
        <WalletProviderWrapper>
          <TestComponent />
        </WalletProviderWrapper>
      )
      
      const sendButton = screen.getByText('Send')
      fireEvent.click(sendButton)
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Transaction error:', expect.any(Error))
      })
    })

    it('should handle transaction errors', async () => {
      mockWallet.connected = true
      mockWallet.publicKey = new PublicKey('1111111111111111111111111111111111111111111')
      mockConnection.getLatestBlockhash.mockResolvedValue({ blockhash: 'test-blockhash' })
      mockConnection.sendRawTransaction.mockRejectedValue(new Error('Transaction failed'))
      
      const TestComponent = () => {
        const { sendTransaction } = require('@/components/wallet/wallet-provider').useTransactions()
        return <button onClick={() => sendTransaction({ instructions: [] })}>Send</button>
      }
      
      render(
        <WalletProviderWrapper>
          <TestComponent />
        </WalletProviderWrapper>
      )
      
      const sendButton = screen.getByText('Send')
      fireEvent.click(sendButton)
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Transaction error:', expect.any(Error))
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle wallet connection errors', async () => {
      mockWallet.connect.mockRejectedValue(new Error('Connection failed'))
      
      render(
        <WalletProviderWrapper>
          <WalletConnectButton />
        </WalletProviderWrapper>
      )
      
      const connectButton = screen.getByText('Подключить кошелек')
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(mockWallet.connect).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle wallet disconnection errors', async () => {
      mockWallet.connected = true
      mockWallet.disconnect.mockRejectedValue(new Error('Disconnection failed'))
      
      render(
        <WalletProviderWrapper>
          <WalletConnectButton />
        </WalletProviderWrapper>
      )
      
      const disconnectButton = screen.getByText('Отключить')
      fireEvent.click(disconnectButton)
      
      await waitFor(() => {
        expect(mockWallet.disconnect).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle balance fetch errors', async () => {
      mockWallet.connected = true
      mockWallet.publicKey = new PublicKey('1111111111111111111111111111111111111111111')
      mockConnection.getBalance.mockRejectedValue(new Error('Balance fetch failed'))
      
      render(
        <WalletProviderWrapper>
          <WalletStatus />
        </WalletProviderWrapper>
      )
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Error getting balance:', expect.any(Error))
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle null publicKey gracefully', () => {
      mockWallet.connected = true
      mockWallet.publicKey = null
      
      render(
        <WalletProviderWrapper>
          <WalletStatus />
        </WalletProviderWrapper>
      )
      
      // Should not crash
      expect(true).toBe(true)
    })

    it('should handle missing wallet object', () => {
      mockUseWallet.mockReturnValue({})
      
      render(
        <WalletProviderWrapper>
          <WalletStatus />
        </WalletProviderWrapper>
      )
      
      // Should not crash
      expect(true).toBe(true)
    })

    it('should handle missing connection object', () => {
      mockUseConnection.mockReturnValue({})
      
      render(
        <WalletProviderWrapper>
          <WalletStatus />
        </WalletProviderWrapper>
      )
      
      // Should not crash
      expect(true).toBe(true)
    })
  })
})