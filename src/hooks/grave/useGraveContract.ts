import { SecureLogger } from '@/lib/security/secure-logger';
import { useState, useCallback, useEffect } from 'react'
import { BrowserProvider, Contract, ethers } from 'ethers'
import { MemorialData, DonationParams, CreateMemorialParams } from '@/lib/grave/contract-interface'

interface UseGraveContractOptions {
  contractAddress?: string
  chainId?: number
  autoInitialize?: boolean
}

interface GraveContractState {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  currentChainId: number
  userAddress: string | null
  memorials: MemorialData[]
}

const GRAVE_MEMORIAL_ABI = [
  'function createMemorial(string _ipfsHash, address[] _heirs, string _artistName) public payable returns (uint256)',
  'function donate(uint256 tokenId, string memory message) public payable nonReentrant',
  'function distributeToHeirs(uint256 tokenId) public nonReentrant',
  'function getMemorial(uint256 tokenId) public view returns (tuple(string ipfsHash, address[] heirs, uint256 fundBalance, uint256 platformFee, string artistName, bool isActive, uint256 createdAt))',
  'function getUserMemorials(address user) public view returns (uint256[])',
  'function getMemorialByArtist(string artistName) public view returns (uint256)',
  'function visitMemorial(uint256 tokenId) public',
  'function emergencyWithdraw() public onlyOwner',
  'function tokenURI(uint256 tokenId) public view returns (string)',
  'event MemorialCreated(uint256 indexed tokenId, address indexed creator, string artistName, address[] heirs)',
  'event DonationReceived(uint256 indexed tokenId, address indexed donor, uint256 amount, string message)',
  'event FundDistributed(uint256 indexed tokenId, address indexed heir, uint256 amount)'
]

export function useGraveContract(options: UseGraveContractOptions = {}) {
  const {
    contractAddress = process.env.NEXT_PUBLIC_GRAVE_CONTRACT_ADDRESS,
    chainId = 1,
    autoInitialize = true
  } = options

  const [state, setState] = useState<GraveContractState>({
    isConnected: false,
    isLoading: false,
    error: null,
    currentChainId: chainId,
    userAddress: null,
    memorials: []
  })

  const [contract, setContract] = useState<Contract | null>(null)
  const [provider, setProvider] = useState<BrowserProvider | null>(null)

  // Initialize contract
  const initialize = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      if (!window.ethereum) {
        throw new Error('MetaMask or Web3 wallet not detected')
      }

      if (!contractAddress) {
        throw new Error('Contract address not configured')
      }

      const browserProvider = new BrowserProvider(window.ethereum)
      const signer = await browserProvider.getSigner()
      const userAddress = await signer.getAddress()

      const graveContract = new Contract(
        contractAddress,
        GRAVE_MEMORIAL_ABI,
        signer
      )

      // Get chain ID
      const network = await browserProvider.getNetwork()
      const currentChainId = Number(network.chainId)

      setProvider(browserProvider)
      setContract(graveContract)

      setState(prev => ({
        ...prev,
        isConnected: true,
        isLoading: false,
        userAddress,
        currentChainId
      }))

      SecureLogger.log('✅ Grave contract initialized:', { userAddress, currentChainId })
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize contract'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isConnected: false
      }))
      SecureLogger.error('❌ Contract initialization failed:', errorMessage)
      return false
    }
  }, [contractAddress])

  // Auto-initialize on mount
  useEffect(() => {
    if (autoInitialize) {
      initialize()
    }
  }, [autoInitialize, initialize])

  // Create memorial
  const createMemorial = useCallback(
    async (params: CreateMemorialParams) => {
      try {
        if (!contract) throw new Error('Contract not initialized')

        setState(prev => ({ ...prev, isLoading: true, error: null }))

        const tx = await contract.createMemorial(
          params.ipfsHash,
          params.heirs,
          params.artistName
        )

        const receipt = await tx.wait()

        setState(prev => ({ ...prev, isLoading: false }))
        SecureLogger.log('✅ Memorial created:', receipt.transactionHash)

        return {
          success: true,
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create memorial'
        setState(prev => ({ ...prev, isLoading: false, error: errorMessage }))
        SecureLogger.error('❌ Create memorial failed:', errorMessage)
        throw error
      }
    },
    [contract]
  )

  // Donate to memorial
  const donate = useCallback(
    async (memorialId: string, params: DonationParams) => {
      try {
        if (!contract) throw new Error('Contract not initialized')

        setState(prev => ({ ...prev, isLoading: true, error: null }))

        const amountWei = ethers.parseEther(params.amount)
        const message = params.message || ''

        const tx = await contract.donate(memorialId, message, {
          value: amountWei
        })

        const receipt = await tx.wait()

        setState(prev => ({ ...prev, isLoading: false }))
        SecureLogger.log('✅ Donation successful:', receipt.transactionHash)

        return {
          success: true,
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to donate'
        setState(prev => ({ ...prev, isLoading: false, error: errorMessage }))
        SecureLogger.error('❌ Donation failed:', errorMessage)
        throw error
      }
    },
    [contract]
  )

  // Get memorial
  const getMemorial = useCallback(
    async (tokenId: string) => {
      try {
        if (!contract) throw new Error('Contract not initialized')

        const memorial = await contract.getMemorial(tokenId)

        return {
          ipfsHash: memorial[0],
          heirs: memorial[1],
          fundBalance: ethers.formatEther(memorial[2]),
          platformFee: memorial[3],
          artistName: memorial[4],
          isActive: memorial[5],
          createdAt: new Date(Number(memorial[6]) * 1000)
        } as MemorialData & { createdAt: Date }
      } catch (error) {
        SecureLogger.error('Failed to get memorial:', error)
        throw error
      }
    },
    [contract]
  )

  // Get user memorials
  const getUserMemorials = useCallback(
    async (userAddress: string) => {
      try {
        if (!contract) throw new Error('Contract not initialized')

        const memorialIds = await contract.getUserMemorials(userAddress)
        return memorialIds.map((id: bigint) => id.toString())
      } catch (error) {
        SecureLogger.error('Failed to get user memorials:', error)
        throw error
      }
    },
    [contract]
  )

  // Get memorial by artist
  const getMemorialByArtist = useCallback(
    async (artistName: string) => {
      try {
        if (!contract) throw new Error('Contract not initialized')

        const tokenId = await contract.getMemorialByArtist(artistName)
        return tokenId > 0 ? tokenId.toString() : null
      } catch (error) {
        SecureLogger.error('Failed to get memorial by artist:', error)
        return null
      }
    },
    [contract]
  )

  // Visit memorial
  const visitMemorial = useCallback(
    async (tokenId: string) => {
      try {
        if (!contract) throw new Error('Contract not initialized')

        setState(prev => ({ ...prev, isLoading: true, error: null }))

        const tx = await contract.visitMemorial(tokenId)
        await tx.wait()

        setState(prev => ({ ...prev, isLoading: false }))
        SecureLogger.log('✅ Memorial visited')

        return { success: true }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to visit memorial'
        setState(prev => ({ ...prev, isLoading: false, error: errorMessage }))
        SecureLogger.error('❌ Visit memorial failed:', errorMessage)
        throw error
      }
    },
    [contract]
  )

  // Distribute to heirs
  const distributeToHeirs = useCallback(
    async (tokenId: string) => {
      try {
        if (!contract) throw new Error('Contract not initialized')

        setState(prev => ({ ...prev, isLoading: true, error: null }))

        const tx = await contract.distributeToHeirs(tokenId)
        const receipt = await tx.wait()

        setState(prev => ({ ...prev, isLoading: false }))
        SecureLogger.log('✅ Distribution successful:', receipt.transactionHash)

        return {
          success: true,
          transactionHash: receipt.transactionHash
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to distribute funds'
        setState(prev => ({ ...prev, isLoading: false, error: errorMessage }))
        SecureLogger.error('❌ Distribution failed:', errorMessage)
        throw error
      }
    },
    [contract]
  )

  // Get token URI
  const getTokenURI = useCallback(
    async (tokenId: string) => {
      try {
        if (!contract) throw new Error('Contract not initialized')

        return await contract.tokenURI(tokenId)
      } catch (error) {
        SecureLogger.error('Failed to get token URI:', error)
        throw error
      }
    },
    [contract]
  )

  // Switch chain
  const switchChain = useCallback(
    async (newChainId: number) => {
      try {
        if (!window.ethereum) throw new Error('MetaMask not detected')

        const chainIdHex = `0x${newChainId.toString(16)}`

        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }]
        })

        setState(prev => ({ ...prev, currentChainId: newChainId }))
        SecureLogger.log('✅ Switched to chain:', newChainId)

        return { success: true }
      } catch (error: any) {
        if (error.code === 4902) {
          SecureLogger.warn('⚠️ Chain not added to MetaMask')
          throw new Error('Chain not added to MetaMask. Please add it manually.')
        }
        throw error
      }
    },
    []
  )

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    // State
    isConnected: state.isConnected,
    isLoading: state.isLoading,
    error: state.error,
    currentChainId: state.currentChainId,
    userAddress: state.userAddress,

    // Methods
    initialize,
    createMemorial,
    donate,
    getMemorial,
    getUserMemorials,
    getMemorialByArtist,
    visitMemorial,
    distributeToHeirs,
    getTokenURI,
    switchChain,
    clearError
  }
}
