#!/usr/bin/env node

/**
 * Скрипт запуска продакшен сервера NORMAL DANCE
 * Цель: получить работающий сервер с 0 пользователями
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Устанавливаем переменные окружения для продакшена
process.env.NODE_ENV = 'production';
process.env.DATABASE_URL = 'file:./db/production.db';
process.env.SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com';
process.env.SOLANA_WS_URL = 'wss://api.mainnet-beta.solana.com';
process.env.IPFS_GATEWAY_URL = 'https://ipfs.io/ipfs/';
process.env.NEXTAUTH_URL = 'https://normaldance.com';
process.env.NEXTAUTH_SECRET = 'normaldance-secret-key-2025';
process.env.DISABLE_ANALYTICS = 'true';
process.env.HONEST_MODE = 'true';

console.log('🚀 NORMAL DANCE - Запуск продакшен сервера');
console.log('==========================================');

// Проверяем, что база данных существует
const dbPath = path.join(__dirname, '..', 'db', 'production.db');
if (!fs.existsSync(dbPath)) {
  console.error('❌ База данных не найдена. Запустите сначала: npx prisma migrate dev');
  process.exit(1);
}

// Собираем Next.js приложение
console.log('📦 Сборка Next.js приложения...');
const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Ошибка сборки Next.js');
    process.exit(1);
  }
  
  console.log('✅ Next.js приложение собрано');
  console.log('🌐 Запуск сервера...');
  
  // Запускаем сервер
  const serverProcess = spawn('node', ['server.ts'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..')
  });
  
  serverProcess.on('close', (code) => {
    console.log(`Сервер завершен с кодом ${code}`);
  });
  
  // Обработка Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Остановка сервера...');
    serverProcess.kill('SIGINT');
    process.exit(0);
  });
});
