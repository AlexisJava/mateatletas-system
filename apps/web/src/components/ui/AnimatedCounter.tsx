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
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          let start = 0;
          const end = targetValue;
          const duration = 2000;
          const increment = end / (duration / 16);

          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [targetValue]);

  return (
    <div ref={ref} className="text-3xl font-bold tabular-nums">
      {count}
      {suffix}
    </div>
  );
}
