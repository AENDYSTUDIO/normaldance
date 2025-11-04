#!/usr/bin/env node

import fs from 'fs';

async function analyzeLighthouse() {
  try {
    const data = JSON.parse(fs.readFileSync('lighthouse-audit.json', 'utf8'));
    const scores = {
      performance: data.categories.performance.score,
      accessibility: data.categories.accessibility.score,
      'best-practices': data.categories['best-practices'].score,
      seo: data.categories.seo.score
    };

    console.log('🎯 Lighthouse Audit Results for Normal Dance:');
    console.log('='.repeat(50));
    
    Object.entries(scores).forEach(([category, score]) => {
      const percentage = Math.round(score * 100);
      const emoji = percentage >= 90 ? '✅' : percentage >= 70 ? '⚠️' : '❌';
      const displayName = category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      console.log(`${emoji} ${displayName}: ${percentage}/100`);
    });

    // Overall status
    const averageScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
    const averagePercentage = Math.round(averageScore * 100);
    
    console.log('\n📊 Overall Score:', averagePercentage + '/100');
    
    if (averagePercentage >= 90) {
      console.log('🎉 Excellent! Ready for production deployment');
    } else if (averagePercentage >= 70) {
      console.log('👍 Good, but needs optimization before production');
    } else {
      console.log('🚨 Needs significant improvement before production');
    }

    // Key metrics
    const performanceMetrics = {
      'First Contentful Paint': data.audits['first-contentful-paint']?.numericValue,
      'Largest Contentful Paint': data.audits['largest-contentful-paint']?.numericValue,
      'Time to Interactive': data.audits['interactive']?.numericValue,
      'Cumulative Layout Shift': data.audits['cumulative-layout-shift']?.numericValue
    };

    console.log('\n⚡ Performance Metrics:');
    Object.entries(performanceMetrics).forEach(([metric, value]) => {
      if (value !== undefined) {
        const displayValue = metric.includes('Shift') ? value.toFixed(3) : Math.round(value);
        const unit = metric.includes('Shift') ? '' : 'ms';
        console.log(`   ${metric}: ${displayValue}${unit}`);
      }
    });

    // Recommendations
    console.log('\n💡 Quick Optimizations:');
    if (scores.performance < 0.9) {
      console.log('   - Optimize images (Webp/AVIF, lazy loading)');
      console.log('   - Reduce JavaScript bundle size');
      console.log('   - Implement code splitting');
    }
    if (scores.accessibility < 0.9) {
      console.log('   - Improve color contrast ratios');
      console.log('   - Add ARIA labels and descriptions');
      console.log('   - Enable keyboard navigation');
    }
    if (scores.seo < 0.9) {
      console.log('   - Add meta descriptions');
      console.log('   - Use semantic HTML tags');
      console.log('   - Add structured data (Schema.org)');
    }

  } catch (error) {
    console.error('❌ Error analyzing Lighthouse report:', error.message);
    process.exit(1);
  }
}

analyzeLighthouse();
