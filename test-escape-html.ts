import { escapeHTML } from "./src/lib/security/xss-csrf";

// Тест для проверки работы escapeHTML
console.log("Тест 1: Экранирование HTML тегов");
const test1 = '<script>alert("xss")</script>';
const result1 = escapeHTML(test1);
console.log("Вход:", test1);
console.log("Выход:", result1);
console.log("Ожидается: &lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;");
console.log("Результат верен:", result1 === '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');

console.log("\nТест 2: Экранирование специальных символов");
const test2 = "& < > \" ' /";
const result2 = escapeHTML(test2);
console.log("Вход:", test2);
console.log("Выход:", result2);
console.log("Ожидается: &amp; &lt; &gt; &quot; &#x27; &#x2F;");
console.log("Результат верен:", result2 === '&amp; &lt; &gt; &quot; &#x27; &#x2F;');

console.log("\nТест 3: Идемпотентность");
const test3 = '<script>alert("xss")</script>';
const result3_first = escapeHTML(test3);
const result3_second = escapeHTML(result3_first);
console.log("Вход:", test3);
console.log("Первое применение:", result3_first);
console.log("Второе применение:", result3_second);
console.log("Результаты совпадают:", result3_first === result3_second);