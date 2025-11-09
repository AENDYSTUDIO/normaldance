// verify-fix.js
const { escapeHTML, escapeAttribute } = require('./src/lib/security/xss-csrf');

console.log('Проверка функции escapeHTML:');
console.log('========================');

// Тест 1: Экранирование основных HTML-сущностей
const test1 = '<script>alert("xss")</script>';
const result1 = escapeHTML(test1);
const expected1 = '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;';
console.log(`Тест 1: ${test1}`);
console.log(`Результат: ${result1}`);
console.log(`Ожидается: ${expected1}`);
console.log(`Пройден: ${result1 === expected1}\n`);

// Тест 2: Экранирование специальных символов
const test2 = "& < > \" ' /";
const result2 = escapeHTML(test2);
const expected2 = '&amp; &lt; &gt; &quot; &#x27; &#x2F;';
console.log(`Тест 2: ${test2}`);
console.log(`Результат: ${result2}`);
console.log(`Ожидается: ${expected2}`);
console.log(`Пройден: ${result2 === expected2}\n`);

// Тест 3: Идемпотентность
const test3 = '<div>Hello & "world"</div>';
const result3_first = escapeHTML(test3);
const result3_second = escapeHTML(result3_first);
console.log(`Тест 3 (идемпотентность): ${test3}`);
console.log(`Первое применение: ${result3_first}`);
console.log(`Второе применение: ${result3_second}`);
console.log(`Результаты совпадают: ${result3_first === result3_second}\n`);

console.log('\nПроверка функции escapeAttribute:');
console.log('===============================');

// Тест 4: Экранирование атрибутов
const test4 = '<script>alert("xss")</script>';
const result4 = escapeAttribute(test4);
const expected4 = '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;';
console.log(`Тест 4: ${test4}`);
console.log(`Результат: ${result4}`);
console.log(`Ожидается: ${expected4}`);
console.log(`Пройден: ${result4 === expected4}\n`);

console.log('Все тесты завершены!');