
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { request } from 'http';
import { URL } from 'url';

describe('Security Testing - NormalDance Platform', () => {
  describe('OWASP Top 10 Security Tests', () => {
    it('should prevent SQL injection attacks', async () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'--",
        "1' UNION SELECT * FROM users--",
        "1'; WAITFOR DELAY '0:0:5'--"
      ];

      for (const maliciousInput of maliciousInputs) {
        const postData = JSON.stringify({
          username: maliciousInput,
          password: 'test'
        });

        const options = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/auth/signin',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const req = request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            // Should return 400 or 403, not 200
            expect([400, 403, 500]).toContain(res.statusCode);
          });
        });

        req.on('error', (e) => {
          console.error(`Problem with request: ${e.message}`);
        });

        req.write(postData);
        req.end();
      }
       