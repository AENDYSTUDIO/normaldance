import { InputSanitizer } from '@/lib/security/input-sanitizer';

describe('InputSanitizer', () => {
  describe('sanitizeHtml', () => {
    it('removes script tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = InputSanitizer.sanitizeHtml(input);
      expect(result).toBe('Hello');
    });

    it('removes all HTML tags', () => {
      const input = '<div><p>Hello</p></div>';
      const result = InputSanitizer.sanitizeHtml(input);
      expect(result).toBe('Hello');
    });
  });

  describe('sanitizeLog', () => {
    it('removes newlines and limits length', () => {
      const input = 'Line1\nLine2\rLine3\t' + 'x'.repeat(2000);
      const result = InputSanitizer.sanitizeLog(input);
      expect(result).not.toContain('\n');
      expect(result.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('validatePath', () => {
    it('allows safe paths', () => {
      expect(() => InputSanitizer.validatePath('safe/path.txt')).not.toThrow();
    });

    it('blocks path traversal', () => {
      expect(() => InputSanitizer.validatePath('../../../etc/passwd')).toThrow();
    });
  });
});