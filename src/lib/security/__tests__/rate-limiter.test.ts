/**
 * Тесты для RateLimiter в NORMALDANCE.
 * Проверяет ограничение частоты запросов для предотвращения DDoS-атак.
 */

// Мок для NextRequest
class MockNextRequest {
  private headersMap: Map<string, string>;
  ip?: string;

  constructor(options: { headers?: Record<string, string>; ip?: string } = {}) {
    this.headersMap = new Map(Object.entries(options.headers || {}));
    this.ip = options.ip || "192.168.1.1";
  }

  headers = {
    get: (name: string) => this.headersMap.get(name) || null,
  };

  getIp() {
    return this.ip;
  }

  getHeaders() {
    return Object.fromEntries(this.headersMap);
  }
}

describe("RateLimiter", () => {
  let apiRateLimiter: any;
  let authRateLimiter: any;
  let uploadRateLimiter: any;
  let withRateLimit: any;

  // Загружаем модуль с моками
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 0, 1)); // Устанавливаем фиксированное время для тестов

    // Импортируем после настройки моков
    const rateLimiterModule = require("../rate-limiter");
    apiRateLimiter = rateLimiterModule.apiRateLimiter;
    authRateLimiter = rateLimiterModule.authRateLimiter;
    uploadRateLimiter = rateLimiterModule.uploadRateLimiter;
    withRateLimit = rateLimiterModule.withRateLimit;
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Сбрасываем состояние лимитеров перед каждым тестом
    apiRateLimiter.store.clear();
    authRateLimiter.store.clear();
    uploadRateLimiter.store.clear();
  });

  describe("API Rate Limiter", () => {
    test("should allow requests within limit", () => {
      const request = new MockNextRequest({
        headers: { "x-forwarded-for": "192.168.1.1" },
      });

      // Делаем 50 запросов из 10 возможных
      for (let i = 0; i < 50; i++) {
        const result = apiRateLimiter.check(request as any);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(100 - i - 1);
      }
    });

    test("should block requests exceeding limit", () => {
      const request = new MockNextRequest({
        headers: { "x-forwarded-for": "192.168.1.1" },
      });

      // Превышаем лимит
      for (let i = 0; i < 101; i++) {
        const result = apiRateLimiter.check(request as any);
        if (i < 100) {
          expect(result.allowed).toBe(true);
        } else {
          expect(result.allowed).toBe(false);
          expect(result.remaining).toBe(0);
        }
      }
    });

    test("should reset after window expires", () => {
      const request = new MockNextRequest({
        headers: { "x-forwarded-for": "192.168.1.1" },
      });

      // Превышаем лимит
      for (let i = 0; i < 101; i++) {
        apiRateLimiter.check(request as any);
      }

      // Пропускаем время больше окна (15 минут = 900000 мс)
      jest.advanceTimersByTime(900001);

      // Очищаем просроченные записи
      apiRateLimiter.cleanup();

      // Проверяем, что снова можно делать запросы
      const result = apiRateLimiter.check(request as any);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99);
    });

    test("should use IP from x-forwarded-for header", () => {
      const request = new MockNextRequest({
        headers: { "x-forwarded-for": "10.0.0.1, 10.0.0.2" },
      });

      const result = apiRateLimiter.check(request as any);
      expect(result.allowed).toBe(true);
    });

    test("should use request IP when x-forwarded-for is not present", () => {
      const request = new MockNextRequest({
        ip: "203.0.113.1",
        headers: {},
      });

      const result = apiRateLimiter.check(request as any);
      expect(result.allowed).toBe(true);
    });
  });

  describe("Auth Rate Limiter", () => {
    test("should allow limited authentication attempts", () => {
      const request = new MockNextRequest({
        headers: { "x-forwarded-for": "192.168.1.2" },
      });

      // Делаем 5 попыток аутентификации (предел)
      for (let i = 0; i < 5; i++) {
        const result = authRateLimiter.check(request as any);
        expect(result.allowed).toBe(i < 5);
        if (result.allowed) {
          expect(result.remaining).toBe(5 - i - 1);
        }
      }

      // 6-я попытка должна быть заблокирована
      const result = authRateLimiter.check(request as any);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe("Upload Rate Limiter", () => {
    test("should limit uploads per hour", () => {
      const request = new MockNextRequest({
        headers: { "x-forwarded-for": "192.168.1.3" },
      });

      // Делаем 10 загрузок (предел в час)
      for (let i = 0; i < 10; i++) {
        const result = uploadRateLimiter.check(request as any);
        expect(result.allowed).toBe(i < 10);
        if (result.allowed) {
          expect(result.remaining).toBe(10 - i - 1);
        }
      }

      // 11-я загрузка должна быть заблокирована
      const result = uploadRateLimiter.check(request as any);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe("withRateLimit middleware", () => {
    test("should allow request when within rate limit", async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response("OK"));
      const rateLimitedHandler = withRateLimit(apiRateLimiter)(mockHandler);

      const request = new MockNextRequest({
        headers: { "x-forwarded-for": "192.168.1.4" },
      });

      const response: any = await rateLimitedHandler(request as any);

      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    test("should return 429 when rate limit exceeded", async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response("OK"));
      const rateLimitedHandler = withRateLimit(authRateLimiter)(mockHandler);

      const request = new MockNextRequest({
        headers: { "x-forwarded-for": "192.168.1.5" },
      });

      // Превышаем лимит аутентификации (5 попыток)
      for (let i = 0; i < 6; i++) {
        const response: any = await rateLimitedHandler(request as any);
        if (i < 5) {
          expect(response.status).toBe(200);
        } else {
          expect(response.status).toBe(429);
          expect(response.headers.get("Content-Type")).toBe("application/json");
        }
      }
    });

    test("should add rate limit headers to successful responses", async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response("OK"));
      const rateLimitedHandler = withRateLimit(apiRateLimiter)(mockHandler);

      const request = new MockNextRequest({
        headers: { "x-forwarded-for": "192.168.1.6" },
      });

      const response: any = await rateLimitedHandler(request as any);

      // Проверяем, что добавлены заголовки ограничения скорости
      expect(response.headers.get("X-RateLimit-Limit")).toBe("100");
      expect(response.headers.get("X-RateLimit-Remaining")).toBeDefined();
      expect(response.headers.get("X-RateLimit-Reset")).toBeDefined();
    });
  });

  describe("DDoS Protection Tests", () => {
    test("should handle multiple IPs separately", () => {
      const ips = ["192.168.1.10", "192.168.1.1", "192.168.1.12"];

      // Каждый IP может сделать 100 запросов
      ips.forEach((ip) => {
        const request = new MockNextRequest({
          headers: { "x-forwarded-for": ip },
        });

        for (let i = 0; i < 50; i++) {
          const result = apiRateLimiter.check(request as any);
          expect(result.allowed).toBe(true);
        }
      });
    });

    test("should prevent simple DDoS with many requests", () => {
      const request = new MockNextRequest({
        headers: { "x-forwarded-for": "192.168.1.20" },
      });

      // Делаем 200 запросов от одного IP
      let blockedCount = 0;
      for (let i = 0; i < 200; i++) {
        const result = apiRateLimiter.check(request as any);
        if (!result.allowed) {
          blockedCount++;
        }
      }

      // Должно быть заблокировано 100 запросов (200 - 100 лимит)
      expect(blockedCount).toBe(10);
    });

    test("should handle rapid requests", () => {
      const request = new MockNextRequest({
        headers: { "x-forwarded-for": "192.168.1.30" },
      });

      // Выполняем 150 запросов подряд
      const results: any[] = [];
      for (let i = 0; i < 150; i++) {
        results.push(apiRateLimiter.check(request as any));
      }

      // Подсчитываем разрешенные и заблокированные запросы
      const allowedCount = results.filter((r) => r.allowed).length;
      const blockedCount = results.filter((r) => !r.allowed).length;

      expect(allowedCount).toBe(100); // 100 разрешенных
      expect(blockedCount).toBe(50); // 50 заблокированных
    });
  });

  describe("Rate Limiter Configuration", () => {
    test("should have correct API rate limits", () => {
      expect(apiRateLimiter.config.windowMs).toBe(15 * 60 * 1000); // 15 минут
      expect(apiRateLimiter.config.maxRequests).toBe(100);
    });

    test("should have correct auth rate limits", () => {
      expect(authRateLimiter.config.windowMs).toBe(15 * 60 * 1000); // 15 минут
      expect(authRateLimiter.config.maxRequests).toBe(5);
    });

    test("should have correct upload rate limits", () => {
      expect(uploadRateLimiter.config.windowMs).toBe(60 * 60 * 1000); // 1 час
      expect(uploadRateLimiter.config.maxRequests).toBe(10);
    });
  });
});
