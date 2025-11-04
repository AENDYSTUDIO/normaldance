/**
 * Тесты для InputSanitizer в NORMALDANCE.
 * Проверяет санитизацию различных типов входных данных.
 */

import { InputSanitizer } from "../input-sanitizer";
import { detectSuspiciousPatterns } from "../security-utils";

describe("InputSanitizer", () => {
  describe("sanitizeHtml", () => {
    test("should sanitize basic HTML", () => {
      const input = '<script>alert("XSS")</script>';
      const expected = '<script>alert("XSS")</script>';
      expect(InputSanitizer.sanitizeHtml(input)).toBe(expected);
    });

    test("should sanitize HTML with various tags", () => {
      const input =
        '<img src="x" onerror="alert(1)"> <a href="javascript:alert(1)">Click</a>';
      const result = InputSanitizer.sanitizeHtml(input);
      expect(result).toContain("<img");
      expect(result).toContain("javascript:alert(1)");
      expect(result).not.toContain("onerror");
    });

    test("should limit HTML length", () => {
      const longInput = "a".repeat(11000); // больше 10000 лимита
      const result = InputSanitizer.sanitizeHtml(longInput);
      expect(result.length).toBeLessThanOrEqual(10000);
    });
  });

  describe("sanitizeLog", () => {
    test("should sanitize string input", () => {
      const input = "User input with <script>alert(1)</script>";
      const result = InputSanitizer.sanitizeLog(input);
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("\n");
      expect(result).not.toContain("\r");
      expect(result).not.toContain("\t");
    });

    test("should sanitize non-string input", () => {
      const input = { malicious: "<script>alert(1)</script>", number: 123 };
      const result = InputSanitizer.sanitizeLog(input);
      expect(result).not.toContain("<script>");
      expect(result).toContain("123");
    });

    test("should detect suspicious patterns in log", () => {
      const input = "SELECT * FROM users WHERE id = 1 OR 1=1";
      // Проверяем, что detectSuspiciousPatterns работает корректно
      const suspicious = detectSuspiciousPatterns(input);
      expect(suspicious).toContain("Possible SQL injection pattern");
    });

    test("should limit log length", () => {
      const longInput = "a".repeat(1500); // больше 1000 лимита
      const result = InputSanitizer.sanitizeLog(longInput);
      expect(result.length).toBeLessThanOrEqual(1000);
    });
  });

  describe("validatePath", () => {
    test("should validate safe path", () => {
      const input = "folder/file.txt";
      expect(() => InputSanitizer.validatePath(input)).not.toThrow();
      expect(InputSanitizer.validatePath(input)).toBe("folder/file.txt");
    });

    test("should prevent path traversal", () => {
      const input = "../../../etc/passwd";
      expect(InputSanitizer.validatePath(input)).toBe("etc/passwd");
    });

    test("should remove dangerous characters from path", () => {
      const input = "file<>.txt";
      expect(InputSanitizer.validatePath(input)).toBe("file.txt");
    });
  });

  describe("sanitizeSQL", () => {
    test("should sanitize SQL injection attempts", () => {
      const input = "'; DROP TABLE users; --";
      const result = InputSanitizer.sanitizeSQL(input);
      expect(result).not.toContain("DROP TABLE");
      expect(result).not.toContain(";");
      expect(result).toContain("''");
    });

    test("should handle OR 1=1 SQL injection", () => {
      const input = "1 OR 1=1";
      const result = InputSanitizer.sanitizeSQL(input);
      expect(result).not.toContain("OR 1=1");
    });

    test("should handle UNION SELECT SQL injection", () => {
      const input = "UNION SELECT * FROM users";
      const result = InputSanitizer.sanitizeSQL(input);
      expect(result).not.toContain("UNION");
      expect(result).not.toContain("SELECT");
    });

    test("should handle comments in SQL", () => {
      const input = "SELECT * FROM users -- comment";
      const result = InputSanitizer.sanitizeSQL(input);
      expect(result).not.toContain("--");
    });
  });

  describe("security patterns detection", () => {
    test("should detect XSS patterns", () => {
      const xssInputs = [
        "<script>alert(1)</script>",
        '<img src="x" onerror="alert(1)">',
        "javascript:alert(1)",
        '<svg onload="alert(1)">',
      ];

      xssInputs.forEach((input) => {
        const result = detectSuspiciousPatterns(input);
        expect(result.length).toBeGreaterThan(0);
      });
    });

    test("should detect SQL injection patterns", () => {
      const sqlInputs = [
        "1 OR 1=1",
        "'; DROP TABLE users; --",
        "UNION SELECT password FROM users",
        "admin'--",
      ];

      sqlInputs.forEach((input) => {
        const result = detectSuspiciousPatterns(input);
        expect(result).toContain("Possible SQL injection pattern");
      });
    });

    test("should detect path traversal patterns", () => {
      const pathInputs = [
        "../../../etc/passwd",
        "..\\..\\windows\\system32",
        "file.txt%00../../../etc/passwd",
      ];

      pathInputs.forEach((input) => {
        const result = detectSuspiciousPatterns(input);
        expect(result).toContain("Path traversal pattern detected");
      });
    });

    test("should detect command injection patterns", () => {
      const cmdInputs = [
        "file.txt; rm -rf /",
        "input `rm -rf /`",
        "file.txt | cat /etc/passwd",
        "input $(whoami)",
      ];

      cmdInputs.forEach((input) => {
        const result = detectSuspiciousPatterns(input);
        expect(result).toContain("Command injection characters detected");
      });
    });
  });

  test("should throw error for command sanitization", () => {
    expect(() => {
      InputSanitizer.sanitizeCommand("rm -rf /");
    }).toThrow("Command execution not allowed");
  });
});
