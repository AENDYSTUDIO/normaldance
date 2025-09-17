import { describe, it, expect } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useAudioStore } from '@/hooks/useAudioStore';

describe('useAudioStore', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAudioStore());
    
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.volume).toBe(70);
    expect(result.current.isMuted).toBe(false);
    expect(result.current.queue).toEqual([]);
  });

  it('should toggle play state', () => {
    const { result } = renderHook(() => useAudioStore());
    
    act(() => {
      result.current.togglePlay();
    });
    
    expect(result.current.isPlaying).toBe(true);
    
    act(() => {
      result.current.togglePlay();
    });
    
    expect(result.current.isPlaying).toBe(false);
  });
});