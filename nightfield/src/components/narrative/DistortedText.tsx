import React, { useMemo } from 'react';
import { TypewriterText } from './TypewriterText';
import { distortText } from '../../utils/sanityDistortion';
import { useGameStore } from '../../store/gameStore';

type Props = {
  text: string;
  msPerChar?: number;
  style?: object;
  onComplete?: () => void;
};

export function DistortedText({ text, msPerChar, style, onComplete }: Props) {
  const sanity = useGameStore((s) => s.sanity);
  const seed = useGameStore((s) => s.textSeed);

  const distorted = useMemo(
    () => distortText(text, sanity, seed),
    [text, sanity, seed]
  );

  return (
    <TypewriterText
      text={distorted}
      msPerChar={msPerChar}
      style={style}
      onComplete={onComplete}
    />
  );
}
