import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/gameStore';

// Subtle ambient indicator — not a labelled bar, just a colour bleed at screen edge
export function SanityIndicator() {
  const sanity = useGameStore((s) => s.sanity);

  if (sanity > 70) return null;

  const intensity = (70 - sanity) / 70; // 0→1
  const opacity = intensity * 0.35;
  const color = sanity < 30 ? '#8b0000' : '#3d1a00';

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { borderWidth: 3, borderColor: color, opacity }]}
    />
  );
}
