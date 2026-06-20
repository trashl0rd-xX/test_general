import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions, StyleSheet, Easing } from 'react-native';
import { seededRandom } from '../../utils/seededRandom';
import { useGameStore } from '../../store/gameStore';

const { width: SCREEN_W } = Dimensions.get('window');
const STAR_COUNT = 55;
const TREE_COUNT = 22;
const MOON_SIZE = 34;

const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  x: seededRandom(i * 17 + 3) * 98 + 1,
  y: seededRandom(i * 13 + 7) * 72,
  size: seededRandom(i * 29 + 11) * 1.4 + 0.6,
  baseOpacity: seededRandom(i * 41 + 5) * 0.45 + 0.25,
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

  // Moon position drifts slowly left → right, looping
  const moonXAnim = useRef(new Animated.Value(-MOON_SIZE - 10)).current;
  // Moon phase: animates mask translateX to wax/wane between thin crescent and ~half moon
  const moonPhaseAnim = useRef(new Animated.Value(Math.round(MOON_SIZE * 0.18))).current;

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

  useEffect(() => {
    const xLoop = Animated.loop(
      Animated.timing(moonXAnim, {
        toValue: SCREEN_W + MOON_SIZE + 10,
        duration: 240000, // 4 min crossing
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const phaseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(moonPhaseAnim, {
          toValue: Math.round(MOON_SIZE * 0.50), // approaching half moon
          duration: 45000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(moonPhaseAnim, {
          toValue: Math.round(MOON_SIZE * 0.18), // thin crescent
          duration: 45000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    xLoop.start();
    phaseLoop.start();

    return () => {
      xLoop.stop();
      phaseLoop.stop();
    };
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

      {/* Moon drifts across the sky, waxing and waning but never full */}
      <Animated.View
        style={{
          position: 'absolute',
          top: '16%',
          left: 0,
          width: MOON_SIZE,
          height: MOON_SIZE,
          transform: [{ translateX: moonXAnim }],
        }}
      >
        <View style={styles.moonBase} />
        <Animated.View
          style={[styles.moonMask, { transform: [{ translateX: moonPhaseAnim }] }]}
        />
      </Animated.View>

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
  moonBase: {
    width: MOON_SIZE,
    height: MOON_SIZE,
    borderRadius: MOON_SIZE / 2,
    backgroundColor: '#cfc5a0',
  },
  moonMask: {
    position: 'absolute',
    left: 0,
    top: -6,
    width: MOON_SIZE,
    height: MOON_SIZE,
    borderRadius: MOON_SIZE / 2,
    backgroundColor: '#000000',
  },
});
