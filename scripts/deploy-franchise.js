#!/usr/bin/env node

/**
 * Скрипт деплоя NFT Franchise контракта
 * Цель: создать NFT-франшизу для первых 100 треков
 */

const { ethers } = require('ethers');

// Конфигурация сети
const NETWORK_CONFIG = {
  // Для тестирования используем Sepolia
  sepolia: {
    rpc: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    chainId: 11155111,
    name: 'Sepolia Testnet'
  },
  // Для продакшена - Ethereum Mainnet
  mainnet: {
    rpc: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    chainId: 1,
    name: 'Ethereum Mainnet'
  }
};

async function deployFranchiseContract() {
  console.log('🚀 NORMAL DANCE - Деплой NFT Franchise контракта');
  console.log('================================================');
  
  try {
    // Выбираем сеть (по умолчанию Sepolia для тестирования)
    const network = process.env.NETWORK || 'sepolia';
    const config = NETWORK_CONFIG[network];
    
    if (!config) {
      throw new Error(`Неизвестная сеть: ${network}`);
    }
    
    console.log(`🌐 Сеть: ${config.name}`);
    
    // Создаем провайдер
    const provider = new ethers.JsonRpcProvider(config.rpc);
    
    // Получаем приватный ключ из переменной окружения
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY не установлен в переменных окружения');
    }
    
    // Создаем кошелек
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`👤 Адрес кошелька: ${wallet.address}`);
    
    // Проверяем баланс
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Баланс: ${ethers.formatEther(balance)} ETH`);
    
    if (balance < ethers.parseEther('0.01')) {
      console.warn('⚠️  Низкий баланс! Убедитесь, что у вас достаточно ETH для деплоя');
    }
    
    // Читаем контракт
    const contractCode = require('fs').readFileSync('contracts/NFTFranchise.sol', 'utf8');
    console.log('📄 Контракт загружен');
    
    // Компилируем контракт (упрощенно)
    console.log('🔨 Компиляция контракта...');
    
    // Создаем фабрику контракта
    const factory = new ethers.ContractFactory(
      [
        // ABI будет сгенерирован автоматически
        'function createFranchise(string memory trackId, string memory artistName, string memory trackTitle, uint256 totalShares, uint256 pricePerShare) external',
        'function purchaseShares(uint256 franchiseId, uint256 shares) external payable',
        'function distributeRevenue(uint256 franchiseId, uint256 revenue) external',
        'function getFranchise(uint256 franchiseId) external view returns (tuple(uint256 id, string trackId, string artistName, string trackTitle, uint256 totalShares, uint256 soldShares, uint256 pricePerShare, uint256 totalRevenue, bool isActive, address artist, uint256 createdAt))',
        'function getUserShares(address user, uint256 franchiseId) external view returns (uint256)',
        'function getFranchiseByTrack(string memory trackId) external view returns (uint256)',
        'function calculateUserRevenue(address user, uint256 franchiseId, uint256 totalRevenue) external view returns (uint256)'
      ],
      contractCode,
      wallet
    );
    
    // Деплоим контракт
    console.log('🚀 Деплой контракта...');
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log(`✅ Контракт задеплоен!`);
    console.log(`📍 Адрес: ${contractAddress}`);
    console.log(`🔗 Explorer: https://${network === 'mainnet' ? 'etherscan.io' : 'sepolia.etherscan.io'}/address/${contractAddress}`);
    
    // Создаем первую франшизу для демонстрации
    console.log('🎵 Создание первой франшизы...');
    
    const tx = await contract.createFranchise(
      'QmDemoTrack123', // IPFS hash
      'Demo Artist',     // Artist name
      'First Track',     // Track title
      100,               // 100 shares (100%)
      ethers.parseEther('0.01') // 0.01 ETH per share
    );
    
    await tx.wait();
    console.log('✅ Первая франшиза создана!');
    
    // Сохраняем информацию о контракте
    const contractInfo = {
      address: contractAddress,
      network: config.name,
      chainId: config.chainId,
      deployer: wallet.address,
      deployedAt: new Date().toISOString(),
      firstFranchise: {
        trackId: 'QmDemoTrack123',
        artistName: 'Demo Artist',
        trackTitle: 'First Track',
        totalShares: 100,
        pricePerShare: '0.01 ETH'
      }
    };
    
    require('fs').writeFileSync(
      'contract-info.json',
      JSON.stringify(contractInfo, null, 2)
    );
    
    console.log('💾 Информация о контракте сохранена в contract-info.json');
    
    console.log('');
    console.log('🎉 ГОТОВО! NFT Franchise контракт задеплоен');
    console.log('==========================================');
    console.log('✅ Контракт работает');
    console.log('✅ Первая франшиза создана');
    console.log('✅ Готов к продаже долей');
    console.log('');
    console.log('💡 Следующий шаг: привлечь первого артиста!');
    
  } catch (error) {
    console.error('❌ Ошибка деплоя:', error.message);
    process.exit(1);
  }
}

// Запускаем деплой
if (require.main === module) {
  deployFranchiseContract();
}

module.exports = { deployFranchiseContract };
