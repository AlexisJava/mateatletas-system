'use client';

import { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: string;
  suffix?: string;
}

export function AnimatedCounter({ value, suffix = '' }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const targetValue = Number.parseInt(value.replace(/\D/g, ''), 10) || 0;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          let start = 0;
          const end = targetValue;
          const duration = 2000;
          const increment = end / (duration / 16);

          timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              if (timer) clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 },
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [targetValue]);

  return (
    <div ref={ref} className="text-3xl font-bold tabular-nums">
      {count}
      {suffix}
    </div>
  );
}
