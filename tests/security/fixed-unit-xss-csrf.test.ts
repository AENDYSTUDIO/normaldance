/**
 * Исправленные тесты для функций XSS/CSRF из src/lib/security/xss-csrf.ts
 * Исправлены противоречивые ожидания в тестах
 */

import {
  CsrfConfig,
  buildSetCookieHeader,
  escapeAttribute,
  escapeHTML,
  extractCsrfFromRequestLike,
  generateCsrfToken,
  issueCsrfForResponse,
  normalizeCsrfConfig,
  parseCookiesHeader,
  safeAttr,
  safeHtmlText,
  safeUrl,
  sanitizeForContext,
  sanitizeObjectForContext,
  sanitizeString,
  sanitizeURL,
  stripDangerousHtml,
  verifyCsrfDoubleSubmit,
  verifyCsrfToken,
} from "@/lib/security/xss-csrf";

describe("XSS/CSRF функции", () => {
  describe("escapeHTML", () => {
    it("должна экранировать основные HTML-сущности", () => {
      // Исправлено: функция должна экранировать все опасные символы
      expect(escapeHTML('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
      expect(escapeHTML("& < > \" ' /"))
        .toBe('&amp; &lt; &gt; &quot; &#x27; &#x2F;');
    });

    it("должна быть идемпотентной", () => {
      const input = '<script>alert("xss")</script>';
      const firstEscape = escapeHTML(input);
      const secondEscape = escapeHTML(firstEscape);
      expect(firstEscape).toBe(secondEscape);
    });

    it("должна не экранировать уже экранированные сущности", () => {
      // Исправлено: функция должна не экранировать уже экранированные сущности
      const escaped = escapeHTML("&lt;script&gt;");
      expect(escaped).toBe("&lt;script&gt;");
    });
  });

  describe("escapeAttribute", () => {
    it("должна экранировать HTML-атрибуты", () => {
      // Исправлено: функция должна экранировать все опасные символы
      expect(escapeAttribute('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
      expect(escapeAttribute("& < > \" ' /"))
        .toBe('&amp; &lt; &gt; &quot; &#x27; &#x2F;');
    });

    it("должна учитывать опцию allowSlashInAttr", () => {
      expect(escapeAttribute("/", { allowSlashInAttr: true })).toBe("/");
      expect(escapeAttribute("/")).toBe("&#x2F;");
    });

    it("должна быть идемпотентной", () => {
      const input = '<script>alert("xss")</script>';
      const firstEscape = escapeAttribute(input);
      const secondEscape = escapeAttribute(firstEscape);
      expect(firstEscape).toBe(secondEscape);
    });
  });

  describe("sanitizeURL", () => {
    it("должна разрешать безопасные URL", () => {
      expect(sanitizeURL("https://example.com")).toBe("https://example.com");
      expect(sanitizeURL("http://example.com")).toBe("http://example.com");
    });

    it("должна отклонять опасные URL", () => {
      expect(sanitizeURL("javascript:alert(1)")).toBe("");
      expect(sanitizeURL("data:text/html,<script>alert(1)</script>")).toBe("");
      expect(sanitizeURL("vbscript:alert(1)")).toBe("");
      expect(sanitizeURL("//malicious.com")).toBe("");
    });

    it("должна обрабатывать относительные URL", () => {
      expect(sanitizeURL("/path/to/resource")).toBe("/path/to/resource");
      expect(sanitizeURL("./path/to/resource")).toBe("./path/to/resource");
    });

    it("должна обрабатывать URL с параметрами", () => {
      expect(sanitizeURL("https://example.com?param=value&other=test")).toBe(
        "https://example.com?param=value&other=test"
      );
    });
  });

  describe("stripDangerousHtml", () => {
    it("должна удалять <script> теги", () => {
      expect(stripDangerousHtml('<script>alert("xss")</script>')).toBe("");
      expect(stripDangerousHtml('<script>alert("xss")</script><p>safe</p>'))
        .toBe("<p>safe</p>");
    });

    it("должна удалять event handler атрибуты", () => {
      expect(stripDangerousHtml('<div onclick="alert(1)">click me</div>'))
        .toBe('<div>click me</div>');
      expect(
        stripDangerousHtml('<img src="test.jpg" onload="alert(1)" alt="test" />')
      ).toBe('<img src="test.jpg" alt="test" />');
    });

    it("должна удалять javascript: URL в href/src", () => {
      expect(stripDangerousHtml('<a href="javascript:alert(1)">link</a>'))
        .toBe('<a href="">link</a>');
      expect(
        stripDangerousHtml('<img src="javascript:alert(1)" alt="test" />')
      ).toBe('<img src="" alt="test" />');
    });

    it("должна удалять data: и vbscript: URL", () => {
      expect(
        stripDangerousHtml('<a href="data:text/html,<script>alert(1)</script>">link</a>')
      ).toBe('<a href="">link</a>');
      expect(
        stripDangerousHtml('<img src="vbscript:alert(1)" alt="test" />')
      ).toBe('<img src="" alt="test" />');
    });

    it("должна сохранять безопасные теги и атрибуты", () => {
      expect(stripDangerousHtml('<p>Hello <strong>world</strong></p>'))
        .toBe('<p>Hello <strong>world</strong></p>');
      expect(
        stripDangerousHtml('<a href="https://example.com" target="_blank">link</a>')
      ).toBe('<a href="https://example.com" target="_blank">link</a>');
    });

    it("должна быть идемпотентной", () => {
      const input = '<div onclick="alert(1)">click me</div>';
      const firstStrip = stripDangerousHtml(input);
      const secondStrip = stripDangerousHtml(firstStrip);
      expect(firstStrip).toBe(secondStrip);
    });
  });

  describe("sanitizeString", () => {
    it("должна санитизировать для контекста html", () => {
      expect(sanitizeString('<script>alert("xss")</script>', "html")).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it("должна санитизировать для контекста attr", () => {
      expect(sanitizeString('<script>alert("xss")</script>', "attr")).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it("должна санитизировать для контекста url", () => {
      expect(sanitizeString("https://example.com", "url")).toBe("https://example.com");
      expect(sanitizeString("javascript:alert(1)", "url")).toBe("");
    });

    it("должна возвращать как есть для контекста raw", () => {
      const input = '<script>alert("xss")</script>';
      expect(sanitizeString(input, "raw")).toBe(input);
    });

    it("должна использовать html как контекст по умолчанию", () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });
  });

  describe("sanitizeForContext", () => {
    it("должна делегировать sanitizeString", () => {
      expect(sanitizeForContext('<script>alert("xss")</script>', "html")).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });
  });

  describe("sanitizeObjectForContext", () => {
    it("должна санитизировать строковые значения в объекте для контекста html", () => {
      const input = {
        name: '<script>alert("xss")</script>',
        age: 25,
        active: true,
      };
      const expected = {
        name: '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;",
        age: 25,
        active: true,
      };
      expect(sanitizeObjectForContext(input, "html")).toEqual(expected);
    });

    it("должна санитизировать строковые значения в массиве для контекста html", () => {
      const input = ['<script>alert("xss")</script>', 25, true];
      const expected = ['&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;', 25, true];
      expect(sanitizeObjectForContext(input, "html")).toEqual(expected);
    });

    it("должна санитизировать для разных контекстов", () => {
      const input = {
        html: '<script>alert("xss")</script>',
        url: "https://example.com",
        raw: '<script>alert("xss")</script>',
      };
      const expected = {
        html: '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;",
        url: "https://example.com",
        raw: '<script>alert("xss")</script>',
      };
      expect(sanitizeObjectForContext(input, "html")).toEqual(expected);
    });
  });

  describe("safeAttr", () => {
    it("должна создавать безопасное значение атрибута", () => {
      expect(safeAttr('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });
  });

  describe("safeHtmlText", () => {
    it("должна создавать безопасный HTML-текст", () => {
      expect(safeHtmlText('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });
  });

  describe("safeUrl", () => {
    it("должна создавать безопасный URL", () => {
      expect(safeUrl("https://example.com")).toBe("https://example.com");
      expect(safeUrl("javascript:alert(1)")).toBe("");
    });
  });

  describe("buildSetCookieHeader", () => {
    it("должна формировать корректный заголовок Set-Cookie", () => {
      const header = buildSetCookieHeader("token", "abc123", {
        path: "/",
        domain: "example.com",
        secure: true,
        httpOnly: true,
        sameSite: "Strict",
        maxAgeSeconds: 3600,
      });
      expect(header).toBe(
        "token=abc123; Path=/; Domain=example.com; Secure; HttpOnly; SameSite=Strict; Max-Age=3600"
      );
    });

    it("должна формировать минимальный заголовок", () => {
      const header = buildSetCookieHeader("token", "abc123");
      expect(header).toBe("token=abc123; Path=/");
    });
  });

  describe("parseCookiesHeader", () => {
    it("должна парсить заголовок Cookie", () => {
      const cookies = parseCookiesHeader("token=abc123; user=john; theme=dark");
      expect(cookies).toEqual({
        token: "abc123",
        user: "john",
        theme: "dark",
      });
    });

    it("должна обрабатывать пустой заголовок", () => {
      const cookies = parseCookiesHeader(null);
      expect(cookies).toEqual({});
    });
  });

  // Другие тесты...
});