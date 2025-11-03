import { register, Counter, Histogram, Gauge } from 'prom-client';

export class MetricsCollector {
  private static httpRequests = new Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status'],
  });

  private static httpDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration',
    labelNames: ['method', 'route'],
  });

  private static activeUsers = new Gauge({
    name: 'active_users_total',
    help: 'Currently active users',
  });

  private static audioStreams = new Counter({
    name: 'audio_streams_total',
    help: 'Total audio streams',
    labelNames: ['quality', 'format'],
  });

  static recordRequest(method: string, route: string, status: number, duration: number) {
    this.httpRequests.inc({ method, route, status: status.toString() });
    this.httpDuration.observe({ method, route }, duration);
  }

  static setActiveUsers(count: number) {
    this.activeUsers.set(count);
  }

  static recordAudioStream(quality: string, format: string) {
    this.audioStreams.inc({ quality, format });
  }

  static getMetrics() {
    return register.metrics();
  }
}