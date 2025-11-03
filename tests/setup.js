require('dotenv').config({ path: '.env.test' });

// Используем глобальный fetch для тестов
global.fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

process.env.NODE_ENV = 'test';
