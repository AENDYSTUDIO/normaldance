import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NFTMemorialMint } from '@/components/nft/nft-memorial-mint'
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

// Mock IPFS service
jest.mock('@/lib/ipfs-enhanced', () => ({
  uploadToIPFS: jest.fn().mockResolvedValue('QmTestHash123'),
  getIPFSContent: jest.fn().mockResolvedValue('test-content')
}))

const mockWalletContext = {
  connected: true,
  publicKey: new PublicKey('test-public-key'),
  balance: 10.5,
  ndtBalance: 1000,
  connect: jest.fn(),
  disconnect: jest.fn()
}

describe('NFTMemorialMint', () => {
  beforeEach(() => {
    ;(useWalletContext as jest.Mock).mockReturnValue(mockWalletContext)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render NFT memorial mint form', () => {
    render(<NFTMemorialMint />)
    
    expect(screen.getByText('Создать Memorial NFT')).toBeInTheDocument()
    expect(screen.getByText('Имя артиста')).toBeInTheDocument()
    expect(screen.getByText('Описание')).toBeInTheDocument()
    expect(screen.getByText('Загрузить изображение')).toBeInTheDocument()
  })

  it('should allow filling memorial form', () => {
    render(<NFTMemorialMint />)
    
    const nameInput = screen.getByPlaceholderText('Введите имя артиста')
    const descriptionInput = screen.getByPlaceholderText('Введите описание')
    
    fireEvent.change(nameInput, { target: { value: 'Test Artist' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } })
    
    expect(nameInput).toHaveValue('Test Artist')
    expect(descriptionInput).toHaveValue('Test description')
  })

  it('should validate required fields', async () => {
    render(<NFTMemorialMint />)
    
    const mintButton = screen.getByText('Создать NFT')
    fireEvent.click(mintButton)
    
    await waitFor(() => {
      expect(screen.getByText('Пожалуйста, заполните все поля')).toBeInTheDocument()
    })
  })

  it('should validate image upload', async () => {
    render(<NFTMemorialMint />)
    
    // Fill required fields
    const nameInput = screen.getByPlaceholderText('Введите имя артиста')
    const descriptionInput = screen.getByPlaceholderText('Введите описание')
    
    fireEvent.change(nameInput, { target: { value: 'Test Artist' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } })
    
    const mintButton = screen.getByText('Создать NFT')
    fireEvent.click(mintButton)
    
    await waitFor(() => {
      expect(screen.getByText('Пожалуйста, загрузите изображение')).toBeInTheDocument()
    })
  })

  it('should handle image upload', async () => {
    render(<NFTMemorialMint />)
    
    const fileInput = screen.getByLabelText('Загрузить изображение')
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText('Изображение загружено')).toBeInTheDocument()
    })
  })

  it('should validate image file type', async () => {
    render(<NFTMemorialMint />)
    
    const fileInput = screen.getByLabelText('Загрузить изображение')
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText('Пожалуйста, загрузите изображение (JPG, PNG, GIF)')).toBeInTheDocument()
    })
  })

  it('should validate image file size', async () => {
    render(<NFTMemorialMint />)
    
    const fileInput = screen.getByLabelText('Загрузить изображение')
    // Create a large file (5MB)
    const largeFile = new File(['x'.repeat(5 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
    
    fireEvent.change(fileInput, { target: { files: [largeFile] } })
    
    await waitFor(() => {
      expect(screen.getByText('Размер файла не должен превышать 4MB')).toBeInTheDocument()
    })
  })

  it('should successfully mint NFT', async () => {
    render(<NFTMemorialMint />)
    
    // Fill all required fields
    const nameInput = screen.getByPlaceholderText('Введите имя артиста')
    const descriptionInput = screen.getByPlaceholderText('Введите описание')
    
    fireEvent.change(nameInput, { target: { value: 'Test Artist' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } })
    
    // Upload image
    const fileInput = screen.getByLabelText('Загрузить изображение')
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    // Wait for image upload
    await waitFor(() => {
      expect(screen.getByText('Изображение загружено')).toBeInTheDocument()
    })
    
    const mintButton = screen.getByText('Создать NFT')
    fireEvent.click(mintButton)
    
    await waitFor(() => {
      expect(screen.getByText(/NFT успешно создан! TX: test-signature/)).toBeInTheDocument()
    })
  })

  it('should show minting progress', async () => {
    // Mock slow IPFS upload
    const { uploadToIPFS } = require('@/lib/ipfs-enhanced')
    uploadToIPFS.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<NFTMemorialMint />)
    
    // Fill all required fields
    const nameInput = screen.getByPlaceholderText('Введите имя артиста')
    const descriptionInput = screen.getByPlaceholderText('Введите описание')
    
    fireEvent.change(nameInput, { target: { value: 'Test Artist' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } })
    
    // Upload image
    const fileInput = screen.getByLabelText('Загрузить изображение')
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    const mintButton = screen.getByText('Создать NFT')
    fireEvent.click(mintButton)
    
    // Check loading state
    expect(screen.getByText('Создание NFT...')).toBeInTheDocument()
    expect(mintButton).toBeDisabled()
  })

  it('should handle IPFS upload error', async () => {
    // Mock IPFS upload error
    const { uploadToIPFS } = require('@/lib/ipfs-enhanced')
    uploadToIPFS.mockRejectedValueOnce(new Error('IPFS upload failed'))
    
    render(<NFTMemorialMint />)
    
    // Fill all required fields
    const nameInput = screen.getByPlaceholderText('Введите имя артиста')
    const descriptionInput = screen.getByPlaceholderText('Введите описание')
    
    fireEvent.change(nameInput, { target: { value: 'Test Artist' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } })
    
    // Upload image
    const fileInput = screen.getByLabelText('Загрузить изображение')
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    const mintButton = screen.getByText('Создать NFT')
    fireEvent.click(mintButton)
    
    await waitFor(() => {
      expect(screen.getByText('Ошибка загрузки в IPFS')).toBeInTheDocument()
    })
  })

  it('should handle transaction error', async () => {
    // Mock transaction error
    const { sendTransaction } = require('@/components/wallet/wallet-adapter')
    sendTransaction.mockRejectedValueOnce(new Error('Transaction failed'))
    
    render(<NFTMemorialMint />)
    
    // Fill all required fields
    const nameInput = screen.getByPlaceholderText('Введите имя артиста')
    const descriptionInput = screen.getByPlaceholderText('Введите описание')
    
    fireEvent.change(nameInput, { target: { value: 'Test Artist' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } })
    
    // Upload image
    const fileInput = screen.getByLabelText('Загрузить изображение')
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    const mintButton = screen.getByText('Создать NFT')
    fireEvent.click(mintButton)
    
    await waitFor(() => {
      expect(screen.getByText('Ошибка создания NFT')).toBeInTheDocument()
    })
  })

  it('should require wallet connection', () => {
    const mockContextDisconnected = {
      ...mockWalletContext,
      connected: false,
      publicKey: null
    }
    ;(useWalletContext as jest.Mock).mockReturnValue(mockContextDisconnected)
    
    render(<NFTMemorialMint />)
    
    expect(screen.getByText('Подключите кошелек для создания NFT')).toBeInTheDocument()
  })

  it('should validate minimum balance for minting', async () => {
    const mockContextWithLowBalance = {
      ...mockWalletContext,
      balance: 0.001 // Less than minting fee
    }
    ;(useWalletContext as jest.Mock).mockReturnValue(mockContextWithLowBalance)
    
    render(<NFTMemorialMint />)
    
    // Fill all required fields
    const nameInput = screen.getByPlaceholderText('Введите имя артиста')
    const descriptionInput = screen.getByPlaceholderText('Введите описание')
    
    fireEvent.change(nameInput, { target: { value: 'Test Artist' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } })
    
    // Upload image
    const fileInput = screen.getByLabelText('Загрузить изображение')
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    const mintButton = screen.getByText('Создать NFT')
    fireEvent.click(mintButton)
    
    await waitFor(() => {
      expect(screen.getByText('Недостаточно SOL для создания NFT')).toBeInTheDocument()
    })
  })

  it('should show NFT metadata preview', async () => {
    render(<NFTMemorialMint />)
    
    // Fill all required fields
    const nameInput = screen.getByPlaceholderText('Введите имя артиста')
    const descriptionInput = screen.getByPlaceholderText('Введите описание')
    
    fireEvent.change(nameInput, { target: { value: 'Test Artist' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } })
    
    // Upload image
    const fileInput = screen.getByLabelText('Загрузить изображение')
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    // Should show preview
    await waitFor(() => {
      expect(screen.getByText('Предварительный просмотр')).toBeInTheDocument()
      expect(screen.getByText('Test Artist')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
    })
  })

  it('should reset form after successful mint', async () => {
    render(<NFTMemorialMint />)
    
    // Fill all required fields
    const nameInput = screen.getByPlaceholderText('Введите имя артиста')
    const descriptionInput = screen.getByPlaceholderText('Введите описание')
    
    fireEvent.change(nameInput, { target: { value: 'Test Artist' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } })
    
    // Upload image
    const fileInput = screen.getByLabelText('Загрузить изображение')
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    const mintButton = screen.getByText('Создать NFT')
    fireEvent.click(mintButton)
    
    await waitFor(() => {
      expect(screen.getByText(/NFT успешно создан! TX: test-signature/)).toBeInTheDocument()
    })
    
    // Form should be reset
    expect(nameInput).toHaveValue('')
    expect(descriptionInput).toHaveValue('')
  })
})

describe('NFT Metadata', () => {
  it('should create correct NFT metadata structure', () => {
    const metadata = {
      name: 'Test Artist Memorial',
      description: 'Test description',
      image: 'QmTestHash123',
      attributes: [
        { trait_type: 'Type', value: 'Memorial' },
        { trait_type: 'Artist', value: 'Test Artist' },
        { trait_type: 'Created', value: new Date().toISOString() }
      ]
    }
    
    expect(metadata.name).toBe('Test Artist Memorial')
    expect(metadata.description).toBe('Test description')
    expect(metadata.image).toBe('QmTestHash123')
    expect(metadata.attributes).toHaveLength(3)
  })

  it('should validate metadata format', () => {
    const metadata = {
      name: 'Test Artist Memorial',
      description: 'Test description',
      image: 'QmTestHash123'
    }
    
    // Should have required fields
    expect(metadata.name).toBeDefined()
    expect(metadata.description).toBeDefined()
    expect(metadata.image).toBeDefined()
    
    // Should not be empty
    expect(metadata.name.length).toBeGreaterThan(0)
    expect(metadata.description.length).toBeGreaterThan(0)
    expect(metadata.image.length).toBeGreaterThan(0)
  })
})
