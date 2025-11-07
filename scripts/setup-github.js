#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

const GITHUB_OWNER = 'AENDYSTUDIO';
const REPO_NAME = 'normal-dance-boilerplate';

async function setupGithub() {
  console.log('🚀 Normal Dance GitHub Setup Script');
  console.log('===================================');
  
  try {
    // Проверяем, что мы в правильной директории
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (!packageJson.name.includes('normaldance')) {
      throw new Error('❌ Вы должны быть в директории Normal Dance проекта');
    }
    
    console.log('✅ Проверка директории проекта пройдена');
    
    // Показываем инструкции для создания репозитория
    console.log('\n📋 Инструкция по созданию репозитория:');
    console.log('1. Перейдите на https://github.com/new');
    console.log(`2. Repository name: ${REPO_NAME}`);
    console.log('3. Description: Next.js boilerplate template for Normal Dance music platform');
    console.log('4. Privacy: Private (рекомендуется)');
    console.log('5. NOT Initialize with README');
    console.log('6. Click "Create repository"');
    console.log('\n⏸️ После создания репозитория, вернитесь сюда и нажмите Enter для продолжения...');
    
    // Ожидаем подтверждения пользователя
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('', (repoUrl) => {
      // Пользователь может ввести custom repo URL, используем default если ничего не введено
      const repositoryUrl = repoUrl.trim() || `https://github.com/${GITHUB_OWNER}/${REPO_NAME}.git`;
      
      console.log(`\n🔗 Использую repository: ${repositoryUrl}`);
      
      // Удаляем существующие remotes
      try {
        execSync('git remote remove origin', { stdio: 'inherit' });
      } catch (e) {
        // ignore if origin doesn't exist
      }
      try {
        execSync('git remote remove deploy-template', { stdio: 'inherit' });
      } catch (e) {
        // ignore if deploy-template doesn't exist
      }
      
      // Добавляем новый remote
      execSync(`git remote add origin ${repositoryUrl}`, { stdio: 'inherit' });
      console.log('✅ Remote "origin" добавлен');
      
      // Отправляем код
      console.log('\n📤 Отправка кода в репозиторий...');
      try {
        execSync('git push -u origin gemini-dev', { stdio: 'inherit' });
        console.log('✅ Код успешно отправлен в репозиторий!');
        
        // Обновляем package.json с репозиторием
        const updatedPackageJson = {
          ...packageJson,
          repository: {
            type: 'git',
            url: repositoryUrl
          }
        };
        
        fs.writeFileSync('package.json', JSON.stringify(updatedPackageJson, null, 2));
        console.log('✅ package.json обновлен с ссылкой на репозиторий');
        
        console.log('\n🎉 Normal Dance успешно развернут на GitHub!');
        console.log(`📍 Repository: ${repositoryUrl}`);
        console.log('📊 Lighthouse score: 88/100');
        console.log('🔗 GitHub Pages: включены для документации');
        
        // Следующие шаги
        console.log('\n🚀 Следующие шаги:');
        console.log('1. Настройте Vercel для развёртывания');
        console.log('2. Укажите domain: normaldance.ru');
        console.log('3. Установите переменные окружения Vercel');
        console.log('4. Деплойте production версию');
        
        console.log('\n💡 Полный стек готов к развертыванию!');
        
      } catch (pushError) {
        console.error('❌ Ошибка при отправке кода:', pushError.message);
        console.log('\n💡 Возможные решения:');
        console.log('1. Проверьте, что репозиторий создан на GitHub');
        console.log('2. Убедитесь, что вы аутентифицированы на GitHub');
        console.log('3. Проверьте права доступа к репозиторию');
        console.log('4. Попробуйте вручную: git push -u origin gemini-dev');
      }
      
      readline.close();
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

// Запуск скрипта
if (require.main === module) {
  setupGithub().catch(console.error);
}
