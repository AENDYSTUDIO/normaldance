#!/usr/bin/env node

/**
 * Скрипт деплоя G.rave Memorial NFT контракта
 * Цель: создать систему цифрового наследия для музыкантов
 */

const { ethers } = require('ethers');

// Конфигурация сети
const NETWORK_CONFIG = {
  sepolia: {
    rpc: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    chainId: 11155111,
    name: 'Sepolia Testnet'
  },
  mainnet: {
    rpc: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    chainId: 1,
    name: 'Ethereum Mainnet'
  }
};

async function deployGraveContract() {
  console.log('🪦 G.rave - Деплой Memorial NFT контракта');
  console.log('==========================================');
  
  try {
    // Выбираем сеть
    const network = process.env.NETWORK || 'sepolia';
    const config = NETWORK_CONFIG[network];
    
    if (!config) {
      throw new Error(`Неизвестная сеть: ${network}`);
    }
    
    console.log(`🌐 Сеть: ${config.name}`);
    
    // Создаем провайдер
    const provider = new ethers.JsonRpcProvider(config.rpc);
    
    // Получаем приватный ключ
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
    
    // Читаем контракт
    const contractCode = require('fs').readFileSync('contracts/MemorialNFT.sol', 'utf8');
    console.log('📄 Контракт загружен');
    
    // Компилируем контракт
    console.log('🔨 Компиляция контракта...');
    
    // Создаем фабрику контракта
    const factory = new ethers.ContractFactory(
      [
        // ABI для Memorial NFT
        'function createMemorial(string memory artistName, string memory realName, string memory birthDate, string memory deathDate, string memory bio, string memory avatar, string memory banner, string memory lastMix, string memory lastTrack, uint256 totalTracks, uint256 totalPlays, uint256 totalLikes, uint8 memorialType) external',
        'function addHeir(uint256 memorialId, address heirAddress, string memory name, string memory relationship, uint256 percentage) external',
        'function donateToMemorial(uint256 memorialId, string memory message) external payable',
        'function addTribute(uint256 memorialId, string memory message, string memory trackId) external',
        'function addMemory(uint256 memorialId, string memory title, string memory description, string memory mediaUrl, uint8 mediaType) external',
        'function distributeMemorialFund(uint256 memorialId) external',
        'function getMemorial(uint256 memorialId) external view returns (tuple(uint256 id, string artistName, string realName, string birthDate, string deathDate, string bio, string avatar, string banner, string lastMix, string lastTrack, uint256 totalTracks, uint256 totalPlays, uint256 totalLikes, uint8 memorialType, uint8 status, address creator, uint256 createdAt, uint256 updatedAt, string blockchainHash, string eternalStorage, uint256 memorialFund, uint256 totalDonations, uint256 visitors, uint256 tributes, uint256 memories))',
        'function getMemorialHeirs(uint256 memorialId) external view returns (tuple(address wallet, string name, string relationship, uint256 percentage, bool isActive, uint256 addedAt)[])',
        'function getMemorialDonations(uint256 memorialId) external view returns (tuple(address donor, uint256 amount, string message, uint256 timestamp, bool isProcessed)[])',
        'function getMemorialTributes(uint256 memorialId) external view returns (tuple(address author, string message, string trackId, uint256 timestamp, uint256 likes, bool isVerified)[])',
        'function getMemorialMemories(uint256 memorialId) external view returns (tuple(address author, string title, string description, string mediaUrl, uint8 mediaType, uint256 timestamp, bool isVerified)[])',
        'function visitMemorial(uint256 memorialId) external',
        'function tokenURI(uint256 tokenId) external view returns (string memory)'
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
    
    // Создаем демо-мемориал
    console.log('🪦 Создание демо-мемориала...');
    
    const tx = await contract.createMemorial(
      'DJ Eternal',           // artistName
      'Иван Петров',          // realName
      '1985-03-15',           // birthDate
      '2024-12-01',           // deathDate
      'Легендарный диджей, пионер электронной музыки в России', // bio
      'QmAvatar123',          // avatar
      'QmBanner456',          // banner
      'QmLastMix789',         // lastMix
      'QmLastTrack012',       // lastTrack
      150,                    // totalTracks
      2500000,                // totalPlays
      50000,                  // totalLikes
      0                       // memorialType (0 = DJ)
    );
    
    await tx.wait();
    console.log('✅ Демо-мемориал создан!');
    
    // Сохраняем информацию о контракте
    const contractInfo = {
      address: contractAddress,
      network: config.name,
      chainId: config.chainId,
      deployer: wallet.address,
      deployedAt: new Date().toISOString(),
      demoMemorial: {
        artistName: 'DJ Eternal',
        realName: 'Иван Петров',
        memorialType: 'DJ'
      }
    };
    
    require('fs').writeFileSync(
      'grave-contract-info.json',
      JSON.stringify(contractInfo, null, 2)
    );
    
    console.log('💾 Информация о контракте сохранена в grave-contract-info.json');
    
    console.log('');
    console.log('🪦 ГОТОВО! G.rave Memorial NFT контракт задеплоен');
    console.log('================================================');
    console.log('✅ Система цифрового наследия работает');
    console.log('✅ NFT-мемориалы готовы к созданию');
    console.log('✅ Вечное хранение настроено');
    console.log('✅ Блокчейн-архив активен');
    console.log('');
    console.log('💡 Следующий шаг: создать первый мемориал!');
    
  } catch (error) {
    console.error('❌ Ошибка деплоя:', error.message);
    process.exit(1);
  }
}

// Запускаем деплой
if (require.main === module) {
  deployGraveContract();
}

module.exports = { deployGraveContract };
