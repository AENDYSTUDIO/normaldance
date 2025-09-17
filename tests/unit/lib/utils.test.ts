import { describe, it, expect } from '@jest/globals';
import { formatNumber, formatTime, cn } from '@/lib/utils';

describe('Utils', () => {
  describe('formatNumber', () => {
    it('formats small numbers correctly', () => {
      expect(formatNumber(123)).toBe('123');
      expect(formatNumber(999)).toBe('999');
    });

    it('formats thousands correctly', () => {
      expect(formatNumber(1000)).toBe('1.0K');
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(12345)).toBe('12.3K');
    });

    it('formats millions correctly', () => {
      expect(formatNumber(1000000)).toBe('1.0M');
      expect(formatNumber(1500000)).toBe('1.5M');
      expect(formatNumber(12345678)).toBe('12.3M');
    });

    it('formats billions correctly', () => {
      expect(formatNumber(1000000000)).toBe('1000.0M');
      expect(formatNumber(1500000000)).toBe('1500.0M');
    });
  });

  describe('formatTime', () => {
    it('formats seconds correctly', () => {
      expect(formatTime(30)).toBe('0:30');
      expect(formatTime(59)).toBe('0:59');
    });

    it('formats minutes correctly', () => {
      expect(formatTime(60)).toBe('1:00');
      expect(formatTime(90)).toBe('1:30');
      expect(formatTime(180)).toBe('3:00');
    });

    it('formats hours correctly', () => {
      expect(formatTime(3600)).toBe('60:00');
      expect(formatTime(3661)).toBe('61:01');
      expect(formatTime(7200)).toBe('120:00');
    });

    it('handles zero correctly', () => {
      expect(formatTime(0)).toBe('0:00');
    });
  });

  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional')).toBe('base conditional');
      expect(cn('base', false && 'conditional')).toBe('base');
    });

    it('handles undefined and null', () => {
      expect(cn('base', undefined, null)).toBe('base');
    });
  });
});