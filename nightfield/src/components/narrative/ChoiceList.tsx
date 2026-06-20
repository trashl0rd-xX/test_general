import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { NarrativeChoice } from '../../types/narrative';
import { useGameStore } from '../../store/gameStore';

type Props = {
  choices: NarrativeChoice[];
  onChoose: (index: number) => void;
  visible: boolean;
  style?: object;
};

export function ChoiceList({ choices, onChoose, visible, style }: Props) {
  const sanity = useGameStore((s) => s.sanity);

  if (!visible || choices.length === 0) return null;

  // Below sanity 30, shuffle the visual order (indices stay correct)
  const displayed = sanity < 30 ? [...choices].sort(() => Math.random() - 0.5) : choices;

  // Below sanity 10, inject a phantom choice
  const withPhantom: NarrativeChoice[] =
    sanity < 10
      ? [
          ...displayed,
          { index: -1, text: 'Close your eyes', isPhantom: true },
        ]
      : displayed;

  return (
    <View style={[styles.container, style]}>
      {withPhantom.map((choice, i) => (
        <Pressable
          key={`choice-${choice.index}-${i}`}
          style={({ pressed }) => [
            styles.choice,
            pressed && styles.choicePressed,
            choice.isPhantom && styles.choicePhantom,
          ]}
          onPress={() => {
            if (!choice.isPhantom) onChoose(choice.index);
          }}
        >
          <Text style={[styles.bullet, choice.isPhantom && styles.phantomBullet]}>›</Text>
          <Text style={[styles.text, choice.isPhantom && styles.phantomText]}>
            {choice.text}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 4,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2a2a2a',
    gap: 10,
  },
  choicePressed: {
    opacity: 0.5,
  },
  choicePhantom: {
    opacity: 0.25,
  },
  bullet: {
    color: '#7a6a52',
    fontSize: 18,
    lineHeight: 26,
  },
  phantomBullet: {
    color: '#3a3030',
  },
  text: {
    color: '#9a8e78',
    fontSize: 16,
    lineHeight: 26,
    flex: 1,
    fontFamily: 'serif',
  },
  phantomText: {
    color: '#3a3030',
    fontStyle: 'italic',
  },
});
