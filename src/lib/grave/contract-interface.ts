import { SecureLogger } from '@/lib/security/secure-logger';
import { ethers, Contract, Signer, BrowserProvider } from 'ethers'

export interface MemorialData {
  ipfsHash: string
  heirs: string[]
  fundBalance: bigint
  platformFee: number
  artistName: string
  isActive: boolean
  createdAt: bigint
}

export interface DonationParams {
  memorialId: string
  amount: string // in ETH
  message?: string
  isAnonymous?: boolean
}

export interface CreateMemorialParams {
  artistName: string
  ipfsHash: string
  heirs: string[]
  message?: string
}

export interface MemorialWithDonations extends MemorialData {
  tokenId: number
  donations: DonationData[]
  visitCount: number
}

export interface DonationData {
  donor: string
  amount: bigint
  message: string
  timestamp: bigint
  transactionHash: string
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

export class GraveContractInterface {
  private contract: Contract | null = null
  private signer: Signer | null = null
  private contractAddress: string
  private currentChainId: number

  constructor(contractAddress: string, chainId: number = 1) {
    this.contractAddress = contractAddress
    this.currentChainId = chainId
  }

  /**
   * Initialize contract with signer (for write operations)
   */
  async initialize(signerOrProvider: Signer | BrowserProvider): Promise<void> {
    try {
      if (signerOrProvider instanceof ethers.Signer) {
        this.signer = signerOrProvider
        this.contract = new Contract(
          this.contractAddress,
          GRAVE_MEMORIAL_ABI,
          signerOrProvider
        )
      } else {
        // BrowserProvider case
        const provider = signerOrProvider as BrowserProvider
        const signer = await provider.getSigner()
        this.signer = signer
        this.contract = new Contract(
          this.contractAddress,
          GRAVE_MEMORIAL_ABI,
          signer
        )
      }
      SecureLogger.log(`✅ Contract initialized at ${this.contractAddress}`)
    } catch (error) {
      SecureLogger.error('❌ Failed to initialize contract:', error)
      throw error
    }
  }

  /**
   * Initialize with provider only (for read operations)
   */
  async initializeProvider(provider: BrowserProvider): Promise<void> {
    try {
      this.contract = new Contract(
        this.contractAddress,
        GRAVE_MEMORIAL_ABI,
        provider
      )
      SecureLogger.log(`✅ Contract provider initialized at ${this.contractAddress}`)
    } catch (error) {
      SecureLogger.error('❌ Failed to initialize provider:', error)
      throw error
    }
  }

  /**
   * Create a new memorial
   */
  async createMemorial(params: CreateMemorialParams): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized')

    try {
      SecureLogger.log(`🪦 Creating memorial for ${params.artistName}...`)

      const tx = await this.contract.createMemorial(
        params.ipfsHash,
        params.heirs,
        params.artistName
      )

      const receipt = await tx.wait()
      SecureLogger.log(`✅ Memorial created: ${receipt.transactionHash}`)

      return receipt.transactionHash
    } catch (error) {
      SecureLogger.error('❌ Failed to create memorial:', error)
      throw error
    }
  }

  /**
   * Donate to a memorial
   */
  async donate(memorialId: string, params: DonationParams): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized')

    try {
      SecureLogger.log(`💰 Donating ${params.amount} ETH to memorial ${memorialId}...`)

      const amountWei = ethers.parseEther(params.amount)
      const message = params.message || ''

      const tx = await this.contract.donate(
        memorialId,
        message,
        { value: amountWei }
      )

      const receipt = await tx.wait()
      SecureLogger.log(`✅ Donation successful: ${receipt.transactionHash}`)

      return receipt.transactionHash
    } catch (error) {
      SecureLogger.error('❌ Failed to donate:', error)
      throw error
    }
  }

  /**
   * Get memorial details
   */
  async getMemorial(tokenId: string): Promise<MemorialData> {
    if (!this.contract) throw new Error('Contract not initialized')

    try {
      const memorial = await this.contract.getMemorial(tokenId)
      return {
        ipfsHash: memorial[0],
        heirs: memorial[1],
        fundBalance: memorial[2],
        platformFee: memorial[3],
        artistName: memorial[4],
        isActive: memorial[5],
        createdAt: memorial[6]
      }
    } catch (error) {
      SecureLogger.error('❌ Failed to get memorial:', error)
      throw error
    }
  }

  /**
   * Get all memorials for a user
   */
  async getUserMemorials(userAddress: string): Promise<string[]> {
    if (!this.contract) throw new Error('Contract not initialized')

    try {
      const memorialIds = await this.contract.getUserMemorials(userAddress)
      return memorialIds.map((id: bigint) => id.toString())
    } catch (error) {
      SecureLogger.error('❌ Failed to get user memorials:', error)
      throw error
    }
  }

  /**
   * Get memorial by artist name
   */
  async getMemorialByArtist(artistName: string): Promise<string | null> {
    if (!this.contract) throw new Error('Contract not initialized')

    try {
      const tokenId = await this.contract.getMemorialByArtist(artistName)
      return tokenId > 0 ? tokenId.toString() : null
    } catch (error) {
      SecureLogger.error('❌ Failed to get memorial by artist:', error)
      return null
    }
  }

  /**
   * Visit memorial (increment visitor count)
   */
  async visitMemorial(tokenId: string): Promise<void> {
    if (!this.contract) throw new Error('Contract not initialized')

    try {
      const tx = await this.contract.visitMemorial(tokenId)
      await tx.wait()
      SecureLogger.log(`✅ Memorial visited`)
    } catch (error) {
      SecureLogger.error('❌ Failed to visit memorial:', error)
      throw error
    }
  }

  /**
   * Distribute funds to heirs
   */
  async distributeToHeirs(tokenId: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized')

    try {
      SecureLogger.log(`💸 Distributing funds from memorial ${tokenId}...`)

      const tx = await this.contract.distributeToHeirs(tokenId)
      const receipt = await tx.wait()
      SecureLogger.log(`✅ Distribution successful: ${receipt.transactionHash}`)

      return receipt.transactionHash
    } catch (error) {
      SecureLogger.error('❌ Failed to distribute funds:', error)
      throw error
    }
  }

  /**
   * Get token URI (NFT metadata)
   */
  async getTokenURI(tokenId: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized')

    try {
      return await this.contract.tokenURI(tokenId)
    } catch (error) {
      SecureLogger.error('❌ Failed to get token URI:', error)
      throw error
    }
  }

  /**
   * Emergency withdraw (owner only)
   */
  async emergencyWithdraw(): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized')

    try {
      SecureLogger.log(`🚨 Executing emergency withdrawal...`)

      const tx = await this.contract.emergencyWithdraw()
      const receipt = await tx.wait()
      SecureLogger.log(`✅ Emergency withdrawal successful: ${receipt.transactionHash}`)

      return receipt.transactionHash
    } catch (error) {
      SecureLogger.error('❌ Failed to execute emergency withdrawal:', error)
      throw error
    }
  }

  /**
   * Switch to different chain
   */
  async switchChain(newChainId: number): Promise<void> {
    if (!window.ethereum) throw new Error('MetaMask not detected')

    try {
      const chainIdHex = `0x${newChainId.toString(16)}`
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }]
      })
      this.currentChainId = newChainId
      SecureLogger.log(`✅ Switched to chain ${newChainId}`)
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to MetaMask
        SecureLogger.warn('⚠️ Chain not added to MetaMask')
      }
      throw error
    }
  }

  /**
   * Get current chain ID
   */
  getCurrentChainId(): number {
    return this.currentChainId
  }

  /**
   * Check if contract is initialized
   */
  isInitialized(): boolean {
    return this.contract !== null && this.signer !== null
  }
}

/**
 * Singleton instance factory
 */
let graveContractInstance: GraveContractInterface | null = null

export async function initializeGraveContract(
  contractAddress: string,
  provider: BrowserProvider | Signer,
  chainId?: number
): Promise<GraveContractInterface> {
  const address = contractAddress || process.env.NEXT_PUBLIC_GRAVE_CONTRACT_ADDRESS || ''

  if (!address) {
    throw new Error('GRAVE_CONTRACT_ADDRESS not configured')
  }

  graveContractInstance = new GraveContractInterface(address, chainId)

  if (provider instanceof ethers.Signer) {
    await graveContractInstance.initialize(provider)
  } else {
    // BrowserProvider
    await graveContractInstance.initializeProvider(provider)
  }

  return graveContractInstance
}

export function getGraveContractInstance(): GraveContractInterface {
  if (!graveContractInstance) {
    throw new Error('GraveContractInterface not initialized. Call initializeGraveContract first.')
  }
  return graveContractInstance
}
