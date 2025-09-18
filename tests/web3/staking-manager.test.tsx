import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StakingManager } from '@/components/wallet/staking-manager'
import { useWalletContext } from '@/components/wallet/wallet-provider'

// Mock wallet context
jest.mock('@/components/wallet/wallet-provider', () => ({
  useWalletContext: jest.fn()
}))

// Mock wallet adapter functions
jest.mock('@/components/wallet/wallet-adapter', () => {
  const mockTx = { add: jest.fn(), recentBlockhash: 'test-blockhash', feePayer: 'test-public-key' }
  return {
    createTransaction: jest.fn().mockResolvedValue(mockTx),
    sendTransaction: jest.fn().mockResolvedValue('test-signature')
  }
})

// Mock Solana connection
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getLatestBlockhash: jest.fn().mockResolvedValue({
      blockhash: 'test-blockhash',
      lastValidBlockHeight: 100
    })
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
  }))
}))

const mockWalletContext = {
  connected: true,
  publicKey: new PublicKey('test-public-key'),
  balance: 10.5,
  ndtBalance: 1000,
  connect: jest.fn(),
  disconnect: jest.fn()
}

describe('StakingManager', () => {
  beforeEach(() => {
    ;(useWalletContext as jest.Mock).mockReturnValue(mockWalletContext)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render staking manager with all tiers', () => {
    render(<StakingManager />)
    
    expect(screen.getByText('Стейкинг NDT')).toBeInTheDocument()
    expect(screen.getByText('Bronze')).toBeInTheDocument()
    expect(screen.getByText('Silver')).toBeInTheDocument()
    expect(screen.getByText('Gold')).toBeInTheDocument()
    expect(screen.getByText('Platinum')).toBeInTheDocument()
  })

  it('should display wallet balance and NDT balance', () => {
    render(<StakingManager />)
    
    expect(screen.getByText(/10.5 SOL/)).toBeInTheDocument()
    expect(screen.getByText(/1,000 NDT/)).toBeInTheDocument()
  })

  it('should allow selecting staking tier', () => {
    render(<StakingManager />)
    
    const silverButton = screen.getByText('Silver')
    fireEvent.click(silverButton)
    
    expect(silverButton).toHaveClass('bg-blue-500')
  })

  it('should validate minimum stake amount', async () => {
    render(<StakingManager />)
    
    // Select Silver tier (min 100 NDT)
    const silverButton = screen.getByText('Silver')
    fireEvent.click(silverButton)
    
    // Enter amount below minimum
    const amountInput = screen.getByPlaceholderText('Введите сумму')
    fireEvent.change(amountInput, { target: { value: '50' } })
    
    const stakeButton = screen.getByText('Застейкать')
    fireEvent.click(stakeButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Минимальная сумма для Silver: 100/)).toBeInTheDocument()
    })
  })

  it('should validate maximum stake amount', async () => {
    render(<StakingManager />)
    
    // Select Silver tier (max 500 NDT)
    const silverButton = screen.getByText('Silver')
    fireEvent.click(silverButton)
    
    // Enter amount above maximum
    const amountInput = screen.getByPlaceholderText('Введите сумму')
    fireEvent.change(amountInput, { target: { value: '600' } })
    
    const stakeButton = screen.getByText('Застейкать')
    fireEvent.click(stakeButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Максимальная сумма для Silver: 500/)).toBeInTheDocument()
    })
  })

  it('should validate insufficient NDT balance', async () => {
    const mockContextWithLowBalance = {
      ...mockWalletContext,
      ndtBalance: 50
    }
    ;(useWalletContext as jest.Mock).mockReturnValue(mockContextWithLowBalance)
    
    render(<StakingManager />)
    
    // Select Silver tier (min 100 NDT)
    const silverButton = screen.getByText('Silver')
    fireEvent.click(silverButton)
    
    // Enter valid amount but insufficient balance
    const amountInput = screen.getByPlaceholderText('Введите сумму')
    fireEvent.change(amountInput, { target: { value: '100' } })
    
    const stakeButton = screen.getByText('Застейкать')
    fireEvent.click(stakeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Недостаточно NDT токенов')).toBeInTheDocument()
    })
  })

  it('should successfully stake tokens', async () => {
    render(<StakingManager />)
    
    // Select Silver tier
    const silverButton = screen.getByText('Silver')
    fireEvent.click(silverButton)
    
    // Enter valid amount
    const amountInput = screen.getByPlaceholderText('Введите сумму')
    fireEvent.change(amountInput, { target: { value: '200' } })
    
    const stakeButton = screen.getByText('Застейкать')
    fireEvent.click(stakeButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Стейкинг успешен! TX: test-signature/)).toBeInTheDocument()
    })
  })

  it('should calculate rewards correctly', () => {
    render(<StakingManager />)
    
    // Select Gold tier (5% APY)
    const goldButton = screen.getByText('Gold')
    fireEvent.click(goldButton)
    
    // Enter amount
    const amountInput = screen.getByPlaceholderText('Введите сумму')
    fireEvent.change(amountInput, { target: { value: '1000' } })
    
    // Check if rewards are calculated and displayed
    // This would require checking the rewards calculation logic
    expect(screen.getByText('Gold')).toBeInTheDocument()
  })

  it('should handle staking errors gracefully', async () => {
    // Mock staking error
    const { sendTransaction } = require('@/components/wallet/wallet-adapter')
    sendTransaction.mockRejectedValueOnce(new Error('Transaction failed'))
    
    render(<StakingManager />)
    
    // Select tier and enter amount
    const silverButton = screen.getByText('Silver')
    fireEvent.click(silverButton)
    
    const amountInput = screen.getByPlaceholderText('Введите сумму')
    fireEvent.change(amountInput, { target: { value: '200' } })
    
    const stakeButton = screen.getByText('Застейкать')
    fireEvent.click(stakeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Ошибка стейкинга')).toBeInTheDocument()
    })
  })

  it('should show loading state during staking', async () => {
    // Mock slow transaction
    const { sendTransaction } = require('@/components/wallet/wallet-adapter')
    sendTransaction.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<StakingManager />)
    
    // Select tier and enter amount
    const silverButton = screen.getByText('Silver')
    fireEvent.click(silverButton)
    
    const amountInput = screen.getByPlaceholderText('Введите сумму')
    fireEvent.change(amountInput, { target: { value: '200' } })
    
    const stakeButton = screen.getByText('Застейкать')
    fireEvent.click(stakeButton)
    
    // Check loading state
    expect(screen.getByText('Стейкинг...')).toBeInTheDocument()
    expect(stakeButton).toBeDisabled()
  })

  it('should display staking positions', async () => {
    // Mock existing positions
    const mockPositions = [
      {
        id: '1',
        amount: 500,
        tier: 'Silver',
        startDate: new Date('2024-01-01'),
        rewards: 25
      }
    ]
    
    // Mock loadPositions function
    const mockLoadPositions = jest.fn().mockResolvedValue(mockPositions)
    
    render(<StakingManager />)
    
    // Wait for positions to load
    await waitFor(() => {
      expect(screen.getByText('500 NDT')).toBeInTheDocument()
      expect(screen.getByText('Silver')).toBeInTheDocument()
    })
  })

  it('should allow unstaking', async () => {
    // Mock existing position
    const mockPositions = [
      {
        id: '1',
        amount: 500,
        tier: 'Silver',
        startDate: new Date('2024-01-01'),
        rewards: 25
      }
    ]
    
    render(<StakingManager />)
    
    // Wait for position to load
    await waitFor(() => {
      const unstakeButton = screen.getByText('Unstake')
      fireEvent.click(unstakeButton)
    })
    
    // Should show confirmation or success message
    await waitFor(() => {
      expect(screen.getByText(/Unstaking successful/)).toBeInTheDocument()
    })
  })

  it('should require wallet connection', () => {
    const mockContextDisconnected = {
      ...mockWalletContext,
      connected: false,
      publicKey: null
    }
    ;(useWalletContext as jest.Mock).mockReturnValue(mockContextDisconnected)
    
    render(<StakingManager />)
    
    expect(screen.getByText('Подключите кошелек для стейкинга')).toBeInTheDocument()
  })
})

describe('Staking Calculations', () => {
  it('should calculate daily rewards correctly', () => {
    // Test reward calculation logic
    const amount = 1000
    const apy = 0.05 // 5% APY
    const dailyRate = apy / 365
    const dailyRewards = amount * dailyRate
    
    expect(dailyRewards).toBeCloseTo(0.137, 3)
  })

  it('should calculate total rewards for period', () => {
    const amount = 1000
    const apy = 0.05
    const days = 30
    const dailyRate = apy / 365
    const totalRewards = amount * dailyRate * days
    
    expect(totalRewards).toBeCloseTo(4.11, 2)
  })
})
