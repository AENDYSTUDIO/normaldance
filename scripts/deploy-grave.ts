import { ethers } from 'hardhat'
import * as fs from 'fs'
import * as path from 'path'

interface DeploymentConfig {
  network: string
  rpcUrl: string
  privateKey: string
  verifyOnExplorer: boolean
  explorerUrl: string
  explorerApiKey: string
}

interface DeploymentResult {
  network: string
  contractAddress: string
  deploymentHash: string
  deployer: string
  timestamp: string
  blockNumber: number
}

async function getDeploymentConfig(network: string): Promise<DeploymentConfig> {
  const configs: { [key: string]: DeploymentConfig } = {
    localhost: {
      network: 'localhost',
      rpcUrl: 'http://127.0.0.1:8545',
      privateKey: process.env.PRIVATE_KEY || '0x' + '1'.repeat(64),
      verifyOnExplorer: false,
      explorerUrl: '',
      explorerApiKey: ''
    },
    sepolia: {
      network: 'sepolia',
      rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/' + (process.env.INFURA_PROJECT_ID || ''),
      privateKey: process.env.PRIVATE_KEY || '',
      verifyOnExplorer: true,
      explorerUrl: 'https://sepolia.etherscan.io',
      explorerApiKey: process.env.ETHERSCAN_API_KEY || ''
    },
    ethereum: {
      network: 'ethereum',
      rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/' + (process.env.ALCHEMY_API_KEY || ''),
      privateKey: process.env.PRIVATE_KEY || '',
      verifyOnExplorer: true,
      explorerUrl: 'https://etherscan.io',
      explorerApiKey: process.env.ETHERSCAN_API_KEY || ''
    },
    polygon: {
      network: 'polygon',
      rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com/',
      privateKey: process.env.PRIVATE_KEY || '',
      verifyOnExplorer: true,
      explorerUrl: 'https://polygonscan.com',
      explorerApiKey: process.env.POLYGONSCAN_API_KEY || ''
    },
    mumbai: {
      network: 'mumbai',
      rpcUrl: process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
      privateKey: process.env.PRIVATE_KEY || '',
      verifyOnExplorer: true,
      explorerUrl: 'https://mumbai.polygonscan.com',
      explorerApiKey: process.env.POLYGONSCAN_API_KEY || ''
    }
  }

  return configs[network] || configs.localhost
}

async function deployGraveMemorialNFT(config: DeploymentConfig): Promise<DeploymentResult> {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🪦 Deploying GraveMemorialNFT to ${config.network.toUpperCase()}`)
  console.log(`${'='.repeat(60)}\n`)

  // Validate environment
  if (!config.privateKey || config.privateKey === '0x' + '1'.repeat(64)) {
    throw new Error(`❌ PRIVATE_KEY not set for ${config.network}`)
  }

  // Create provider and signer
  const provider = new ethers.JsonRpcProvider(config.rpcUrl)
  const signer = new ethers.Wallet(config.privateKey, provider)

  console.log(`📝 Deployer Address: ${signer.address}`)

  // Check balance
  const balance = await provider.getBalance(signer.address)
  const balanceInEth = ethers.formatEther(balance)
  console.log(`💰 Account Balance: ${balanceInEth} ETH`)

  if (balance === 0n) {
    throw new Error(`❌ Deployer account has no balance on ${config.network}`)
  }

  // Get contract factory
  const GraveMemorialNFT = await ethers.getContractFactory('GraveMemorialNFT', signer)
  console.log(`\n📦 Deploying contract...`)

  // Deploy
  const contract = await GraveMemorialNFT.deploy()
  await contract.waitForDeployment()

  const contractAddress = await contract.getAddress()
  const deploymentTx = contract.deploymentTransaction()
  const blockNumber = await provider.getBlockNumber()

  console.log(`\n✅ Contract Deployed!`)
  console.log(`   Address: ${contractAddress}`)
  console.log(`   Tx Hash: ${deploymentTx?.hash}`)
  console.log(`   Block: ${blockNumber}`)

  // Wait for confirmations
  console.log(`\n⏳ Waiting for 5 confirmations...`)
  await contract.deploymentTransaction()?.wait(5)
  console.log(`✅ Confirmed!`)

  // Verify on explorer if applicable
  if (config.verifyOnExplorer && config.explorerApiKey) {
    console.log(`\n🔍 Verifying contract on explorer...`)
    try {
      await verifyContractOnExplorer(
        contractAddress,
        config.network,
        config.explorerUrl,
        config.explorerApiKey
      )
    } catch (error) {
      console.warn(`⚠️  Verification pending (can be done manually later)`)
    }
  }

  const result: DeploymentResult = {
    network: config.network,
    contractAddress,
    deploymentHash: deploymentTx?.hash || '',
    deployer: signer.address,
    timestamp: new Date().toISOString(),
    blockNumber
  }

  return result
}

async function verifyContractOnExplorer(
  contractAddress: string,
  network: string,
  explorerUrl: string,
  apiKey: string
): Promise<void> {
  // This would typically use Hardhat's verification plugin
  console.log(`   📍 Verify manually at: ${explorerUrl}/address/${contractAddress}`)
}

async function saveDeploymentInfo(result: DeploymentResult): Promise<void> {
  const deploymentsDir = path.join(process.cwd(), 'deployments')

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true })
  }

  const deploymentFile = path.join(deploymentsDir, `grave-${result.network}.json`)

  fs.writeFileSync(deploymentFile, JSON.stringify(result, null, 2))

  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`)

  // Also update master deployment file
  const masterFile = path.join(deploymentsDir, 'grave-deployments.json')
  let deployments: DeploymentResult[] = []

  if (fs.existsSync(masterFile)) {
    const data = fs.readFileSync(masterFile, 'utf-8')
    deployments = JSON.parse(data)
  }

  // Update or add deployment
  const index = deployments.findIndex(d => d.network === result.network)
  if (index >= 0) {
    deployments[index] = result
  } else {
    deployments.push(result)
  }

  fs.writeFileSync(masterFile, JSON.stringify(deployments, null, 2))
  console.log(`📋 Master deployments file updated: ${masterFile}`)
}

async function generateEnvFile(result: DeploymentResult): Promise<void> {
  const envContent = `
# G.Rave Deployment - ${result.network.toUpperCase()}
# Deployed: ${result.timestamp}

GRAVE_CONTRACT_ADDRESS_${result.network.toUpperCase()}=${result.contractAddress}
GRAVE_DEPLOYER_${result.network.toUpperCase()}=${result.deployer}
GRAVE_DEPLOYMENT_HASH_${result.network.toUpperCase()}=${result.deploymentHash}
GRAVE_BLOCK_NUMBER_${result.network.toUpperCase()}=${result.blockNumber}
`

  const envFile = path.join(process.cwd(), `.env.grave.${result.network}`)
  fs.writeFileSync(envFile, envContent)

  console.log(`\n📄 Environment file created: ${envFile}`)
  console.log(`   Add these to your .env file:`)
  console.log(envContent)
}

async function main(): Promise<void> {
  try {
    const network = process.argv[2] || 'localhost'
    const config = await getDeploymentConfig(network)

    const result = await deployGraveMemorialNFT(config)

    await saveDeploymentInfo(result)
    await generateEnvFile(result)

    console.log(`\n${'='.repeat(60)}`)
    console.log(`🎉 Deployment Complete!`)
    console.log(`${'='.repeat(60)}`)
    console.log(`
Contract Address: ${result.contractAddress}
Network: ${result.network}
Deployer: ${result.deployer}
Block: ${result.blockNumber}

Next Steps:
1. Test the contract: npx hardhat test --grep "GraveMemorialNFT"
2. Interact with contract: npx hardhat console --network ${network}
3. Update your API routes with the contract address
    `)

  } catch (error) {
    console.error(`\n❌ Deployment failed:`)
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

main()
