import React from 'react';
import { View, StyleSheet } from 'react-native';
import { seededRandom } from '../../utils/seededRandom';

const STARS = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  x: seededRandom(i * 31 + 7) * 96 + 2,
  y: seededRandom(i * 43 + 13) * 68,
  size: seededRandom(i * 17 + 3) * 1.0 + 0.5,
  opacity: seededRandom(i * 53 + 19) * 0.40 + 0.20,
}));

const TREES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: (i / 18) * 100 + seededRandom(i * 61 + 5) * (100 / 18) * 0.4,
  width: seededRandom(i * 37 + 11) * 12 + 4,
  height: seededRandom(i * 71 + 23) * 80 + 30,
}));

export function TitleArt() {
  return (
    <View style={styles.container}>
      {STARS.map((star) => (
        <View
          key={star.id}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: '#d8d0be',
            opacity: star.opacity,
          }}
        />
      ))}

      {/* Crescent moon */}
      <View style={styles.moonWrap}>
        <View style={styles.moonBase} />
        <View style={styles.moonMask} />
      </View>

      {/* Distant amber glow — the light to the north */}
      <View style={styles.glow} />

      {TREES.map((tree) => (
        <View
          key={tree.id}
          style={{
            position: 'absolute',
            bottom: 0,
            left: `${tree.x}%`,
            width: tree.width,
            height: tree.height,
            backgroundColor: '#000000',
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    overflow: 'hidden',
  },
  moonWrap: {
    position: 'absolute',
    right: 52,
    top: '18%',
    width: 48,
    height: 48,
  },
  moonBase: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#cfc5a0',
  },
  moonMask: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#080808',
    left: 13,
    top: -9,
  },
  glow: {
    position: 'absolute',
    bottom: '26%',
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 12,
    borderRadius: 12,
    backgroundColor: '#7a5530',
    opacity: 0.30,
  },
});
