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
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });

  useEffect(() => {
    setRevealed(0);
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setRevealed((r) => {
        if (r >= text.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return r;
        }
        return r + 1;
      });
    }, msPerChar);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, msPerChar]);

  // Fire onComplete after commit, not inside the state updater
  useEffect(() => {
    if (text.length > 0 && revealed >= text.length) {
      onCompleteRef.current?.();
    }
  }, [revealed, text.length]);

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
