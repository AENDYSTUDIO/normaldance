import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export class WebVitalsTracker {
  static init() {
    getCLS(this.sendToAnalytics);
    getFID(this.sendToAnalytics);
    getFCP(this.sendToAnalytics);
    getLCP(this.sendToAnalytics);
    getTTFB(this.sendToAnalytics);
  }

  private static sendToAnalytics(metric: any) {
    const body = JSON.stringify(metric);
    
    if ('sendBeacon' in navigator) {
      navigator.sendBeacon('/api/analytics/web-vitals', body);
    } else {
      fetch('/api/analytics/web-vitals', {
        body,
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}