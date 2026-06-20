import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { hasSave, loadGame } from '../engine/saveSystem';
import { TitleArt } from '../components/hud/TitleArt';

type Props = {
  onStart: () => void;
};

export function TitleScreen({ onStart }: Props) {
  const insets = useSafeAreaInsets();
  const setPhase = useGameStore((s) => s.setPhase);
  const resetGame = useGameStore((s) => s.resetGame);
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    hasSave(0).then(setCanContinue);
  }, []);

  const handleNew = () => {
    resetGame();
    onStart();
  };

  const handleContinue = async () => {
    const ok = await loadGame(0);
    if (ok) {
      setPhase('playing');
      onStart();
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <StatusBar hidden />
      <View style={styles.titleBlock}>
        <Text style={styles.title}>NIGHTFIELD</Text>
        <Text style={styles.subtitle}>a horror in text</Text>
      </View>
      <View style={{ flex: 1 }}>
        <TitleArt />
      </View>
      <View style={styles.menu}>
        {canContinue && (
          <Pressable style={styles.item} onPress={handleContinue}>
            <Text style={styles.itemText}>› Continue</Text>
          </Pressable>
        )}
        <Pressable style={styles.item} onPress={handleNew}>
          <Text style={styles.itemText}>› New game</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080808',
    paddingHorizontal: 32,
  },
  titleBlock: {
    marginTop: 48,
    marginBottom: 8,
  },
  title: {
    color: '#c8bfa8',
    fontSize: 32,
    fontFamily: 'serif',
    letterSpacing: 8,
    marginBottom: 8,
  },
  subtitle: {
    color: '#3a3530',
    fontSize: 13,
    fontFamily: 'serif',
    letterSpacing: 3,
  },
  menu: {
    gap: 8,
  },
  item: {
    paddingVertical: 12,
  },
  itemText: {
    color: '#7a6a52',
    fontSize: 18,
    fontFamily: 'serif',
    letterSpacing: 1,
  },
});
