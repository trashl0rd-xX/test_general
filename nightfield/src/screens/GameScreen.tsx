import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../store/gameStore';
import { narrativeEngine } from '../engine/narrativeEngine';
import { entitySystem } from '../engine/entitySystem';
import { saveGame } from '../engine/saveSystem';
import { startAmbient, stopAmbient, setAmbientIntensity } from '../engine/ambientAudio';
import { TextViewport } from '../components/narrative/TextViewport';
import { PlayerInput } from '../components/narrative/PlayerInput';
import { SanityIndicator } from '../components/hud/SanityIndicator';
import { StarField } from '../components/hud/StarField';
import { FlameBackground } from '../components/hud/FlameBackground';
import { matchChoice } from '../utils/matchChoice';
import type { NarrativeChoice } from '../types/narrative';

// Ink story — compiled JSON bundled at build time
import storyContent from '../../assets/story/main.ink.json';

type Props = {
  onTitle: () => void;
};

export function GameScreen({ onTitle }: Props) {
  const insets = useSafeAreaInsets();
  const currentRoomId = useGameStore((s) => s.currentRoomId);
  const phase = useGameStore((s) => s.phase);
  const modifySanity = useGameStore((s) => s.modifySanity);
  const rooms = useGameStore((s) => s.rooms);
  const inkState = useGameStore((s) => s.inkState);

  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [choices, setChoices] = useState<NarrativeChoice[]>([]);
  const [choicesVisible, setChoicesVisible] = useState(false);
  const initialized = useRef(false);

  const applyNarrativeResult = useCallback(
    (result: { paragraphs: string[]; choices: NarrativeChoice[] }) => {
      setParagraphs((prev) => [...prev.slice(-20), ...result.paragraphs]);
      setChoices(result.choices);
      setChoicesVisible(false);
    },
    []
  );

  // Initialize engine once
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    narrativeEngine.initialize(storyContent, inkState ?? undefined);
    const result = narrativeEngine.jumpToKnot(currentRoomId);
    applyNarrativeResult(result);
  }, []);

  // Sanity drain tick — once per second
  useEffect(() => {
    if (phase !== 'playing') return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    const interval = setInterval(() => {
      modifySanity(-room.sanityDrainPerTick);
    }, 4000);

    return () => clearInterval(interval);
  }, [currentRoomId, phase]);

  // Ambient infrasound — start on mount, scale with sanity
  useEffect(() => {
    startAmbient();
    return () => { stopAmbient(); };
  }, []);

  // Haptic feedback + ambient intensity when sanity changes
  const prevSanity = useRef<number>(useGameStore.getState().sanity);
  useEffect(() => {
    return useGameStore.subscribe(
      (s) => s.sanity,
      (sanity) => {
        const prev = prevSanity.current;
        prevSanity.current = sanity;
        if (prev > 50 && sanity <= 50) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (prev > 30 && sanity <= 30) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (prev > 10 && sanity <= 10) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        if (sanity <= 0) {
          useGameStore.getState().setPhase('gameover');
        }
        setAmbientIntensity(Math.max(0, 1 - sanity / 100));
      }
    );
  }, []);

  const handleAction = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const idx = matchChoice(trimmed, choices);
      if (idx === null) {
        const fallbacks = [
          'Nothing in the field acknowledges this.',
          "The dark doesn't change.",
          "You try. The night doesn't move.",
          "Something about that doesn't work here.",
          "The words leave you. Nothing comes back.",
        ];
        setParagraphs((prev) => [
          ...prev,
          fallbacks[Math.floor(Math.random() * fallbacks.length)],
        ]);
        return;
      }

      setChoicesVisible(false);
      Haptics.selectionAsync();
      const result = narrativeEngine.choose(idx);
      entitySystem.tick();
      applyNarrativeResult(result);
      saveGame(0).catch(() => {});
    },
    [choices, applyNarrativeResult]
  );

  const handleLastParagraphComplete = useCallback(() => {
    setChoicesVisible(true);

    // Game over screen
    if (phase === 'gameover' || phase === 'ending') {
      setTimeout(() => onTitle(), 6000);
    }
  }, [phase, onTitle]);

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <View style={{ height: insets.top }}>
        <SanityIndicator />
      </View>
      <StarField />
      <View style={{ flex: 1 }}>
        <FlameBackground />
        <TextViewport paragraphs={paragraphs} onLastComplete={handleLastParagraphComplete} />
      </View>
      {choicesVisible && phase === 'playing' && (
        <PlayerInput
          onSubmit={handleAction}
          style={{ paddingBottom: Math.max(32, insets.bottom + 8) }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080808',
  },
});
