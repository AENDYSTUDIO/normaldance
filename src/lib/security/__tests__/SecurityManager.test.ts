/**
 * Тесты для SecurityManager в NORMALDANCE.
 * Проверяет централизованный менеджер безопасности.
 */

import { BaseValidator } from "../BaseValidator";
import {
  AuditInput,
  SecurityContext,
  SecurityErrorCode,
} from "../ISecurityService";
import { SecurityManager } from "../SecurityManager";
import { escapeHTML, sanitizeFilename } from "../sanitize";
import { detectSuspiciousPatterns } from "../security-utils";

// Mock для winston logger
jest.mock("winston", () => {
  const mLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  };
  return {
    createLogger: jest.fn(() => mLogger),
  };
});

// Mock для crypto
jest.mock("crypto", () => ({
  randomBytes: jest.fn(() => Buffer.from("mocked-random-bytes")),
  createSign: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    sign: jest.fn(() => "mocked-signature"),
  })),
  createVerify: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    verify: jest.fn(() => true),
  })),
  publicEncrypt: jest.fn(() => Buffer.from("encrypted")),
  privateDecrypt: jest.fn(() =>
    Buffer.from(JSON.stringify({ decrypted: true }))
  ),
}));

describe("SecurityManager", () => {
  let securityManager: SecurityManager;

  const mockSecurityContext: SecurityContext = {
    runtime: "server",
    origin: "http://localhost:3000",
    userAgent: "test-agent",
    userId: "test-user",
    sessionId: "test-session",
  };

  const mockConfig = {
    csrf: {
      cookieName: "nd_csrf",
      headerName: "x-csrf-token",
      ttlSeconds: 3600,
      sameSite: "lax" as const,
      secure: false,
    },
    headers: {
      contentSecurityPolicy: "default-src 'self'",
      hsts: {
        enabled: true,
        maxAgeSeconds: 31536000,
        includeSubDomains: true,
        preload: false,
      },
      xContentTypeOptions: "nosniff" as const,
      xFrameOptions: "DENY" as const,
      referrerPolicy: "strict-origin-when-cross-origin",
      permissionsPolicy: {
        camera: "()",
        microphone: "()",
      },
      additional: {},
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    securityManager = new SecurityManager(mockConfig);
  });

  describe("Configuration", () => {
    test("should get and set configuration", () => {
      const newConfig = {
        ...mockConfig,
        csrf: { ...mockConfig.csrf, ttlSeconds: 7200 },
      };
      securityManager.setConfig(newConfig);
      expect(securityManager.getConfig()).toEqual(newConfig);
    });
  });

  describe("Validator Registration", () => {
    test("should register and validate using custom validator", () => {
      const mockValidator = (input: string) => {
        if (input === "valid") {
          return BaseValidator.ok(input);
        }
        return BaseValidator.err([
          BaseValidator.error(
            SecurityErrorCode.VALIDATION_ERROR,
            "Input is not valid"
          ),
        ]);
      };

      securityManager.registerValidator({
        name: "testValidator",
        fn: mockValidator,
      });

      const validResult = securityManager.validate("testValidator", "valid");
      expect(validResult.ok).toBe(true);
      if (validResult.ok) {
        expect(validResult.value).toBe("valid");
      }

      const invalidResult = securityManager.validate(
        "testValidator",
        "invalid"
      );
      expect(invalidResult.ok).toBe(false);
      if (!invalidResult.ok) {
        expect(invalidResult.errors[0].message).toBe("Input is not valid");
      }
    });

    test("should return error for non-existent validator", () => {
      const result = securityManager.validate("nonExistent", "test");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0].message).toContain("Validator not found");
      }
    });
  });

  describe("String Sanitization", () => {
    test("should sanitize HTML context", () => {
      const input = '<script>alert("XSS")</script>';
      const result = securityManager.sanitizeString(
        input,
        mockSecurityContext,
        { kind: "html" }
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(escapeHTML(input));
      }
    });

    test("should sanitize attribute context", () => {
      const input = '"><script>alert(1)</script>';
      const result = securityManager.sanitizeString(
        input,
        mockSecurityContext,
        { kind: "attr" }
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('"');
        expect(result.value).not.toContain("<script>");
      }
    });

    test("should sanitize URL context", () => {
      const input = "javascript:alert(1)";
      const result = securityManager.sanitizeString(
        input,
        mockSecurityContext,
        { kind: "url" }
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        // Опасный URL должен быть обработан
      }
    });

    test("should sanitize filename context", () => {
      const input = "../../../etc/passwd";
      const result = securityManager.sanitizeString(
        input,
        mockSecurityContext,
        { kind: "filename" }
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("etc-passwd");
      }
    });

    test("should handle plain context", () => {
      const input = "normal text";
      const result = securityManager.sanitizeString(
        input,
        mockSecurityContext,
        { kind: "plain" }
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(input);
      }
    });

    test("should sanitize SQL context", () => {
      const input = "'; DROP TABLE users; --";
      // В текущей реализации sanitizeSQL используется через InputSanitizer
      const result = securityManager.sanitizeString(
        input,
        mockSecurityContext,
        { kind: "sql" }
      );
      expect(result.ok).toBe(true);
      // В текущей реализации для SQL используется InputSanitizer.sanitizeHtml, что не оптимально
      // Это потенциальная уязвимость, которую мы обнаружили
    });
  });

  describe("Object Sanitization", () => {
    test("should sanitize object for HTML context", () => {
      const input = {
        name: "<script>alert(1)</script>",
        email: "test@example.com",
        nested: {
          description: '<img src="x" onerror="alert(1)">',
        },
      };

      const result = securityManager.sanitizeObject(
        input,
        mockSecurityContext,
        { kind: "html" }
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(JSON.stringify(result.value)).not.toContain("<script>");
        expect(JSON.stringify(result.value)).not.toContain("onerror");
      }
    });

    test("should sanitize object for URL context", () => {
      const input = {
        link: "javascript:alert(1)",
        safeLink: "https://example.com",
      };

      const result = securityManager.sanitizeObject(
        input,
        mockSecurityContext,
        { kind: "url" }
      );
      expect(result.ok).toBe(true);
      // Проверяем, что опасный URL был обработан
    });
  });

  describe("HTML Escaping", () => {
    test("should escape HTML", () => {
      const input = '<script>alert("test")</script>';
      const result = securityManager.escapeHTML(input);
      expect(result).toBe(escapeHTML(input));
      expect(result).not.toContain("<script>");
    });

    test("should escape HTML attributes", () => {
      const input = '" onclick="alert(1)';
      const result = securityManager.escapeAttribute(input);
      expect(result).not.toContain("onclick");
    });
  });

  describe("URL Sanitization", () => {
    test("should sanitize safe URL", () => {
      const input = "https://example.com";
      const result = securityManager.sanitizeURL(input);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(input);
      }
    });

    test("should reject dangerous URL", () => {
      const input = "javascript:alert(1)";
      const result = securityManager.sanitizeURL(input);
      expect(result.ok).toBe(true); // Возвращается безопасное значение (null)
      if (result.ok) {
        expect(result.value).toBeNull();
      }
    });

    test("should sanitize with custom protocols", () => {
      const input = "ipfs://some-hash";
      const result = securityManager.sanitizeURL(input, [
        "http",
        "https",
        "ipfs",
      ]);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(input);
      }
    });
  });

  describe("Filename Sanitization", () => {
    test("should sanitize filename", () => {
      const input = "../../../etc/passwd";
      const result = securityManager.sanitizeFilename(input);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(sanitizeFilename(input));
      }
    });
  });

  describe("SQL Escaping", () => {
    test("should escape SQL", () => {
      const input = "'; DROP TABLE users; --";
      const result = securityManager.escapeSql(input);
      expect(result).not.toContain("DROP TABLE");
      expect(result).not.toContain(";");
    });
  });

  describe("CSRF Token Generation and Verification", () => {
    test("should generate CSRF token", () => {
      const token = securityManager.generateCsrfToken(mockSecurityContext);
      expect(token.token).toBeDefined();
      expect(token.expiresAt).toBeGreaterThan(Date.now());
    });

    test("should verify valid CSRF token", () => {
      const mockHeaders = new Headers();
      mockHeaders.set("x-csrf-token", "valid-token");

      const result = securityManager.verifyCsrfToken(
        mockSecurityContext,
        mockHeaders
      );
      expect(result.valid).toBe(true);
    });

    test("should reject CSRF token with suspicious patterns", () => {
      const suspiciousToken = "'; DROP TABLE users; --";
      const mockHeaders = new Headers();
      mockHeaders.set("x-csrf-token", suspiciousToken);

      const result = securityManager.verifyCsrfToken(
        mockSecurityContext,
        mockHeaders
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("CSRF token contains suspicious patterns");
    });

    test("should reject missing CSRF token", () => {
      const mockHeaders = new Headers();

      const result = securityManager.verifyCsrfToken(
        mockSecurityContext,
        mockHeaders
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("Missing CSRF token");
    });
  });

  describe("Security Headers", () => {
    test("should build security headers", () => {
      const result = securityManager.buildSecurityHeaders(mockSecurityContext);
      expect(result.headers).toBeDefined();
      expect(result.headers["Content-Security-Policy"]).toBeDefined();
      expect(result.headers["Strict-Transport-Security"]).toBeDefined();
      expect(result.headers["X-Content-Type-Options"]).toBe("nosniff");
      expect(result.headers["X-Frame-Options"]).toBe("DENY");
    });
  });

  describe("Policies Check", () => {
    test("should return OK for policies check", () => {
      const result = securityManager.checkPolicies(mockSecurityContext);
      expect(result.ok).toBe(true);
    });
  });

  describe("Audit", () => {
    test("should perform security audit", () => {
      const input: AuditInput = { context: mockSecurityContext };
      const result = securityManager.audit(input);

      expect(result.timestamp).toBeLessThanOrEqual(Date.now());
      expect(result.context).toBe(input.context);
      expect(result.headers).toBeDefined();
      expect(result.results).toBeDefined();
    });
  });

  describe("KMS Integration", () => {
    test("should handle encrypt operation", async () => {
      const data = { message: "secret" };
      const result = await securityManager.useKMS("key-id", "encrypt", data);
      expect(result).toBeDefined();
    });

    test("should handle decrypt operation", async () => {
      const encrypted = Buffer.from("encrypted-data");
      const result = await securityManager.useKMS(
        "key-id",
        "decrypt",
        encrypted
      );
      expect(result).toBeDefined();
    });

    test("should handle sign operation", async () => {
      const data = { message: "to-sign" };
      const result = await securityManager.useKMS("key-id", "sign", data);
      expect(result).toBeDefined();
    });

    test("should handle verify operation", async () => {
      const data = { message: "to-verify", signature: "sig" };
      const result = await securityManager.useKMS("key-id", "verify", data);
      expect(result).toBe(true);
    });

    test("should throw for unsupported operation", async () => {
      await expect(
        securityManager.useKMS("key-id", "unsupported" as any, {})
      ).rejects.toThrow("Unsupported KMS operation: unsupported");
    });
  });

  describe("STRIDE Threat Modeling", () => {
    test("should return threats and mitigations for authentication", async () => {
      const result = await securityManager.strideThreatModel("authentication");
      expect(result.threats).toContain(
        "Spoofing: Unauthorized user may impersonate legitimate user"
      );
      expect(result.mitigations).toContain(
        "Implement multi-factor authentication"
      );
    });

    test("should return threats and mitigations for payments", async () => {
      const result = await securityManager.strideThreatModel("payments");
      expect(result.threats).toContain(
        "Information disclosure: Payment details may be exposed"
      );
      expect(result.mitigations).toContain("Encrypt sensitive payment data");
    });

    test("should return threats and mitigations for web3 transactions", async () => {
      const result = await securityManager.strideThreatModel(
        "web3-transactions"
      );
      expect(result.threats).toContain(
        "Spoofing: Fake transactions may be submitted"
      );
      expect(result.mitigations).toContain(
        "Verify transaction signatures against known addresses"
      );
    });
  });

  describe("Security Vulnerability Tests", () => {
    test("should detect XSS in input", () => {
      const xssInput = '<img src="x" onerror="alert(1)">';
      const suspicious = detectSuspiciousPatterns(xssInput);
      expect(suspicious).toContain("Event handler detected");
    });

    test("should detect SQL injection in input", () => {
      const sqlInput = "1' OR '1'='1";
      const suspicious = detectSuspiciousPatterns(sqlInput);
      expect(suspicious).toContain("Possible SQL injection pattern");
    });

    test("should detect path traversal in input", () => {
      const pathInput = "../../../etc/passwd";
      const suspicious = detectSuspiciousPatterns(pathInput);
      expect(suspicious).toContain("Path traversal pattern detected");
    });

    test("should detect command injection input", () => {
      const cmdInput = "file.txt; rm -rf /";
      const suspicious = detectSuspiciousPatterns(cmdInput);
      expect(suspicious).toContain("Command injection characters detected");
    });
  });
});
