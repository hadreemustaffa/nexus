import { useRef } from 'react';

export default function useDebounce<T extends (...args: never[]) => void>(
  fn: T,
  delay: number
) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  return (...args: Parameters<T>) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  };
}
