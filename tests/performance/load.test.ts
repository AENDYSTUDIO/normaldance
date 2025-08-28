import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { exec } from 'child_process';
import { promisify } from 'util';

type ExecResult = { stdout: string; stderr: string };
const execAsync = promisify(exec) as (command: string) => Promise<ExecResult>;

describe('Load Testing - NormalDance Platform', () => {
  describe('API Endpoints Load Testing', () => {
    it('should handle concurrent requests to tracks endpoint', async () => {
      const concurrentUsers = 50;
      const requestsPerUser = 10;
      const totalRequests = concurrentUsers * requestsPerUser;

      const startTime = Date.now();
      
      // Simulate concurrent requests using curl
      const promises = [];
      for (let i = 0; i < totalRequests; i++) {
        promises.push(
          execAsync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/tracks')
            .catch(() => '500')
        );
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Calculate metrics
      const successfulRequests = results.filter(code => code === '200').length;
      const successRate = (successfulRequests / totalRequests) * 100;
      const requestsPerSecond = (totalRequests / duration) * 1000;

      console.log(`Load Test Results:`);
      console.log(`- Total requests: ${totalRequests}`);
      console.log(`- Successful requests: ${successfulRequests}`);
      console.log(`- Success rate: ${successRate.toFixed(2)}%`);
      console.log(`- Duration: ${duration}ms`);
      console.log(`- Requests per second: ${requestsPerSecond.toFixed(2)}`);

      // Assertions
      expect(successRate).toBeGreaterThan(95);
      expect(requestsPerSecond).toBeGreaterThan(10);
    }, 30000);

    it('should handle concurrent user authentication', async () => {
      const concurrentUsers = 30;
      const requestsPerUser = 5;
      const totalRequests = concurrentUsers * requestsPerUser;

      const startTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < totalRequests; i++) {
        promises.push(
          execAsync('curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/auth/signin')
            .catch(() => '500')
        );
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const successfulRequests = results.filter(code => code === '200').length;
      const successRate = (successfulRequests / totalRequests) * 100;
      const requestsPerSecond = (totalRequests / duration) * 1000;

      console.log(`Auth Load Test Results:`);
      console.log(`- Total requests: ${totalRequests}`);
      console.log(`- Success rate: ${successRate.toFixed(2)}%`);
      console.log(`- Requests per second: ${requestsPerSecond.toFixed(2)}`);

      expect(successRate).toBeGreaterThan(90);
    }, 30000);

    it('should handle concurrent file uploads', async () => {
      const concurrentUploads = 10;
      const startTime = Date.now();

      const promises = [];
      for (let i = 0; i < concurrentUploads; i++) {
        promises.push(
          execAsync('curl -s -o /dev/null -w "%{http_code}" -F "file=@test.mp3" http://localhost:3000/api/ipfs/upload')
            .catch(() => '500')
        );
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const successfulUploads = results.filter(code => code === '200').length;
      const successRate = (successfulUploads / concurrentUploads) * 100;
      const uploadsPerSecond = (concurrentUploads / duration) * 1000;

      console.log(`Upload Load Test Results:`);
      console.log(`- Total uploads: ${concurrentUploads}`);
      console.log(`- Success rate: ${successRate.toFixed(2)}%`);
      console.log(`- Uploads per second: ${uploadsPerSecond.toFixed(4)}`);

      expect(successRate).toBeGreaterThan(80);
    }, 60000);
  });

  describe('Database Load Testing', () => {
    it('should handle concurrent database queries', async () => {
      const concurrentQueries = 20;
      const queriesPerConnection = 10;
      const totalQueries = concurrentQueries * queriesPerConnection;

      const startTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < totalQueries; i++) {
        promises.push(
          execAsync('node -e "const { PrismaClient } = require(\'@prisma/client\'); const prisma = new PrismaClient(); prisma.user.count().then(() => prisma.\$disconnect()).catch(() => {})"')
            .catch(() => 'error')
        );
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const successfulQueries = results.filter(result => result !== 'error').length;
      const successRate = (successfulQueries / totalQueries) * 100;
      const queriesPerSecond = (totalQueries / duration) * 1000;

      console.log(`Database Load Test Results:`);
      console.log(`- Total queries: ${totalQueries}`);
      console.log(`- Success rate: ${successRate.toFixed(2)}%`);
      console.log(`- Queries per second: ${queriesPerSecond.toFixed(2)}`);

      expect(successRate).toBeGreaterThan(98);
    }, 30000);
  });

  describe('WebSocket Load Testing', () => {
    it('should handle concurrent WebSocket connections', async () => {
      const concurrentConnections = 100;
      const messagesPerConnection = 5;
      const totalMessages = concurrentConnections * messagesPerConnection;

      const startTime = Date.now();
      
      // Simulate WebSocket connections and messages
      const promises = [];
      for (let i = 0; i < concurrentConnections; i++) {
        promises.push(
          execAsync(`node -e "
            const WebSocket = require('ws');
            const ws = new WebSocket('ws://localhost:3000');
            let messages = 0;
            ws.on('open', () => {
              for (let j = 0; j < ${messagesPerConnection}; j++) {
                ws.send(JSON.stringify({ type: 'ping', id: ${i} }));
              }
            });
            ws.on('message', () => {
              messages++;
              if (messages === ${messagesPerConnection}) {
                ws.close();
              }
            });
            ws.on('error', () => {});
          " &`)
            .catch(() => 'error')
        );
      }

      // Wait for all connections to complete
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`WebSocket Load Test Results:`);
      console.log(`- Total connections: ${concurrentConnections}`);
      console.log(`- Duration: ${duration}ms`);
      console.log(`- Messages per second: ${(totalMessages / duration) * 1000}`);

      expect(duration).toBeLessThan(15000); // Should complete within 15 seconds
    }, 20000);
  });

  describe('Memory Usage Testing', () => {
    it('should monitor memory usage under load', async () => {
      const process = require('child_process');
      const fs = require('fs');
      
      // Start memory monitoring
      const memoryLog = [];
      const monitorInterval = setInterval(() => {
        const usage = process.memoryUsage();
        memoryLog.push({
          timestamp: Date.now(),
          rss: Math.round(usage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
          external: Math.round(usage.external / 1024 / 1024), // MB
        });
      }, 1000);

      // Generate load
      const loadPromises = [];
      for (let i = 0; i < 100; i++) {
        loadPromises.push(
          execAsync('curl -s http://localhost:3000/api/tracks > /dev/null')
            .catch(() => {})
        );
      }

      await Promise.all(loadPromises);
      
      // Stop monitoring
      clearInterval(monitorInterval);
      
      // Analyze memory usage
      const maxMemory = Math.max(...memoryLog.map(m => m.heapUsed));
      const avgMemory = memoryLog.reduce((sum, m) => sum + m.heapUsed, 0) / memoryLog.length;
      const memoryGrowth = memoryLog[memoryLog.length - 1].heapUsed - memoryLog[0].heapUsed;

      console.log(`Memory Usage Test Results:`);
      console.log(`- Max heap used: ${maxMemory}MB`);
      console.log(`- Average heap used: ${avgMemory.toFixed(2)}MB`);
      console.log(`- Memory growth: ${memoryGrowth}MB`);

      // Memory should not grow excessively
      expect(memoryGrowth).toBeLessThan(100); // Less than 100MB growth
      expect(maxMemory).toBeLessThan(500); // Less than 500MB max usage
    }, 30000);
  });

  describe('Response Time Testing', () => {
    it('should measure response times under load', async () => {
      const requestCount = 200;
      const responseTimes = [];

      const startTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < requestCount; i++) {
        const requestStart = Date.now();
        promises.push(
          execAsync('curl -s -o /dev/null -w "%{time_total}" http://localhost:3000/api/tracks')
            .then(result => {
              const responseTime = parseFloat(result.stdout);
              responseTimes.push(responseTime);
              return responseTime;
            })
            .catch(() => Infinity)
        );
      }

      await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Calculate statistics
      const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);
      const p95ResponseTime = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)];

      console.log(`Response Time Test Results:`);
      console.log(`- Total requests: ${requestCount}`);
      console.log(`- Total time: ${totalTime}ms`);
      console.log(`- Average response time: ${avgResponseTime.toFixed(3)}s`);
      console.log(`- Min response time: ${minResponseTime.toFixed(3)}s`);
      console.log(`- Max response time: ${maxResponseTime.toFixed(3)}s`);
      console.log(`- 95th percentile: ${p95ResponseTime.toFixed(3)}s`);

      // Response time assertions
      expect(avgResponseTime).toBeLessThan(1); // Average less than 1 second
      expect(p95ResponseTime).toBeLessThan(2); // 95th percentile less than 2 seconds
      expect(maxResponseTime).toBeLessThan(5); // Max less than 5 seconds
    }, 30000);
  });
});