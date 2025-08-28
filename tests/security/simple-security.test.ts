import { describe, it, expect } from '@jest/globals';

describe('Security Testing - NormalDance Platform', () => {
  describe('OWASP Top 10 Security Tests', () => {
    it('should prevent SQL injection attacks', () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'--",
        "1' UNION SELECT * FROM users--",
        "1'; WAITFOR DELAY '0:0:5'--"
      ];

      maliciousInputs.forEach(maliciousInput => {
        // Simulate input validation
        const isValid = validateInput(maliciousInput);
        expect(isValid).toBe(false);
      });
    });

    it('should validate user input properly', () => {
      const testCases = [
        { input: 'normal_user', expected: true },
        { input: 'user123', expected: true },
        { input: '', expected: false },
        { input: '<script>alert("xss")</script>', expected: false },
        { input: 'admin\';--', expected: false },
        { input: 'valid.user@email.com', expected: true }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = validateInput(input);
        expect(result).toBe(expected);
      });
    });

    it('should sanitize file paths', () => {
      const maliciousPaths = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        'file:///etc/passwd',
        'file:///C:/Windows/System32/drivers/etc/hosts'
      ];

      maliciousPaths.forEach(path => {
        const sanitized = sanitizeFilePath(path);
        expect(sanitized).not.toContain('../');
        expect(sanitized).not.toContain('..\\');
        expect(sanitized).not.toMatch(/^file:\/\//);
      });
    });
  });
});

// Helper functions for security testing
function validateInput(input: string): boolean {
  // Basic input validation - reject empty input
  if (!input || input.length === 0) {
    return false;
  }

  // Check for SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|DECLARE|ALTER|CREATE|TRUNCATE)\b)/i,
    /('|--|\/\*|\*\/|;)/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      return false;
    }
  }

  // Check for XSS patterns
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/i,
    /javascript:/i,
    /on\w+\s*=/i
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      return false;
    }
  }

  return true;
}

function sanitizeFilePath(path: string): string {
  // Remove directory traversal patterns
  let sanitized = path.replace(/\.\.\/|\.\.\\/g, '');
  
  // Remove file:// protocol
  sanitized = sanitized.replace(/^file:\/\//, '');
  
  // Remove absolute paths on Windows
  sanitized = sanitized.replace(/^\/[A-Za-z]:\//, '');
  
  return sanitized;
}