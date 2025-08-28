import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WalletAdapter } from '../wallet-adapter'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'

// Mock dependencies
jest.mock('@solana/web3.js')
jest.mock('@solana/wallet-adapter-phantom')
jest.mock('@solana/wallet-adapter-base')

describe('WalletAdapter', () => {
  const mockWallet = {
    publicKey: new Uint8Array(32),
    signTransaction: jest.fn(),
    signAllTransactions: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders wallet connection button when not connected', () => {
    render(<WalletAdapter />)
    const connectButton = screen.getByText('Connect Wallet')
    expect(connectButton).toBeInTheDocument()
  })

  it('shows wallet address when connected', async () => {
    render(<WalletAdapter wallet={mockWallet} />)
    
    // Simulate connection
    fireEvent.click(screen.getByText('Connect Wallet'))
    
    await waitFor(() => {
      expect(screen.getByText(/0x/)).toBeInTheDocument()
    })
  })

  it('calls connect when connect button is clicked', async () => {
    render(<WalletAdapter />)
    
    fireEvent.click(screen.getByText('Connect Wallet'))
    
    await waitFor(() => {
      expect(mockWallet.connect).toHaveBeenCalled()
    })
  })

  it('calls disconnect when disconnect button is clicked', async () => {
    render(<WalletAdapter wallet={mockWallet} />)
    
    // Simulate connection first
    fireEvent.click(screen.getByText('Connect Wallet'))
    await waitFor(() => {
      expect(mockWallet.connect).toHaveBeenCalled()
    })
    
    // Then disconnect
    fireEvent.click(screen.getByText('Disconnect'))
    
    await waitFor(() => {
      expect(mockWallet.disconnect).toHaveBeenCalled()
    })
  })

  it('shows loading state during connection', async () => {
    render(<WalletAdapter />)
    
    fireEvent.click(screen.getByText('Connect Wallet'))
    
    expect(screen.getByText('Connecting...')).toBeInTheDocument()
  })

  it('shows error message when connection fails', async () => {
    mockWallet.connect.mockRejectedValue(new Error('Connection failed'))
    
    render(<WalletAdapter />)
    
    fireEvent.click(screen.getByText('Connect Wallet'))
    
    await waitFor(() => {
      expect(screen.getByText('Failed to connect wallet')).toBeInTheDocument()
    })
  })

  it('displays wallet balance when available', async () => {
    mockWallet.publicKey.toString = () => 'test-address'
    
    render(<WalletAdapter wallet={mockWallet} balance={1.5} />)
    
    await waitFor(() => {
      expect(screen.getByText('1.5 SOL')).toBeInTheDocument()
    })
  })

  it('handles wallet events correctly', () => {
    const mockOn = jest.fn()
    mockWallet.on = mockOn
    
    render(<WalletAdapter wallet={mockWallet} />)
    
    expect(mockOn).toHaveBeenCalledWith('connect', expect.any(Function))
    expect(mockOn).toHaveBeenCalledWith('disconnect', expect.any(Function))
  })
})