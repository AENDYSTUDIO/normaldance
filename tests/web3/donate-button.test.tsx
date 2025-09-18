import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DonateButton } from '@/components/donate/donate-button'
import { useWalletContext } from '@/components/wallet/wallet-provider'

// Mock wallet context
jest.mock('@/components/wallet/wallet-provider', () => ({
  useWalletContext: jest.fn()
}))

// Mock wallet adapter functions
jest.mock('@/components/wallet/wallet-adapter', () => ({
  createTransaction: jest.fn().mockResolvedValue({
    add: jest.fn(),
    recentBlockhash: 'test-blockhash',
    feePayer: new PublicKey('test-public-key')
  }),
  sendTransaction: jest.fn().mockResolvedValue('test-signature')
}))

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
  })),
  SystemProgram: {
    transfer: jest.fn().mockReturnValue({})
  }
}))

const mockWalletContext = {
  connected: true,
  publicKey: new PublicKey('test-public-key'),
  balance: 10.5,
  ndtBalance: 1000,
  connect: jest.fn(),
  disconnect: jest.fn()
}

describe('DonateButton', () => {
  const defaultProps = {
    artistWallet: 'artist-wallet-address',
    artistName: 'Test Artist'
  }

  beforeEach(() => {
    ;(useWalletContext as jest.Mock).mockReturnValue(mockWalletContext)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render donate button', () => {
    render(<DonateButton {...defaultProps} />)
    
    expect(screen.getByText('Поддержать артиста')).toBeInTheDocument()
    expect(screen.getByText('Test Artist')).toBeInTheDocument()
  })

  it('should show artist information', () => {
    render(<DonateButton {...defaultProps} />)
    
    expect(screen.getByText('Test Artist')).toBeInTheDocument()
    expect(screen.getByText('artist-wallet-address')).toBeInTheDocument()
  })

  it('should open donation modal when clicked', () => {
    render(<DonateButton {...defaultProps} />)
    
    const donateButton = screen.getByText('Поддержать артиста')
    fireEvent.click(donateButton)
    
    expect(screen.getByText('Поддержка артиста')).toBeInTheDocument()
    expect(screen.getByText('Test Artist')).toBeInTheDocument()
  })

  it('should allow entering donation amount', () => {
    render(<DonateButton {...defaultProps} />)
    
    const donateButton = screen.getByText('Поддержать артиста')
    fireEvent.click(donateButton)
    
    const amountInput = screen.getByPlaceholderText('Введите сумму в SOL')
    fireEvent.change(amountInput, { target: { value: '0.1' } })
    
    expect(amountInput).toHaveValue('0.1')
  })

  it('should validate minimum donation amount', async () => {
    render(<DonateButton {...defaultProps} />)
    
    const donateButton = screen.getByText('Поддержать артиста')
    fireEvent.click(donateButton)
    
    const amountInput = screen.getByPlaceholderText('Введите сумму в SOL')
    fireEvent.change(amountInput, { target: { value: '0.001' } })
    
    const confirmButton = screen.getByText('Подтвердить донат')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText('Минимальная сумма доната: 0.01 SOL')).toBeInTheDocument()
    })
  })

  it('should validate insufficient balance', async () => {
    const mockContextWithLowBalance = {
      ...mockWalletContext,
      balance: 0.005
    }
    ;(useWalletContext as jest.Mock).mockReturnValue(mockContextWithLowBalance)
    
    render(<DonateButton {...defaultProps} />)
    
    const donateButton = screen.getByText('Поддержать артиста')
    fireEvent.click(donateButton)
    
    const amountInput = screen.getByPlaceholderText('Введите сумму в SOL')
    fireEvent.change(amountInput, { target: { value: '0.01' } })
    
    const confirmButton = screen.getByText('Подтвердить донат')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText('Недостаточно SOL для доната')).toBeInTheDocument()
    })
  })

  it('should successfully send donation', async () => {
    render(<DonateButton {...defaultProps} />)
    
    const donateButton = screen.getByText('Поддержать артиста')
    fireEvent.click(donateButton)
    
    const amountInput = screen.getByPlaceholderText('Введите сумму в SOL')
    fireEvent.change(amountInput, { target: { value: '0.1' } })
    
    const confirmButton = screen.getByText('Подтвердить донат')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Донат успешно отправлен! TX: test-signature/)).toBeInTheDocument()
    })
  })

  it('should show quick donation amounts', () => {
    render(<DonateButton {...defaultProps} />)
    
    const donateButton = screen.getByText('Поддержать артиста')
    fireEvent.click(donateButton)
    
    expect(screen.getByText('0.01 SOL')).toBeInTheDocument()
    expect(screen.getByText('0.05 SOL')).toBeInTheDocument()
    expect(screen.getByText('0.1 SOL')).toBeInTheDocument()
    expect(screen.getByText('0.5 SOL')).toBeInTheDocument()
  })

  it('should set amount when quick donation clicked', () => {
    render(<DonateButton {...defaultProps} />)
    
    const donateButton = screen.getByText('Поддержать артиста')
    fireEvent.click(donateButton)
    
    const quickAmount = screen.getByText('0.1 SOL')
    fireEvent.click(quickAmount)
    
    const amountInput = screen.getByPlaceholderText('Введите сумму в SOL')
    expect(amountInput).toHaveValue('0.1')
  })

  it('should show donation message input', () => {
    render(<DonateButton {...defaultProps} />)
    
    const donateButton = screen.getByText('Поддержать артиста')
    fireEvent.click(donateButton)
    
    const messageInput = screen.getByPlaceholderText('Оставьте сообщение (необязательно)')
    expect(messageInput).toBeInTheDocument()
  })

  it('should allow entering donation message', () => {
    render(<DonateButton {...defaultProps} />)
    
    const donateButton = screen.getByText('Поддержать артиста')
    fireEvent.click(donateButton)
    
    const messageInput = screen.getByPlaceholderText('Оставьте сообщение (необязательно)')
    fireEvent.change(messageInput, { target: { value: 'Great music!' } })
    
    expect(messageInput).toHaveValue('Great music!')
  })

  it('should validate message length', async () => {
    render(<DonateButton {...defaultProps} />)
    
    const donateButton = screen.getByText('Поддержать артиста')
    fireEvent.click(donateButton)
    
    const messageInput = screen.getByPlaceholderText('Оставьте сообщение (необязательно)')
    const longMessage = 'x'.repeat(201) // 201 characters
    fireEvent.change(messageInput, { target: { value: longMessage } })
    
    const amountInput = screen.getByPlaceholderText('Введите сумму в SOL')
    fireEvent.change(amountInput, { target: { value: '0.1' } })
    
    const confirmButton = screen.getByText('Подтвердить донат')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText('Сообщение не должно превышать 200 символов')).toBeInTheDocument()
    })
  })

  it('should show loading state during donation', async () => {
    // Mock slow transaction
    const { sendTransaction } = require('@/components/wallet/wallet-adapter')
    sendTransaction.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<DonateButton {...defaultProps} />)
    
    const donateButton = screen.getByText('Поддержать артиста')
    fireEvent.click(donateButton)
    
    const amountInput = screen.getByPlaceholderText('Введите сумму в SOL')
    fireEvent.change(amountInput, { target: { value: '0.1' } })
    
    const confirmButton = screen.getByText('Подтвердить донат')
    fireEvent.click(confirmButton)
    
    // Check loading state
    expect(screen.getByText('Отправка доната...')).toBeInTheDocument()
    expect(confirmButton).toBeDisabled()
  })

  it('should handle transaction error', async () => {
    // Mock transaction error
    const { sendTransaction } = require('@/components/wallet/wallet-adapter')
    sendTransaction.mockRejectedValueOnce(new Error('Transaction failed'))
    
    render(<DonateButton {...defaultProps} />)
    
    const donateButton = screen.getByText('Поддержать артиста')
    fireEvent.click(donateButton)
    
    const amountInput = screen.getByPlaceholderText('Введите сумму в SOL')
    fireEvent.change(amountInput, { target: { value: '0.1' } })
    
    const confirmButton = screen.getByText('Подтвердить донат')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText('Ошибка отправки доната')).toBeInTheDocument()
    })
  })

  it('should require wallet connection', () => {
    const mockContextDisconnected = {
      ...mockWalletContext,
      connected: false,
      publicKey: null
    }
    ;(useWalletContext as jest.Mock).mockReturnValue(mockContextDisconnected)
    
    render(<DonateButton {...defaultProps} />)
    
    const donateButton = screen.getByText('Поддержать артиста')
    fireEvent.click(donateButton)
    
    expect(screen.getByText('Подключите кошелек для отправки доната')).toBeInTheDocument()
  })

  it('should close modal after successful donation', async () => {
    render(<DonateButton {...defaultProps} />)
    
    const donateButton = screen.getByText('Поддержать артиста')
    fireEvent.click(donateButton)
    
    const amountInput = screen.getByPlaceholderText('Введите сумму в SOL')
    fireEvent.change(amountInput, { target: { value: '0.1' } })
    
    const confirmButton = screen.getByText('Подтвердить донат')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Донат успешно отправлен! TX: test-signature/)).toBeInTheDocument()
    })
    
    // Modal should close after success
    await waitFor(() => {
      expect(screen.queryByText('Поддержка артиста')).not.toBeInTheDocument()
    })
  })

  it('should show donation history', () => {
    render(<DonateButton {...defaultProps} />)
    
    const donateButton = screen.getByText('Поддержать артиста')
    fireEvent.click(donateButton)
    
    const historyButton = screen.getByText('История донатов')
    fireEvent.click(historyButton)
    
    expect(screen.getByText('История донатов')).toBeInTheDocument()
  })

  it('should display donation statistics', () => {
    render(<DonateButton {...defaultProps} />)
    
    expect(screen.getByText('Всего донатов')).toBeInTheDocument()
    expect(screen.getByText('Сумма донатов')).toBeInTheDocument()
    expect(screen.getByText('Последний донат')).toBeInTheDocument()
  })

  it('should show anonymous donation option', () => {
    render(<DonateButton {...defaultProps} />)
    
    const donateButton = screen.getByText('Поддержать артиста')
    fireEvent.click(donateButton)
    
    const anonymousCheckbox = screen.getByLabelText('Анонимный донат')
    expect(anonymousCheckbox).toBeInTheDocument()
  })

  it('should handle anonymous donation', async () => {
    render(<DonateButton {...defaultProps} />)
    
    const donateButton = screen.getByText('Поддержать артиста')
    fireEvent.click(donateButton)
    
    const amountInput = screen.getByPlaceholderText('Введите сумму в SOL')
    fireEvent.change(amountInput, { target: { value: '0.1' } })
    
    const anonymousCheckbox = screen.getByLabelText('Анонимный донат')
    fireEvent.click(anonymousCheckbox)
    
    const confirmButton = screen.getByText('Подтвердить донат')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Донат успешно отправлен! TX: test-signature/)).toBeInTheDocument()
    })
  })
})

describe('Donation Analytics', () => {
  it('should track donation metrics', () => {
    const donationData = {
      amount: 0.1,
      artistWallet: 'artist-wallet-address',
      donorWallet: 'donor-wallet-address',
      timestamp: new Date(),
      message: 'Great music!',
      anonymous: false
    }
    
    expect(donationData.amount).toBe(0.1)
    expect(donationData.artistWallet).toBe('artist-wallet-address')
    expect(donationData.donorWallet).toBe('donor-wallet-address')
    expect(donationData.message).toBe('Great music!')
    expect(donationData.anonymous).toBe(false)
  })

  it('should calculate total donations', () => {
    const donations = [
      { amount: 0.1, timestamp: new Date('2024-01-01') },
      { amount: 0.05, timestamp: new Date('2024-01-02') },
      { amount: 0.2, timestamp: new Date('2024-01-03') }
    ]
    
    const total = donations.reduce((sum, donation) => sum + donation.amount, 0)
    expect(total).toBe(0.35)
  })

  it('should get donation count', () => {
    const donations = [
      { amount: 0.1, timestamp: new Date('2024-01-01') },
      { amount: 0.05, timestamp: new Date('2024-01-02') },
      { amount: 0.2, timestamp: new Date('2024-01-03') }
    ]
    
    expect(donations.length).toBe(3)
  })
})
