'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, prefersReducedMotion } from './useInView';

interface CountUpProps {
  to: number | null;
  duration?: number;
  // Optional formatter to show the running value as text.
  format?: (n: number) => string;
}

export function CountUp({ to, duration = 1400, format }: CountUpProps) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.4 });
  const [value, setValue] = useState<number>(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current || to == null) return;
    started.current = true;

    if (prefersReducedMotion() || to <= 0) {
      setValue(to ?? 0);
      return;
    }

    const start = performance.now();
    const from = 0;
    const target = to;

    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  const display = to == null || to === 0 ? '—' : format ? format(value) : String(value);

  return <span ref={ref}>{display}</span>;
}
