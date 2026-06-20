import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { seededRandom } from '../../utils/seededRandom';
import { useGameStore } from '../../store/gameStore';

const STAR_COUNT = 55;
const TREE_COUNT = 22;

const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  x: seededRandom(i * 17 + 3) * 98 + 1,       // 1–99% width
  y: seededRandom(i * 13 + 7) * 72,             // 0–72% height (top portion)
  size: seededRandom(i * 29 + 11) * 1.4 + 0.6, // 0.6–2pt
  baseOpacity: seededRandom(i * 41 + 5) * 0.45 + 0.25, // 0.25–0.70
}));

const TREES = Array.from({ length: TREE_COUNT }, (_, i) => ({
  id: i,
  x: (i / TREE_COUNT) * 100 + seededRandom(i * 7 + 2) * (100 / TREE_COUNT) * 0.6,
  width: seededRandom(i * 19 + 1) * 7 + 3,
  height: seededRandom(i * 23 + 9) * 22 + 8,
}));

export function StarField() {
  const sanity = useGameStore((s) => s.sanity);
  const [dimmed, setDimmed] = useState<Set<number>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      const next = new Set<number>();
      for (let i = 0; i < 6; i++) {
        next.add(Math.floor(Math.random() * STAR_COUNT));
      }
      setDimmed(next);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const visibleCount = Math.floor(STAR_COUNT * Math.max(0.1, sanity / 100));

  return (
    <View style={styles.container}>
      {STARS.slice(0, visibleCount).map((star) => (
        <View
          key={star.id}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: '#ddd8c4',
            opacity: dimmed.has(star.id) ? star.baseOpacity * 0.2 : star.baseOpacity,
          }}
        />
      ))}
      {TREES.map((tree) => (
        <View
          key={tree.id}
          style={{
            position: 'absolute',
            bottom: 0,
            left: `${tree.x}%`,
            width: tree.width,
            height: tree.height,
            backgroundColor: '#050505',
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 88,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
});
