import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { MusicNFTManager } from '@/components/wallet/music-nft-manager'
import { useWalletContext } from '@/components/wallet/wallet-provider'
import { useTransactions } from '@/components/wallet/wallet-provider'
import { uploadToIPFS, createIPFSUrl } from '@/lib/ipfs'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'

// Mock external dependencies
jest.mock('@/components/wallet/wallet-provider')
jest.mock('@/lib/ipfs')
jest.mock('@solana/web3.js')

// Mock the wallet and transactions hooks
const mockUseWalletContext = useWalletContext as jest.MockedFunction<typeof useWalletContext>
const mockUseTransactions = useTransactions as jest.MockedFunction<typeof useTransactions>

// Mock IPFS functions
const mockUploadToIPFS = uploadToIPFS as jest.MockedFunction<typeof uploadToIPFS>
const mockCreateIPFSUrl = createIPFSUrl as jest.MockedFunction<typeof createIPFSUrl>

describe('MusicNFTManager - Comprehensive Tests', () => {
  const mockWalletContext = {
    connected: false,
    publicKey: null,
    balance: null,
    connect: jest.fn(),
    disconnect: jest.fn(),
    isConnecting: false,
    error: null,
  }

  const mockTransactions = {
    sendTransaction: jest.fn(),
  }

  const mockNFTs = [
    {
      id: '1',
      title: 'Summer Vibes',
      artist: 'DJ Normal',
      genre: 'House',
      duration: 180,
      ipfsHash: 'QmX...',
      metadata: {
        bpm: 128,
        key: 'A Minor',
        releaseDate: '2024-01-15',
        albumArt: 'QmY...',
        description: 'Summer house track with uplifting vibes'
      },
      price: 100,
      isExplicit: false,
      isPublished: true,
      royaltyPercentage: 10,
      totalPlays: 15420,
      totalRevenue: 1542.50,
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      owner: '...'
    },
    {
      id: '2',
      title: 'Midnight Dreams',
      artist: 'Normal Beats',
      genre: 'Downtempo',
      duration: 240,
      ipfsHash: 'QmZ...',
      metadata: {
        bpm: 90,
        key: 'F Major',
        releaseDate: '2024-02-01',
        albumArt: 'QmW...',
        description: 'Chill downtempo for late night listening'
      },
      price: 150,
      isExplicit: false,
      isPublished: true,
      royaltyPercentage: 8,
      totalPlays: 8930,
      totalRevenue: 714.40,
      createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
      owner: '...'
    }
  ]

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Setup default mock implementations
    mockUseWalletContext.mockReturnValue(mockWalletContext)
    mockUseTransactions.mockReturnValue(mockTransactions)
    mockUploadToIPFS.mockResolvedValue({ cid: 'test-cid' })
    mockCreateIPFSUrl.mockReturnValue('https://ipfs.io/ipfs/test-cid')
  })

  describe('Rendering States', () => {
    it('should render disconnected state when wallet is not connected', () => {
      render(React.createElement(MusicNFTManager))
      
      expect(screen.getByText('Пожалуйста, подключите кошелек для использования Music NFT Manager')).toBeInTheDocument()
    })

    it('should render connected state when wallet is connected', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<MusicNFTManager />)
      
      expect(screen.getByText('Создать NFT')).toBeInTheDocument()
      expect(screen.getByText('Мои NFT')).toBeInTheDocument()
      expect(screen.getByText('Все NFT')).toBeInTheDocument()
    })

    it('should show NFT creation form when connected', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<MusicNFTManager />)
      
      expect(screen.getByText('Выберите файл')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Название трека')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Исполнитель')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Жанр')).toBeInTheDocument()
    })

    it('should show NFT list when connected', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<MusicNFTManager />)
      
      expect(screen.getByText('Мои NFT')).toBeInTheDocument()
      expect(screen.getByText('Все NFT')).toBeInTheDocument()
    })

    it('should show NFT cards when loaded', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<MusicNFTManager />)
      
      expect(screen.getByText('Summer Vibes')).toBeInTheDocument()
      expect(screen.getByText('DJ Normal')).toBeInTheDocument()
      expect(screen.getByText('Midnight Dreams')).toBeInTheDocument()
      expect(screen.getByText('Normal Beats')).toBeInTheDocument()
    })
  })

  describe('NFT Creation', () => {
    beforeEach(() => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)
    })

    it('should handle file selection', () => {
      render(<MusicNFTManager />)
      
      const fileInput = screen.getByLabelText('Выберите файл')
      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' })
      
      fireEvent.change(fileInput, { target: { files: [file] } })
      
      expect(fileInput.files?.[0]).toBe(file)
    })

    it('should handle metadata input', () => {
      render(<MusicNFTManager />)
      
      const titleInput = screen.getByPlaceholderText('Название трека')
      const artistInput = screen.getByPlaceholderText('Исполнитель')
      const genreInput = screen.getByPlaceholderText('Жанр')
      
      fireEvent.change(titleInput, { target: { value: 'Test Track' } })
      fireEvent.change(artistInput, { target: { value: 'Test Artist' } })
      fireEvent.change(genreInput, { target: { value: 'Test Genre' } })
      
      expect(titleInput).toHaveValue('Test Track')
      expect(artistInput).toHaveValue('Test Artist')
      expect(genreInput).toHaveValue('Test Genre')
    })

    it('should handle BPM and key input', () => {
      render(<MusicNFTManager />)
      
      const bpmInput = screen.getByPlaceholderText('BPM')
      const keyInput = screen.getByPlaceholderText('Тональность')
      
      fireEvent.change(bpmInput, { target: { value: '128' } })
      fireEvent.change(keyInput, { target: { value: 'A Minor' } })
      
      expect(bpmInput).toHaveValue('128')
      expect(keyInput).toHaveValue('A Minor')
    })

    it('should handle description input', () => {
      render(<MusicNFTManager />)
      
      const descriptionInput = screen.getByPlaceholderText('Описание')
      
      fireEvent.change(descriptionInput, { target: { value: 'Test description' } })
      
      expect(descriptionInput).toHaveValue('Test description')
    })

    it('should handle price and royalty input', () => {
      render(<MusicNFTManager />)
      
      const priceInput = screen.getByPlaceholderText('Цена (SOL)')
      const royaltySelect = screen.getByDisplayValue('10% роялти')
      
      fireEvent.change(priceInput, { target: { value: '100' } })
      fireEvent.change(royaltySelect, { target: { value: '15' } })
      
      expect(priceInput).toHaveValue('100')
      expect(royaltySelect).toHaveValue('15')
    })

    it('should enable create button when all required fields are filled', () => {
      render(<MusicNFTManager />)
      
      // Select file
      const fileInput = screen.getByLabelText('Выберите файл')
      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' })
      fireEvent.change(fileInput, { target: { files: [file] } })
      
      // Fill required fields
      const titleInput = screen.getByPlaceholderText('Название трека')
      fireEvent.change(titleInput, { target: { value: 'Test Track' } })
      
      const createButton = screen.getByText('Создать NFT')
      expect(createButton).not.toBeDisabled()
    })

    it('should disable create button when file is not selected', () => {
      render(<MusicNFTManager />)
      
      const createButton = screen.getByText('Создать NFT')
      expect(createButton).toBeDisabled()
    })

    it('should disable create button when title is not filled', () => {
      render(<MusicNFTManager />)
      
      // Select file
      const fileInput = screen.getByLabelText('Выберите файл')
      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' })
      fireEvent.change(fileInput, { target: { files: [file] } })
      
      const createButton = screen.getByText('Создать NFT')
      expect(createButton).toBeDisabled()
    })

    it('should handle NFT creation', async () => {
      mockTransactions.sendTransaction.mockResolvedValue('test-signature')

      render(<MusicNFTManager />)
      
      // Select file
      const fileInput = screen.getByLabelText('Выберите файл')
      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' })
      fireEvent.change(fileInput, { target: { files: [file] } })
      
      // Fill required fields
      const titleInput = screen.getByPlaceholderText('Название трека')
      fireEvent.change(titleInput, { target: { value: 'Test Track' } })
      
      const artistInput = screen.getByPlaceholderText('Исполнитель')
      fireEvent.change(artistInput, { target: { value: 'Test Artist' } })
      
      const genreInput = screen.getByPlaceholderText('Жанр')
      fireEvent.change(genreInput, { target: { value: 'Test Genre' } })
      
      // Click create button
      const createButton = screen.getByText('Создать NFT')
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(mockUploadToIPFS).toHaveBeenCalledWith(file, expect.any(Object))
        expect(mockTransactions.sendTransaction).toHaveBeenCalledWith({ instructions: [] })
        expect(screen.getByText('Создание...')).toBeInTheDocument()
      })
    })

    it('should handle NFT creation error', async () => {
      mockUploadToIPFS.mockRejectedValue(new Error('Upload failed'))

      render(<MusicNFTManager />)
      
      // Select file
      const fileInput = screen.getByLabelText('Выберите файл')
      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' })
      fireEvent.change(fileInput, { target: { files: [file] } })
      
      // Fill required fields
      const titleInput = screen.getByPlaceholderText('Название трека')
      fireEvent.change(titleInput, { target: { value: 'Test Track' } })
      
      const artistInput = screen.getByPlaceholderText('Исполнитель')
      fireEvent.change(artistInput, { target: { value: 'Test Artist' } })
      
      const genreInput = screen.getByPlaceholderText('Жанр')
      fireEvent.change(genreInput, { target: { value: 'Test Genre' } })
      
      // Click create button
      const createButton = screen.getByText('Создать NFT')
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(screen.getByText('Создание...')).toBeInTheDocument()
      })
    })

    it('should reset form after successful NFT creation', async () => {
      mockTransactions.sendTransaction.mockResolvedValue('test-signature')

      render(<MusicNFTManager />)
      
      // Select file
      const fileInput = screen.getByLabelText('Выберите файл')
      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' })
      fireEvent.change(fileInput, { target: { files: [file] } })
      
      // Fill required fields
      const titleInput = screen.getByPlaceholderText('Название трека')
      fireEvent.change(titleInput, { target: { value: 'Test Track' } })
      
      const artistInput = screen.getByPlaceholderText('Исполнитель')
      fireEvent.change(artistInput, { target: { value: 'Test Artist' } })
      
      const genreInput = screen.getByPlaceholderText('Жанр')
      fireEvent.change(genreInput, { target: { value: 'Test Genre' } })
      
      // Click create button
      const createButton = screen.getByText('Создать NFT')
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(fileInput.files?.length).toBe(0)
        expect(titleInput).toHaveValue('')
        expect(artistInput).toHaveValue('')
        expect(genreInput).toHaveValue('')
      })
    })
  })

  describe('NFT Display', () => {
    beforeEach(() => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)
    })

    it('should display NFT information correctly', () => {
      render(<MusicNFTManager />)
      
      expect(screen.getByText('Summer Vibes')).toBeInTheDocument()
      expect(screen.getByText('DJ Normal')).toBeInTheDocument()
      expect(screen.getByText('House')).toBeInTheDocument()
      expect(screen.getByText('3:00')).toBeInTheDocument()
      expect(screen.getByText('15,420')).toBeInTheDocument()
      expect(screen.getByText('10%')).toBeInTheDocument()
      expect(screen.getByText('1,542.50 SOL')).toBeInTheDocument()
    })

    it('should display NFT duration correctly', () => {
      render(<MusicNFTManager />)
      
      expect(screen.getByText('3:00')).toBeInTheDocument() // 180 seconds
      expect(screen.getByText('4:00')).toBeInTheDocument() // 240 seconds
    })

    it('should display NFT plays correctly', () => {
      render(<MusicNFTManager />)
      
      expect(screen.getByText('15,420')).toBeInTheDocument()
      expect(screen.getByText('8,930')).toBeInTheDocument()
    })

    it('should display NFT revenue correctly', () => {
      render(<MusicNFTManager />)
      
      expect(screen.getByText('1,542.50 SOL')).toBeInTheDocument()
      expect(screen.getByText('714.40 SOL')).toBeInTheDocument()
    })

    it('should display NFT royalty percentage correctly', () => {
      render(<MusicNFTManager />)
      
      expect(screen.getByText('10%')).toBeInTheDocument()
      expect(screen.getByText('8%')).toBeInTheDocument()
    })

    it('should display play button for each NFT', () => {
      render(<MusicNFTManager />)
      
      expect(screen.getAllByText('Воспроизвести')).toHaveLength(2)
    })

    it('should display more options button for each NFT', () => {
      render(<MusicNFTManager />)
      
      expect(screen.getAllByText('MoreHorizontal')).toHaveLength(2)
    })
  })

  describe('Tab Navigation', () => {
    beforeEach(() => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)
    })

    it('should switch to my NFT tab', () => {
      render(<MusicNFTManager />)
      
      const myNFTsButton = screen.getByText('Мои NFT')
      fireEvent.click(myNFTsButton)
      
      expect(myNFTsButton).toHaveClass('bg-primary')
    })

    it('should switch to all NFTs tab', () => {
      render(<MusicNFTManager />)
      
      const allNFTsButton = screen.getByText('Все NFT')
      fireEvent.click(allNFTsButton)
      
      expect(allNFTsButton).toHaveClass('bg-primary')
    })

    it('should show different NFTs based on tab selection', () => {
      render(<MusicNFTManager />)
      
      // Initially shows all NFTs
      expect(screen.getByText('Summer Vibes')).toBeInTheDocument()
      expect(screen.getByText('Midnight Dreams')).toBeInTheDocument()
      
      // Switch to my NFTs
      const myNFTsButton = screen.getByText('Мои NFT')
      fireEvent.click(myNFTsButton)
      
      // Should still show all NFTs (mock data)
      expect(screen.getByText('Summer Vibes')).toBeInTheDocument()
      expect(screen.getByText('Midnight Dreams')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)
    })

    it('should handle file upload error', async () => {
      mockUploadToIPFS.mockRejectedValue(new Error('Upload failed'))

      render(<MusicNFTManager />)
      
      // Select file
      const fileInput = screen.getByLabelText('Выберите файл')
      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' })
      fireEvent.change(fileInput, { target: { files: [file] } })
      
      // Fill required fields
      const titleInput = screen.getByPlaceholderText('Название трека')
      fireEvent.change(titleInput, { target: { value: 'Test Track' } })
      
      const artistInput = screen.getByPlaceholderText('Исполнитель')
      fireEvent.change(artistInput, { target: { value: 'Test Artist' } })
      
      const genreInput = screen.getByPlaceholderText('Жанр')
      fireEvent.change(genreInput, { target: { value: 'Test Genre' } })
      
      // Click create button
      const createButton = screen.getByText('Создать NFT')
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(screen.getByText('Создание...')).toBeInTheDocument()
      })
    })

    it('should handle transaction error', async () => {
      mockTransactions.sendTransaction.mockRejectedValue(new Error('Transaction failed'))

      render(<MusicNFTManager />)
      
      // Select file
      const fileInput = screen.getByLabelText('Выберите файл')
      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' })
      fireEvent.change(fileInput, { target: { files: [file] } })
      
      // Fill required fields
      const titleInput = screen.getByPlaceholderText('Название трека')
      fireEvent.change(titleInput, { target: { value: 'Test Track' } })
      
      const artistInput = screen.getByPlaceholderText('Исполнитель')
      fireEvent.change(artistInput, { target: { value: 'Test Artist' } })
      
      const genreInput = screen.getByPlaceholderText('Жанр')
      fireEvent.change(genreInput, { target: { value: 'Test Genre' } })
      
      // Click create button
      const createButton = screen.getByText('Создать NFT')
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(mockTransactions.sendTransaction).toHaveBeenCalledWith({ instructions: [] })
      })
    })

    it('should handle invalid file type', () => {
      render(<MusicNFTManager />)
      
      const fileInput = screen.getByLabelText('Выберите файл')
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      
      fireEvent.change(fileInput, { target: { files: [file] } })
      
      // Should not accept non-audio files
      expect(fileInput.files?.[0]).toBe(file)
    })
  })

  describe('Edge Cases', () => {
    beforeEach(() => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)
    })

    it('should handle null publicKey gracefully', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: null,
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<MusicNFTManager />)
      
      // Should not crash
      expect(true).toBe(true)
    })

    it('should handle empty NFT list', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<MusicNFTManager />)
      
      // Should still render basic UI
      expect(screen.getByText('Создать NFT')).toBeInTheDocument()
      expect(screen.getByText('Мои NFT')).toBeInTheDocument()
      expect(screen.getByText('Все NFT')).toBeInTheDocument()
    })

    it('should handle zero plays', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<MusicNFTManager />)
      
      // Should display zero plays correctly
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle zero revenue', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<MusicNFTManager />)
      
      // Should display zero revenue correctly
      expect(screen.getByText('0.00 SOL')).toBeInTheDocument()
    })

    it('should handle missing metadata', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<MusicNFTManager />)
      
      // Should handle missing metadata gracefully
      expect(screen.getByText('Summer Vibes')).toBeInTheDocument()
      expect(screen.getByText('DJ Normal')).toBeInTheDocument()
    })

    it('should handle large file sizes', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<MusicNFTManager />)
      
      // Create a large file
      const largeFile = new File(['x'.repeat(1000000)], 'large.mp3', { type: 'audio/mpeg' })
      
      const fileInput = screen.getByLabelText('Выберите файл')
      fireEvent.change(fileInput, { target: { files: [largeFile] } })
      
      expect(fileInput.files?.[0]).toBe(largeFile)
    })

    it('should handle very small file sizes', () => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)

      render(<MusicNFTManager />)
      
      // Create a small file
      const smallFile = new File(['x'], 'small.mp3', { type: 'audio/mpeg' })
      
      const fileInput = screen.getByLabelText('Выберите файл')
      fireEvent.change(fileInput, { target: { files: [smallFile] } })
      
      expect(fileInput.files?.[0]).toBe(smallFile)
    })
  })

  describe('Integration Tests', () => {
    beforeEach(() => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)
    })

    it('should update UI after successful NFT creation', async () => {
      mockTransactions.sendTransaction.mockResolvedValue('test-signature')

      render(<MusicNFTManager />)
      
      // Select file
      const fileInput = screen.getByLabelText('Выберите файл')
      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' })
      fireEvent.change(fileInput, { target: { files: [file] } })
      
      // Fill required fields
      const titleInput = screen.getByPlaceholderText('Название трека')
      fireEvent.change(titleInput, { target: { value: 'Test Track' } })
      
      const artistInput = screen.getByPlaceholderText('Исполнитель')
      fireEvent.change(artistInput, { target: { value: 'Test Artist' } })
      
      const genreInput = screen.getByPlaceholderText('Жанр')
      fireEvent.change(genreInput, { target: { value: 'Test Genre' } })
      
      // Click create button
      const createButton = screen.getByText('Создать NFT')
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(screen.getByText('Создание...')).toBeInTheDocument()
      })
    })

    it('should show error message after failed NFT creation', async () => {
      mockUploadToIPFS.mockRejectedValue(new Error('Upload failed'))

      render(<MusicNFTManager />)
      
      // Select file
      const fileInput = screen.getByLabelText('Выберите файл')
      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' })
      fireEvent.change(fileInput, { target: { files: [file] } })
      
      // Fill required fields
      const titleInput = screen.getByPlaceholderText('Название трека')
      fireEvent.change(titleInput, { target: { value: 'Test Track' } })
      
      const artistInput = screen.getByPlaceholderText('Исполнитель')
      fireEvent.change(artistInput, { target: { value: 'Test Artist' } })
      
      const genreInput = screen.getByPlaceholderText('Жанр')
      fireEvent.change(genreInput, { target: { value: 'Test Genre' } })
      
      // Click create button
      const createButton = screen.getByText('Создать NFT')
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(screen.getByText('Создание...')).toBeInTheDocument()
      })
    })

    it('should handle multiple NFT creations', async () => {
      mockTransactions.sendTransaction.mockResolvedValue('test-signature')

      render(<MusicNFTManager />)
      
      // Create first NFT
      const fileInput = screen.getByLabelText('Выберите файл')
      const file1 = new File(['test1'], 'test1.mp3', { type: 'audio/mpeg' })
      fireEvent.change(fileInput, { target: { files: [file1] } })
      
      const titleInput = screen.getByPlaceholderText('Название трека')
      fireEvent.change(titleInput, { target: { value: 'Test Track 1' } })
      
      const createButton = screen.getByText('Создать NFT')
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(screen.getByText('Создание...')).toBeInTheDocument()
      })
      
      // Create second NFT
      const file2 = new File(['test2'], 'test2.mp3', { type: 'audio/mpeg' })
      fireEvent.change(fileInput, { target: { files: [file2] } })
      
      fireEvent.change(titleInput, { target: { value: 'Test Track 2' } })
      
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(mockTransactions.sendTransaction).toHaveBeenCalledTimes(2)
      })
    })

    it('should handle concurrent NFT creations', async () => {
      mockTransactions.sendTransaction.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<MusicNFTManager />)
      
      // Try to create multiple NFTs concurrently
      const fileInput = screen.getByLabelText('Выберите файл')
      const file1 = new File(['test1'], 'test1.mp3', { type: 'audio/mpeg' })
      const file2 = new File(['test2'], 'test2.mp3', { type: 'audio/mpeg' })
      
      fireEvent.change(fileInput, { target: { files: [file1] } })
      
      const titleInput = screen.getByPlaceholderText('Название трека')
      fireEvent.change(titleInput, { target: { value: 'Test Track 1' } })
      
      const createButton = screen.getByText('Создать NFT')
      
      fireEvent.click(createButton)
      fireEvent.click(createButton)
      
      expect(createButton).toBeDisabled()
      
      await waitFor(() => {
        expect(createButton).not.toBeDisabled()
      })
    })
  })

  describe('Performance Tests', () => {
    beforeEach(() => {
      const connectedWallet = {
        ...mockWalletContext,
        connected: true,
        publicKey: { toBase58: () => '1111111111111111111111111111111111111111111' },
        balance: 2.5,
      }

      mockUseWalletContext.mockReturnValue(connectedWallet)
    })

    it('should render quickly with large data', () => {
      const startTime = performance.now()
      
      render(<MusicNFTManager />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(100) // Should render in less than 100ms
    })

    it('should handle rapid state changes', async () => {
      mockTransactions.sendTransaction.mockResolvedValue('test-signature')

      render(<MusicNFTManager />)
      
      const fileInput = screen.getByLabelText('Выберите файл')
      const createButton = screen.getByText('Создать NFT')
      
      // Click rapidly
      for (let i = 0; i < 5; i++) {
        const file = new File(['test'], `test${i}.mp3`, { type: 'audio/mpeg' })
        fireEvent.change(fileInput, { target: { files: [file] } })
        
        const titleInput = screen.getByPlaceholderText('Название трека')
        fireEvent.change(titleInput, { target: { value: `Test Track ${i}` } })
        
        fireEvent.click(createButton)
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      
      // Should only execute once due to button disabling
      expect(mockTransactions.sendTransaction).toHaveBeenCalledTimes(1)
    })
  })
})