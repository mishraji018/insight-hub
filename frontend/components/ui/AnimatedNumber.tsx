"use client";

import { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (val: number) => string;
}

export function AnimatedNumber({ 
  value, 
  duration = 1500, 
  format = (val) => Math.floor(val).toLocaleString() 
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);

  const animate = (time: number) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = time;
    }

    const progress = Math.min((time - startTimeRef.current) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    
    const currentVal = easedProgress * value;
    setDisplayValue(currentVal);

    if (progress < 1) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    startTimeRef.current = null;
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [value, duration]);

  return <>{format(displayValue)}</>;
}
