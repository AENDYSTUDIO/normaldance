/**
 * Unit tests for input sanitization and validation utilities
 * Tests XSS prevention, address validation, and suspicious pattern detection
 */

import {
  sanitizeHTML,
  stripHTML,
  sanitizeURL,
  sanitizeFilename,
  isValidSolanaAddress,
  isValidTONAddress,
  isValidEthereumAddress,
  isValidIPFSCID,
  sanitizeSQL,
  isRateLimited,
  detectSuspiciousPatterns,
  validateNumber,
} from "@/lib/security";

describe("Input Sanitizer", () => {
  describe("sanitizeHTML", () => {
    test("should escape HTML special characters", () => {
      const input = '<script>alert("xss")</script>';
      const expected =
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;";

      expect(sanitizeHTML(input)).toBe(expected);
    });

    test("should escape all dangerous characters", () => {
      expect(sanitizeHTML("<")).toBe("&lt;");
      expect(sanitizeHTML(">")).toBe("&gt;");
      expect(sanitizeHTML("&")).toBe("&amp;");
      expect(sanitizeHTML('"')).toBe("&quot;");
      expect(sanitizeHTML("'")).toBe("&#x27;");
      expect(sanitizeHTML("/")).toBe("&#x2F;");
    });

    test("should handle empty string", () => {
      expect(sanitizeHTML("")).toBe("");
    });

    test("should handle non-string input", () => {
      expect(sanitizeHTML(null as any)).toBe("");
      expect(sanitizeHTML(undefined as any)).toBe("");
      expect(sanitizeHTML(123 as any)).toBe("");
    });

    test("should preserve safe text", () => {
      const safeText = "Hello, world! This is safe text.";
      expect(sanitizeHTML(safeText)).toBe(safeText);
    });

    test("should handle mixed content", () => {
      const input = 'Hello <b>world</b> & "friends"';
      const expected =
        "Hello &lt;b&gt;world&lt;&#x2F;b&gt; &amp; &quot;friends&quot;";

      expect(sanitizeHTML(input)).toBe(expected);
    });
  });

  describe("stripHTML", () => {
    test("should remove script tags", () => {
      const input = '<script>alert("xss")</script>Hello World';
      const expected = "Hello World";

      expect(stripHTML(input)).toBe(expected);
    });

    test("should remove event handlers", () => {
      const input = '<div onclick="alert(1)">Click</div>';
      const expected = "<div>Click</div>";

      expect(stripHTML(input)).toBe(expected);
    });

    test("should remove javascript: protocol", () => {
      const input = '<a href="javascript:alert(1)">Link</a>';
      const expected = '<a href="">Link</a>';

      expect(stripHTML(input)).toBe(expected);
    });

    test("should handle nested tags", () => {
      const input = '<div><script>alert("xss")</script><p>Text</p></div>';
      const expected = "<div><p>Text</p></div>";

      expect(stripHTML(input)).toBe(expected);
    });

    test("should remove all HTML tags", () => {
      const input = "<p>Hello <b>world</b></p>";
      expect(stripHTML(input)).toBe("Hello world");
    });

    test("should decode HTML entities", () => {
      const input = "&lt;p&gt;Hello&lt;&#x2F;p&gt;";
      expect(stripHTML(input)).toBe("Hello");
    });

    test("should handle self-closing tags", () => {
      const input = 'Hello<br/>World<img src="test"/>';
      expect(stripHTML(input)).toContain("HelloWorld");
    });
  });

  describe("sanitizeURL", () => {
    test("should allow valid HTTP URLs", () => {
      const input = "http://example.com";
      expect(sanitizeURL(input)).toBe(input);
    });

    test("should allow valid HTTPS URLs", () => {
      const input = "https://example.com";
      expect(sanitizeURL(input)).toBe(input);
    });

    test("should allow IPFS URLs", () => {
      const input = "ipfs://QmTest123";
      expect(sanitizeURL(input)).toBe(input);
    });

    test("should block javascript: URLs", () => {
      const input = "javascript:alert(1)";
      expect(sanitizeURL(input)).toBe("");
    });

    test("should block data: URLs", () => {
      const input = "data:text/html,<script>alert(1)</script>";
      expect(sanitizeURL(input)).toBe("");
    });

    test("should block vbscript: protocol", () => {
      const input = "vbscript:msgbox(1)";
      expect(sanitizeURL(input)).toBe("");
    });

    test("should reject invalid URLs", () => {
      expect(sanitizeURL("not a url")).toBe("");
      expect(sanitizeURL("")).toBe("");
    });

    test("should respect allowedProtocols parameter", () => {
      const ftpUrl = "ftp://example.com";
      expect(sanitizeURL(ftpUrl, ["ftp", "http"])).toBe(ftpUrl);
      expect(sanitizeURL(ftpUrl, ["http"])).toBe("");
    });
  });

  describe("sanitizeFilename", () => {
    test("should replace dangerous characters", () => {
      expect(sanitizeFilename("file<script>.txt")).not.toContain("<");
      expect(sanitizeFilename("file<script>.txt")).not.toContain(">");
    });

    test("should remove directory traversal", () => {
      expect(sanitizeFilename("../../../etc/passwd")).not.toContain("..");
    });

    test("should limit length", () => {
      const longName = "a".repeat(300);
      const result = sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(255);
    });

    test("should remove leading special characters", () => {
      expect(sanitizeFilename("...test.txt")).not.toMatch(/^\./);
    });

    test("should remove path traversal sequences", () => {
      const input = "../../../etc/passwd";
      expect(sanitizeFilename(input)).not.toContain("..");
    });

    test("should replace slashes with dashes", () => {
      const input = "folder/subfolder/file.txt";
      const result = sanitizeFilename(input);
      expect(result).not.toContain("/");
    });

    test("should remove special characters", () => {
      const input = "file@#$%^&*().txt";
      const result = sanitizeFilename(input);
      expect(result).not.toMatch(/[@#$%^&*()]/);
    });

    test("should remove leading dots", () => {
      const input = ".hidden_file.txt";
      const result = sanitizeFilename(input);
      expect(result.charAt(0)).not.toBe(".");
    });

    test("should limit length to 255 characters", () => {
      const longName = "a".repeat(300);
      const result = sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(255);
    });

    test("should handle Windows path separators", () => {
      const input = "folder\\subfolder\\file.txt";
      const result = sanitizeFilename(input);
      expect(result).not.toContain("\\");
    });
  });

  describe("isValidSolanaAddress", () => {
    test("should validate correct Solana address", () => {
      const address = process.env.SECRET_KEY;
      expect(isValidSolanaAddress(address)).toBe(true);
    });

    test("should reject invalid Solana address", () => {
      const address = "invalid_address";
      expect(isValidSolanaAddress(address)).toBe(false);
    });

    test("should accept valid Solana addresses", () => {
      const validAddress = process.env.SECRET_KEY;
      expect(isValidSolanaAddress(validAddress)).toBe(true);
    });

    test("should reject addresses with invalid characters", () => {
      const invalidChars = process.env.SECRET_KEY;
      expect(isValidSolanaAddress(invalidChars)).toBe(false);
    });

    test("should reject addresses with wrong length", () => {
      expect(isValidSolanaAddress("short")).toBe(false);
      expect(isValidSolanaAddress("a".repeat(100))).toBe(false);
    });

    test("should handle non-string input", () => {
      expect(isValidSolanaAddress(null as any)).toBe(false);
      expect(isValidSolanaAddress(undefined as any)).toBe(false);
      expect(isValidSolanaAddress(123 as any)).toBe(false);
    });
  });

  describe("isValidTONAddress", () => {
    test("should validate correct TON address (bounceable)", () => {
      const validAddress = process.env.SECRET_KEY;
      expect(isValidTONAddress(validAddress)).toBe(true);
    });

    test("should validate correct TON address (non-bounceable)", () => {
      const validAddress = process.env.SECRET_KEY;
      expect(isValidTONAddress(validAddress)).toBe(true);
    });

    test("should reject invalid TON addresses", () => {
      expect(isValidTONAddress("invalid")).toBe(false);
      expect(
        isValidTONAddress(process.env.SECRET_KEY),
      ).toBe(false);
    });

    test("should reject addresses with wrong prefix", () => {
      const wrongPrefix = process.env.SECRET_KEY;
      expect(isValidTONAddress(wrongPrefix)).toBe(false);
    });

    test("should reject addresses with wrong length", () => {
      expect(isValidTONAddress(process.env.SECRET_KEY)).toBe(
        false,
      );
    });
  });

  describe("isValidEthereumAddress", () => {
    test("should validate correct Ethereum address", () => {
      const validAddress = process.env.SECRET_KEY;
      expect(isValidEthereumAddress(validAddress)).toBe(true);
    });

    test("should accept addresses with lowercase", () => {
      const lowercaseAddress = process.env.SECRET_KEY;
      expect(isValidEthereumAddress(lowercaseAddress)).toBe(true);
    });

    test("should accept addresses with uppercase", () => {
      const uppercaseAddress = process.env.SECRET_KEY;
      expect(isValidEthereumAddress(uppercaseAddress)).toBe(true);
    });

    test("should reject invalid Ethereum addresses", () => {
      expect(isValidEthereumAddress("0xinvalid")).toBe(false);
      expect(
        isValidEthereumAddress(process.env.SECRET_KEY),
      ).toBe(false);
    });

    test("should reject addresses with invalid characters", () => {
      const invalidChars = process.env.SECRET_KEY;
      expect(isValidEthereumAddress(invalidChars)).toBe(false);
    });
  });

  describe("isValidIPFSCID", () => {
    test("should accept valid CIDv0", () => {
      const validCID = process.env.SECRET_KEY;
      expect(isValidIPFSCID(validCID)).toBe(true);
    });

    test("should accept valid CIDv1", () => {
      const validCID =
        process.env.SECRET_KEY;
      expect(isValidIPFSCID(validCID)).toBe(true);
    });

    test("should reject invalid CIDs", () => {
      expect(isValidIPFSCID("invalid")).toBe(false);
      expect(isValidIPFSCID("QmTest")).toBe(false);
    });

    test("should reject CIDs with invalid characters", () => {
      const invalidCID = "QmTest<script>123456789012345678901234567";
      expect(isValidIPFSCID(invalidCID)).toBe(false);
    });
  });

  describe("sanitizeSQL", () => {
    test("should properly escape single quotes", () => {
      const input = "O'Reilly";
      const expected = "O''Reilly";

      expect(sanitizeSQL(input)).toBe(expected);
    });

    test("should remove SQL comments completely", () => {
      const input = "SELECT * FROM users -- comment";
      const expected = "SELECT * FROM users";

      expect(sanitizeSQL(input)).toBe(expected);
    });

    test("should remove dangerous SQL keywords", () => {
      const input = "SELECT * FROM users DROP TABLE users";
      const expected = "SELECT * FROM users";

      expect(sanitizeSQL(input)).not.toContain("DROP TABLE");
    });

    test("should handle SQL injection attempts", () => {
      const input = "'; DROP TABLE users; --";
      const result = sanitizeSQL(input);
      expect(result).not.toContain("DROP");
    });

    test("should handle edge cases", () => {
      expect(sanitizeSQL("")).toBe("");
      expect(sanitizeSQL("'")).toBeDefined();
    });
  });

  describe("validateNumber", () => {
    test("should accept valid numbers", () => {
      expect(validateNumber(5)).toBe(5);
      expect(validateNumber(10.5)).toBe(10.5);
      expect(validateNumber(0)).toBe(0);
    });

    test("should accept numbers as strings", () => {
      expect(validateNumber("5" as any)).toBe(5);
      expect(validateNumber("-10.5" as any)).toBe(-10.5);
    });

    test("should reject invalid numbers", () => {
      expect(validateNumber("abc" as any)).toBeNull();
      expect(validateNumber("12.34.56" as any)).toBeNull();
    });

    test("should enforce minimum value", () => {
      expect(validateNumber(5, 10)).toBeNull(); // 5 < 10
      expect(validateNumber(10, 10)).toBe(10); // 10 >= 10
      expect(validateNumber(15, 10)).toBe(15); // 15 >= 10
    });

    test("should enforce maximum value", () => {
      expect(validateNumber(5, undefined, 10)).toBe(5);
      expect(validateNumber(10, undefined, 10)).toBe(10);
      expect(validateNumber(15, undefined, 10)).toBeNull();
    });

    test("should enforce both min and max", () => {
      expect(validateNumber(5, 10, 20)).toBeNull(); // 5 < 10
      expect(validateNumber(15, 10, 20)).toBe(15); // 10 <= 15 <= 20
      expect(validateNumber(25, 10, 20)).toBeNull(); // 25 > 20
    });
  });

  describe("isRateLimited", () => {
    // Clear the rate limit store before each test
    beforeEach(() => {
      (global as any).rateLimitStore = {};
    });

    test("should allow first request", () => {
      const key = "test-key";
      const result = isRateLimited(key, 5, 1000);
      expect(result).toBe(false);
    });

    test("should allow requests within limit", () => {
      const key = "test-key-2";
      const maxActions = 5;
      const windowMs = 1000;

      for (let i = 0; i < maxActions; i++) {
        expect(isRateLimited(key, maxActions, windowMs)).toBe(false);
      }
    });

    test("should block requests exceeding limit", () => {
      const key = "test-key-3";
      const maxActions = 2;
      const windowMs = 1000;

      // Allow first two requests
      expect(isRateLimited(key, maxActions, windowMs)).toBe(false);
      expect(isRateLimited(key, maxActions, windowMs)).toBe(false);

      // Third request should be blocked
      expect(isRateLimited(key, maxActions, windowMs)).toBe(true);
    });

    test("should reset after time window", (done) => {
      const key = "test-key-4";
      const maxActions = 2;
      const windowMs = 100;

      // Make requests up to the limit
      expect(isRateLimited(key, maxActions, windowMs)).toBe(false);
      expect(isRateLimited(key, maxActions, windowMs)).toBe(false);

      // Third request should be blocked
      expect(isRateLimited(key, maxActions, windowMs)).toBe(true);

      // Wait for window to pass and test again
      setTimeout(() => {
        expect(isRateLimited(key, maxActions, windowMs)).toBe(false);
        done();
      }, windowMs + 50);
    });
  });

  describe("detectSuspiciousPatterns", () => {
    test("should detect script tags", () => {
      const input = '<script>alert("xss")</script>';
      const warnings = detectSuspiciousPatterns(input);
      expect(warnings.length).toBeGreaterThan(0);
    });

    test("should detect event handlers", () => {
      const input = '<div onclick="alert(1)">Click</div>';
      const warnings = detectSuspiciousPatterns(input);
      expect(warnings.length).toBeGreaterThan(0);
    });

    test("should detect javascript: protocol", () => {
      const input = '<a href="javascript:alert(1)">Link</a>';
      const warnings = detectSuspiciousPatterns(input);
      expect(warnings.length).toBeGreaterThan(0);
    });

    test("should detect SQL injection patterns", () => {
      const input = "'; DROP TABLE users; --";
      const warnings = detectSuspiciousPatterns(input);
      expect(warnings.length).toBeGreaterThan(0);
    });

    test("should detect path traversal", () => {
      const input = "../../../etc/passwd";
      const warnings = detectSuspiciousPatterns(input);
      expect(warnings.length).toBeGreaterThan(0);
    });

    test("should detect command injection characters", () => {
      const input = "command; rm -rf /";
      const warnings = detectSuspiciousPatterns(input);
      expect(warnings.length).toBeGreaterThan(0);
    });

    test("should return empty array for safe input", () => {
      const safeInput = "This is a normal safe string";
      const warnings = detectSuspiciousPatterns(safeInput);
      expect(warnings).toEqual([]);
    });

    test("should detect multiple patterns", () => {
      const input = '<script>alert("xss")</script> and ../../../etc/passwd';
      const warnings = detectSuspiciousPatterns(input);
      expect(warnings.length).toBeGreaterThanOrEqual(2);
    });
  });
});
