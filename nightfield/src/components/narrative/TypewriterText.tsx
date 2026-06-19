import React, { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet } from 'react-native';

type Props = {
  text: string;
  msPerChar?: number;
  style?: object;
  onComplete?: () => void;
};

export function TypewriterText({ text, msPerChar = 28, style, onComplete }: Props) {
  const [revealed, setRevealed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRevealed(0);
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setRevealed((r) => {
        if (r >= text.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onComplete?.();
          return r;
        }
        return r + 1;
      });
    }, msPerChar);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, msPerChar]);

  return (
    <Text style={[styles.text, style]} selectable={false}>
      {text.slice(0, revealed)}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: '#c8bfa8',
    fontSize: 17,
    lineHeight: 28,
    fontFamily: 'serif',
    letterSpacing: 0.3,
  },
});
