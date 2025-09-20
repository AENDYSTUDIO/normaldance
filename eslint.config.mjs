import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // КРИТИЧЕСКИЕ ПРАВИЛА БЕЗОПАСНОСТИ - ВКЛЮЧЕНЫ
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      "no-alert": "warn",
      "no-console": "warn", // Включено для продакшена
      "no-debugger": "error",
      
      // TypeScript правила - частично включены для безопасности
      "@typescript-eslint/no-explicit-any": "warn", // Включено с предупреждением
      "@typescript-eslint/no-unused-vars": "warn", // Включено с предупреждением
      "@typescript-eslint/no-non-null-assertion": "warn", // Включено с предупреждением
      "@typescript-eslint/ban-ts-comment": "warn", // Включено с предупреждением
      "@typescript-eslint/prefer-as-const": "off",
      
      // React правила - включены критические
      "react-hooks/exhaustive-deps": "warn", // Включено с предупреждением
      "react/no-unescaped-entities": "error", // Включено для XSS защиты
      "react/display-name": "off",
      "react/prop-types": "off",
      "react/jsx-no-target-blank": "error", // Включено для безопасности
      
      // Next.js правила
      "@next/next/no-img-element": "warn", // Включено с предупреждением
      "@next/next/no-html-link-for-pages": "off",
      
      // JavaScript правила - включены критические
      "prefer-const": "warn", // Включено с предупреждением
      "no-unused-vars": "warn", // Включено с предупреждением
      "no-empty": "warn", // Включено с предупреждением
      "no-irregular-whitespace": "error", // Включено для безопасности
      "no-case-declarations": "error", // Включено для безопасности
      "no-fallthrough": "error", // Включено для безопасности
      "no-mixed-spaces-and-tabs": "error", // Включено для консистентности
      "no-redeclare": "error", // Включено для безопасности
      "no-undef": "error", // Включено для безопасности
      "no-unreachable": "warn", // Включено с предупреждением
      "no-useless-escape": "warn", // Включено с предупреждением
    },
  },
];

export default eslintConfig;
