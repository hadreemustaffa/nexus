import { act, renderHook } from '@testing-library/react';

import useDebounce from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not call the wrapped function before the delay elapses', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useDebounce(mockFn, 500));

    act(() => {
      result.current('test');
    });

    expect(mockFn).not.toHaveBeenCalled();
  });

  it('calls it once the delay elapses, with the latest arguments', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useDebounce(mockFn, 500));

    act(() => {
      result.current('test');
    });

    vi.advanceTimersByTime(500);

    expect(mockFn).toHaveBeenCalledWith('test');
  });

  it('resets the timer for a second call within the delay window', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useDebounce(mockFn, 500));

    act(() => {
      result.current('test');
    });

    vi.advanceTimersByTime(250);

    act(() => {
      result.current('timer');
    });

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(mockFn).toHaveBeenCalledExactlyOnceWith('timer');
  });
});
