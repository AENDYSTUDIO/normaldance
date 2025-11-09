// test-escape-html-fixed.js
const fs = require('fs');
const path = require('path');

// Читаем содержимое файла xss-csrf.ts
const filePath = path.join(__dirname, 'src', 'lib', 'security', 'xss-csrf.ts');
const fileContent = fs.readFileSync(filePath, 'utf8');

// Извлекаем функцию escapeHTML из файла
const escapeHTMLMatch = fileContent.match(/export function escapeHTML\(input: string\): string \{[\s\S]*?\n\}/);
if (!escapeHTMLMatch) {
  console.error('Функция escapeHTML не найдена в файле');
  process.exit(1);
}

// Создаем функцию escapeHTML из извлеченного кода
const escapeHTMLCode = escapeHTMLMatch[0]
  .replace('export function escapeHTML(input: string): string', 'function escapeHTML(input)')
  .replace(/: string/g, '');

// Выполняем код функции
eval(escapeHTMLCode);

// Тест для проверки работы escapeHTML
console.log("Тест 1: Экранирование HTML тегов");
const test1 = '<script>alert("xss")</script>';
const result1 = escapeHTML(test1);
console.log("Вход:", test1);
console.log("Выход:", result1);
console.log("Ожидается: <script>alert(\"xss\")<&#x2F;script>");
console.log("Результат верен:", result1 === '<script>alert("xss")<&#x2F;script>');

console.log("\nТест 2: Экранирование специальных символов");
const test2 = "& < > \" ' /";
const result2 = escapeHTML(test2);
console.log("Вход:", test2);
console.log("Выход:", result2);
console.log("Ожидается: &amp; < > &quot; &#x27; &#x2F;");
console.log("Результат верен:", result2 === '&amp; < > &quot; &#x27; &#x2F;');

console.log("\nТест 3: Идемпотентность");
const test3 = '<script>alert("xss")</script>';
const result3_first = escapeHTML(test3);
const result3_second = escapeHTML(result3_first);
console.log("Вход:", test3);
console.log("Первое применение:", result3_first);
console.log("Второе применение:", result3_second);
console.log("Результаты совпадают:", result3_first === result3_second);