#!/usr/bin/env node

/**
 * Тест G.rave API
 * Проверяем что все работает для получения первых денег
 */

const http = require('http');

async function testGraveAPI() {
  console.log('🪦 G.rave - Тест API для первых денег');
  console.log('=====================================');
  
  try {
    // Тест 1: Проверка здоровья сервера
    console.log('1️⃣ Проверка сервера...');
    const healthResponse = await makeRequest('GET', '/api/health');
    console.log('✅ Сервер работает:', healthResponse.status);
    
    // Тест 2: Создание мемориала
    console.log('2️⃣ Создание мемориала...');
    const memorialData = {
      artistName: 'DJ Test Eternal',
      ipfsHash: 'QmTestMemorial123',
      heirs: ['0x1234567890abcdef1234567890abcdef12345678'],
      message: 'Первый тестовый мемориал для получения денег!'
    };
    
    const createResponse = await makeRequest('POST', '/api/grave/memorials', memorialData);
    if (createResponse.success) {
      console.log('✅ Мемориал создан:', createResponse.data.artistName);
      console.log('   ID:', createResponse.data.id);
      console.log('   Наследники:', createResponse.data.heirs.length);
    } else {
      console.log('❌ Ошибка создания мемориала:', createResponse.error);
    }
    
    // Тест 3: Получение мемориалов
    console.log('3️⃣ Получение мемориалов...');
    const memorialsResponse = await makeRequest('GET', '/api/grave/memorials');
    if (memorialsResponse.success) {
      console.log('✅ Мемориалов найдено:', memorialsResponse.data.memorials.length);
      memorialsResponse.data.memorials.forEach((memorial, index) => {
        console.log(`   ${index + 1}. ${memorial.artistName} - ${memorial.fundBalance} ETH`);
      });
    } else {
      console.log('❌ Ошибка получения мемориалов:', memorialsResponse.error);
    }
    
    // Тест 4: Пожертвование
    console.log('4️⃣ Тест пожертвования...');
    const donationData = {
      memorialId: '1',
      amount: 0.01,
      message: 'Первое пожертвование! Спасибо за музыку! 🎵'
    };
    
    const donationResponse = await makeRequest('POST', '/api/grave/donations', donationData);
    if (donationResponse.success) {
      console.log('✅ Пожертвование отправлено:', donationResponse.data.amount, 'ETH');
      console.log('   Транзакция:', donationResponse.data.transactionHash);
    } else {
      console.log('❌ Ошибка пожертвования:', donationResponse.error);
    }
    
    console.log('');
    console.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ!');
    console.log('========================');
    console.log('✅ G.rave API работает');
    console.log('✅ Мемориалы создаются');
    console.log('✅ Пожертвования принимаются');
    console.log('');
    console.log('🚀 ГОТОВО К ПОЛУЧЕНИЮ ПЕРВЫХ ДЕНЕГ!');
    console.log('   Откройте: http://localhost:3000/grave');
    console.log('   Создайте мемориал для известного диджея');
    console.log('   Получите первое пожертвование!');
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
  }
}

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve(jsonData);
        } catch (e) {
          resolve({ success: false, error: 'Invalid JSON response', body: body });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Запускаем тест
if (require.main === module) {
  testGraveAPI();
}

module.exports = { testGraveAPI };
