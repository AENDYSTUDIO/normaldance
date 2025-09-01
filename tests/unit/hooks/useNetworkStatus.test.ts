import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import useNetworkStatus from '@/hooks/useNetworkStatus';

// Mock navigator.connection
const mockConnection = {
  effectiveType: '4g',
  downlink: 10,
  rtt: 50,
  saveData: false,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

describe('useNetworkStatus', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: mockConnection
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns initial network status', () => {
    const { result } = renderHook(() => useNetworkStatus());
    
    expect(result.current.effectiveType).toBe('4g');
    expect(result.current.downlink).toBe(10);
    expect(result.current.rtt).toBe(50);
    expect(result.current.saveData).toBe(false);
  });

  it('handles missing navigator.connection', () => {
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: undefined
    });
    
    const { result } = renderHook(() => useNetworkStatus());
    
    expect(result.current.effectiveType).toBe('4g');
    expect(result.current.downlink).toBe(10);
    expect(result.current.rtt).toBe(100);
    expect(result.current.saveData).toBe(false);
  });

  it('updates when network changes', () => {
    const { result } = renderHook(() => useNetworkStatus());
    
    // Simulate network change
    act(() => {
      mockConnection.effectiveType = '2g';
      mockConnection.downlink = 0.5;
      const changeHandler = mockConnection.addEventListener.mock.calls[0][1];
      changeHandler();
    });
    
    expect(result.current.effectiveType).toBe('2g');
    expect(result.current.downlink).toBe(0.5);
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useNetworkStatus());
    
    unmount();
    
    expect(mockConnection.removeEventListener).toHaveBeenCalled();
  });
});