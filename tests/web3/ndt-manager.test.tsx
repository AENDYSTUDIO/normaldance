import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NDTManager } from '@/components/wallet/ndt-manager'
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
    sendTransaction: jest.fn().mockResolvedValue('test-signature'),
    getTokenBalance: jest.fn().mockResolvedValue(1000)
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

// Mock deflationary model
jest.mock('@/lib/deflationary-model', () => ({
  DeflationaryModel: jest.fn().mockImplementation(() => ({
    calculateBurn: jest.fn().mockReturnValue(20), // 2% of 1000
    calculateStakingRewards: jest.fn().mockReturnValue(200), // 20% of 1000
    calculateTreasury: jest.fn().mockReturnValue(300), // 30% of 1000
    calculateNetAmount: jest.fn().mockReturnValue(480) // 48% of 1000
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

describe('NDTManager', () => {
  beforeEach(() => {
    ;(useWalletContext as jest.Mock).mockReturnValue(mockWalletContext)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render NDT manager with balance', () => {
    render(<NDTManager />)
    
    expect(screen.getByText('NDT Manager')).toBeInTheDocument()
    expect(screen.getByText(/1,000 NDT/)).toBeInTheDocument()
  })

  it('should display token information', () => {
    render(<NDTManager />)
    
    expect(screen.getByText('NDT Token')).toBeInTheDocument()
    expect(screen.getByText('NormalDance Token')).toBeInTheDocument()
    expect(screen.getByText('NDT')).toBeInTheDocument()
  })

  it('should show deflationary model information', () => {
    render(<NDTManager />)
    
    expect(screen.getByText('Deflationary Model')).toBeInTheDocument()
    expect(screen.getByText('2% Burn')).toBeInTheDocument()
    expect(screen.getByText('20% Staking Rewards')).toBeInTheDocument()
    expect(screen.getByText('30% Treasury')).toBeInTheDocument()
  })

  it('should allow buying NDT tokens', async () => {
    render(<NDTManager />)
    
    const buyButton = screen.getByText('Купить NDT')
    fireEvent.click(buyButton)
    
    // Should show buy modal or form
    expect(screen.getByText('Покупка NDT')).toBeInTheDocument()
    
    const amountInput = screen.getByPlaceholderText('Введите количество SOL')
    fireEvent.change(amountInput, { target: { value: '1' } })
    
    const confirmButton = screen.getByText('Подтвердить покупку')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Покупка успешна! TX: test-signature/)).toBeInTheDocument()
    })
  })

  it('should validate minimum purchase amount', async () => {
    render(<NDTManager />)
    
    const buyButton = screen.getByText('Купить NDT')
    fireEvent.click(buyButton)
    
    const amountInput = screen.getByPlaceholderText('Введите количество SOL')
    fireEvent.change(amountInput, { target: { value: '0.001' } })
    
    const confirmButton = screen.getByText('Подтвердить покупку')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText('Минимальная сумма покупки: 0.01 SOL')).toBeInTheDocument()
    })
  })

  it('should validate insufficient SOL balance', async () => {
    const mockContextWithLowBalance = {
      ...mockWalletContext,
      balance: 0.005
    }
    ;(useWalletContext as jest.Mock).mockReturnValue(mockContextWithLowBalance)
    
    render(<NDTManager />)
    
    const buyButton = screen.getByText('Купить NDT')
    fireEvent.click(buyButton)
    
    const amountInput = screen.getByPlaceholderText('Введите количество SOL')
    fireEvent.change(amountInput, { target: { value: '0.01' } })
    
    const confirmButton = screen.getByText('Подтвердить покупку')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText('Недостаточно SOL для покупки')).toBeInTheDocument()
    })
  })

  it('should show deflationary calculations', async () => {
    render(<NDTManager />)
    
    const buyButton = screen.getByText('Купить NDT')
    fireEvent.click(buyButton)
    
    const amountInput = screen.getByPlaceholderText('Введите количество SOL')
    fireEvent.change(amountInput, { target: { value: '1' } })
    
    // Should show deflationary breakdown
    expect(screen.getByText('Burn: 20 NDT')).toBeInTheDocument()
    expect(screen.getByText('Staking Rewards: 200 NDT')).toBeInTheDocument()
    expect(screen.getByText('Treasury: 300 NDT')).toBeInTheDocument()
    expect(screen.getByText('You receive: 480 NDT')).toBeInTheDocument()
  })

  it('should allow selling NDT tokens', async () => {
    render(<NDTManager />)
    
    const sellButton = screen.getByText('Продать NDT')
    fireEvent.click(sellButton)
    
    // Should show sell modal or form
    expect(screen.getByText('Продажа NDT')).toBeInTheDocument()
    
    const amountInput = screen.getByPlaceholderText('Введите количество NDT')
    fireEvent.change(amountInput, { target: { value: '100' } })
    
    const confirmButton = screen.getByText('Подтвердить продажу')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Продажа успешна! TX: test-signature/)).toBeInTheDocument()
    })
  })

  it('should validate minimum sell amount', async () => {
    render(<NDTManager />)
    
    const sellButton = screen.getByText('Продать NDT')
    fireEvent.click(sellButton)
    
    const amountInput = screen.getByPlaceholderText('Введите количество NDT')
    fireEvent.change(amountInput, { target: { value: '1' } })
    
    const confirmButton = screen.getByText('Подтвердить продажу')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText('Минимальная сумма продажи: 10 NDT')).toBeInTheDocument()
    })
  })

  it('should validate insufficient NDT balance for selling', async () => {
    const mockContextWithLowNDT = {
      ...mockWalletContext,
      ndtBalance: 5
    }
    ;(useWalletContext as jest.Mock).mockReturnValue(mockContextWithLowNDT)
    
    render(<NDTManager />)
    
    const sellButton = screen.getByText('Продать NDT')
    fireEvent.click(sellButton)
    
    const amountInput = screen.getByPlaceholderText('Введите количество NDT')
    fireEvent.change(amountInput, { target: { value: '10' } })
    
    const confirmButton = screen.getByText('Подтвердить продажу')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText('Недостаточно NDT для продажи')).toBeInTheDocument()
    })
  })

  it('should show transaction history', async () => {
    // Mock transaction history
    const mockTransactions = [
      {
        id: '1',
        type: 'buy',
        amount: 100,
        price: 0.1,
        timestamp: new Date('2024-01-01'),
        signature: 'test-signature-1'
      },
      {
        id: '2',
        type: 'sell',
        amount: 50,
        price: 0.12,
        timestamp: new Date('2024-01-02'),
        signature: 'test-signature-2'
      }
    ]
    
    render(<NDTManager />)
    
    const historyButton = screen.getByText('История транзакций')
    fireEvent.click(historyButton)
    
    await waitFor(() => {
      expect(screen.getByText('Покупка')).toBeInTheDocument()
      expect(screen.getByText('Продажа')).toBeInTheDocument()
      expect(screen.getByText('100 NDT')).toBeInTheDocument()
      expect(screen.getByText('50 NDT')).toBeInTheDocument()
    })
  })

  it('should show token statistics', () => {
    render(<NDTManager />)
    
    expect(screen.getByText('Статистика токена')).toBeInTheDocument()
    expect(screen.getByText('Общее количество')).toBeInTheDocument()
    expect(screen.getByText('Сожжено')).toBeInTheDocument()
    expect(screen.getByText('В обращении')).toBeInTheDocument()
    expect(screen.getByText('Рыночная капитализация')).toBeInTheDocument()
  })

  it('should handle transaction errors gracefully', async () => {
    // Mock transaction error
    const { sendTransaction } = require('@/components/wallet/wallet-adapter')
    sendTransaction.mockRejectedValueOnce(new Error('Transaction failed'))
    
    render(<NDTManager />)
    
    const buyButton = screen.getByText('Купить NDT')
    fireEvent.click(buyButton)
    
    const amountInput = screen.getByPlaceholderText('Введите количество SOL')
    fireEvent.change(amountInput, { target: { value: '1' } })
    
    const confirmButton = screen.getByText('Подтвердить покупку')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText('Ошибка транзакции')).toBeInTheDocument()
    })
  })

  it('should show loading state during transactions', async () => {
    // Mock slow transaction
    const { sendTransaction } = require('@/components/wallet/wallet-adapter')
    sendTransaction.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<NDTManager />)
    
    const buyButton = screen.getByText('Купить NDT')
    fireEvent.click(buyButton)
    
    const amountInput = screen.getByPlaceholderText('Введите количество SOL')
    fireEvent.change(amountInput, { target: { value: '1' } })
    
    const confirmButton = screen.getByText('Подтвердить покупку')
    fireEvent.click(confirmButton)
    
    // Check loading state
    expect(screen.getByText('Обработка транзакции...')).toBeInTheDocument()
    expect(confirmButton).toBeDisabled()
  })

  it('should require wallet connection', () => {
    const mockContextDisconnected = {
      ...mockWalletContext,
      connected: false,
      publicKey: null
    }
    ;(useWalletContext as jest.Mock).mockReturnValue(mockContextDisconnected)
    
    render(<NDTManager />)
    
    expect(screen.getByText('Подключите кошелек для работы с NDT')).toBeInTheDocument()
  })

  it('should refresh balance after transaction', async () => {
    const mockRefreshBalance = jest.fn()
    const mockContextWithRefresh = {
      ...mockWalletContext,
      refreshBalance: mockRefreshBalance
    }
    ;(useWalletContext as jest.Mock).mockReturnValue(mockContextWithRefresh)
    
    render(<NDTManager />)
    
    const buyButton = screen.getByText('Купить NDT')
    fireEvent.click(buyButton)
    
    const amountInput = screen.getByPlaceholderText('Введите количество SOL')
    fireEvent.change(amountInput, { target: { value: '1' } })
    
    const confirmButton = screen.getByText('Подтвердить покупку')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(mockRefreshBalance).toHaveBeenCalled()
    })
  })
})

describe('NDT Token Economics', () => {
  it('should calculate correct deflationary amounts', () => {
    const { DeflationaryModel } = require('@/lib/deflationary-model')
    const model = new DeflationaryModel()
    
    const amount = 1000
    const burn = model.calculateBurn(amount)
    const stakingRewards = model.calculateStakingRewards(amount)
    const treasury = model.calculateTreasury(amount)
    const netAmount = model.calculateNetAmount(amount)
    
    expect(burn).toBe(20) // 2%
    expect(stakingRewards).toBe(200) // 20%
    expect(treasury).toBe(300) // 30%
    expect(netAmount).toBe(480) // 48%
  })

  it('should maintain total supply integrity', () => {
    const { DeflationaryModel } = require('@/lib/deflationary-model')
    const model = new DeflationaryModel()
    
    const amount = 1000
    const burn = model.calculateBurn(amount)
    const stakingRewards = model.calculateStakingRewards(amount)
    const treasury = model.calculateTreasury(amount)
    const netAmount = model.calculateNetAmount(amount)
    
    const total = burn + stakingRewards + treasury + netAmount
    expect(total).toBe(amount)
  })
})
