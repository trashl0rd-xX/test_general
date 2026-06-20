import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Easing } from 'react-native';
import { useGameStore } from '../../store/gameStore';

const PROXIMITY: Record<string, number> = {
  open_field_center: 0.04,
  field_search: 0.04,
  field_listen: 0.05,
  treeline_north: 0.12,
  treeline_east: 0.12,
  treeline_east_2: 0.08,
  forest_path_a: 0.20,
  forest_path_a_wait: 0.18,
  first_clearing: 0.28,
  first_clearing_hallucination: 0.36,
  read_note_1: 0.30,
  hollow_log: 0.22,
  forest_path_b: 0.30,
  creek_crossing: 0.38,
  dense_thicket: 0.52,
  dense_thicket_encounter: 0.60,
  forest_path_c: 0.55,
  forest_path_c_watch: 0.50,
  old_fence_line: 0.40,
  field_south_slope: 0.28,
  fallen_stones: 0.65,
  farmhouse_approach: 0.85,
  ending_passage: 0.95,
  ending_absorption: 1.0,
  ending_taken: 0.60,
};

const TONGUES: Array<{
  leftPct: number; width: number; height: number;
  period: number; amp: number; color: string; startDelay: number;
}> = [
  { leftPct: 8,  width: 56, height: 180, period: 2000, amp: 12, color: '#c85008', startDelay: 0 },
  { leftPct: 25, width: 72, height: 240, period: 2400, amp: 16, color: '#d4620a', startDelay: 350 },
  { leftPct: 42, width: 44, height: 150, period: 1800, amp: 9,  color: '#bf4a06', startDelay: 180 },
  { leftPct: 58, width: 62, height: 200, period: 2200, amp: 14, color: '#c85008', startDelay: 560 },
  { leftPct: 73, width: 52, height: 175, period: 2600, amp: 11, color: '#d46010', startDelay: 280 },
  { leftPct: 33, width: 38, height: 120, period: 1650, amp: 8,  color: '#b84006', startDelay: 700 },
  { leftPct: 50, width: 66, height: 260, period: 2900, amp: 18, color: '#c05010', startDelay: 90 },
];

export function FlameBackground() {
  const currentRoomId = useGameStore((s) => s.currentRoomId);
  const intensityAnim = useRef(new Animated.Value(PROXIMITY[currentRoomId] ?? 0.04)).current;
  const swayAnims = useRef(TONGUES.map(() => new Animated.Value(0))).current;
  const swayLoopsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    const target = PROXIMITY[currentRoomId] ?? 0.04;
    Animated.timing(intensityAnim, {
      toValue: target,
      duration: 1800,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [currentRoomId]);

  useEffect(() => {
    const timers = TONGUES.map((tongue, i) => {
      const anim = swayAnims[i];
      return setTimeout(() => {
        const loop = Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: tongue.amp,
              duration: tongue.period / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: -tongue.amp,
              duration: tongue.period / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        swayLoopsRef.current.push(loop);
        loop.start();
      }, tongue.startDelay);
    });

    return () => {
      timers.forEach(clearTimeout);
      swayLoopsRef.current.forEach((l) => l.stop());
      swayLoopsRef.current = [];
    };
  }, []);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          opacity: intensityAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.14],
          }),
        },
      ]}
      pointerEvents="none"
    >
      {TONGUES.map((tongue, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            bottom: -20,
            left: `${tongue.leftPct}%`,
            width: tongue.width,
            height: tongue.height,
            borderTopLeftRadius: tongue.width * 0.65,
            borderTopRightRadius: tongue.width * 0.45,
            borderBottomLeftRadius: tongue.width * 0.35,
            borderBottomRightRadius: tongue.width * 0.55,
            backgroundColor: tongue.color,
            transform: [{ translateX: swayAnims[i] }],
          }}
        />
      ))}
    </Animated.View>
  );
}
