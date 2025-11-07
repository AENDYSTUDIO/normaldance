#!/usr/bin/env node

/**
 * Скрипт для автоматического разрешения merge конфликтов
 * Использует версию после ======= (входящие изменения)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function resolveConflicts(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Проверяем наличие конфликтов
    if (!content.includes('<<<<<<< HEAD')) {
      return false;
    }

    // Разрешаем конфликты, используя версию после =======
    // Удаляем все от <<<<<<< HEAD до =======
    content = content.replace(/<<<<<<< HEAD[\s\S]*?=======\n/g, '');
    
    // Удаляем маркеры >>>>>>> и хеш коммита
    content = content.replace(/>>>>>>> [a-f0-9]+\n/g, '');
    
    // Удаляем оставшиеся маркеры
    content = content.replace(/=======\n/g, '');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Исправлен: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка в ${filePath}:`, error.message);
    return false;
  }
}

function findFilesWithConflicts(dir) {
  const files = [];
  
  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        // Пропускаем node_modules и .next
        if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
          walk(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('<<<<<<< HEAD')) {
            files.push(fullPath);
          }
        } catch (e) {
          // Игнорируем ошибки чтения
        }
      }
    }
  }
  
  walk(dir);
  return files;
}

// Основная функция
const projectRoot = path.join(__dirname, '..');
const filesWithConflicts = findFilesWithConflicts(path.join(projectRoot, 'src'));

console.log(`🔍 Найдено файлов с конфликтами: ${filesWithConflicts.length}`);

let fixed = 0;
for (const file of filesWithConflicts) {
  if (resolveConflicts(file)) {
    fixed++;
  }
}

console.log(`\n✅ Исправлено файлов: ${fixed}/${filesWithConflicts.length}`);

if (fixed > 0) {
  console.log('\n⚠️  ВНИМАНИЕ: Проверьте исправленные файлы вручную!');
  console.log('   Автоматическое разрешение может требовать дополнительной проверки.');
}

