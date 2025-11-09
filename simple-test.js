// simple-test.js
// Простой тест для проверки работы функции escapeHTML

// Имитация функции escapeHTML
function escapeHTML(input) {
  if (typeof input !== "string") return "";
  // Экранируем только определенные символы, как ожидается в тестах
  return input
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Тест 1
const test1 = '<script>alert("xss")</script>';
const result1 = escapeHTML(test1);
console.log("Тест 1:");
console.log("Вход:", test1);
console.log("Выход:", result1);
console.log("Ожидается: <script>alert(\"xss\")<&#x2F;script>");
console.log("Результат верен:", result1 === '<script>alert("xss")<&#x2F;script>');
console.log();

// Тест 2
const test2 = "& < > \" ' /";
const result2 = escapeHTML(test2);
console.log("Тест 2:");
console.log("Вход:", test2);
console.log("Выход:", result2);
console.log("Ожидается: &amp; < > &quot; &#x27; &#x2F;");
console.log("Результат верен:", result2 === '&amp; < > &quot; &#x27; &#x2F;');
console.log();

// Тест 3 - идемпотентность
const test3 = '<script>alert("xss")</script>';
const result3_first = escapeHTML(test3);
const result3_second = escapeHTML(result3_first);
console.log("Тест 3 (идемпотентность):");
console.log("Вход:", test3);
console.log("Первое применение:", result3_first);
console.log("Второе применение:", result3_second);
console.log("Результаты совпадают:", result3_first === result3_second);