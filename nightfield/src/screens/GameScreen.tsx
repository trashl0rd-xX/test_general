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
import { sendAction } from '../engine/claudeNarrator';
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
  const setFlag = useGameStore((s) => s.setFlag);
  const addToInventory = useGameStore((s) => s.addToInventory);
  const rooms = useGameStore((s) => s.rooms);
  const moveTo = useGameStore((s) => s.moveTo);
  const inkState = useGameStore((s) => s.inkState);

  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [choicesVisible, setChoicesVisible] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const initialized = useRef(false);
  const paragraphsRef = useRef<string[]>([]);
  useEffect(() => { paragraphsRef.current = paragraphs; }, [paragraphs]);

  const applyNarrativeResult = useCallback(
    (result: { paragraphs: string[]; choices: NarrativeChoice[] }) => {
      setParagraphs((prev) => [...prev.slice(-20), ...result.paragraphs]);
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
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isResponding) return;

      setIsResponding(true);
      Haptics.selectionAsync();
      setParagraphs((prev) => [...prev.slice(-20), `› ${trimmed}`]);
      entitySystem.tick();

      try {
        const { paragraphs: resp, commands } = await sendAction(trimmed, {
          recentParagraphs: paragraphsRef.current,
          sanity: useGameStore.getState().sanity,
          flags: useGameStore.getState().flags,
          inventory: useGameStore.getState().inventory.map((i) => i.itemId),
        });

        for (const cmd of commands) {
          if (cmd.type === 'SANITY') modifySanity(cmd.delta);
          else if (cmd.type === 'SET_FLAG') setFlag(cmd.key, true);
          else if (cmd.type === 'ADD_ITEM') addToInventory(cmd.itemId);
          else if (cmd.type === 'PHASE') useGameStore.getState().setPhase(cmd.phase as 'title' | 'playing' | 'encounter' | 'hallucination' | 'gameover' | 'ending');
        }

        setParagraphs((prev) => [...prev.slice(-20), ...resp]);
        saveGame(0).catch(() => {});
      } catch {
        setParagraphs((prev) => [...prev, 'Something in the dark does not answer.']);
      } finally {
        setIsResponding(false);
      }
    },
    [isResponding, modifySanity, setFlag, addToInventory]
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
      <TextViewport paragraphs={paragraphs} onLastComplete={handleLastParagraphComplete} />
      {choicesVisible && phase === 'playing' && (
        <PlayerInput
          onSubmit={handleAction}
          disabled={isResponding}
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
