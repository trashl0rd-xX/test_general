import React, { useRef, useEffect } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { DistortedText } from './DistortedText';

type Props = {
  paragraphs: string[];
  onLastComplete?: () => void;
};

export function TextViewport({ paragraphs, onLastComplete }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [paragraphs]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {paragraphs.map((p, idx) => (
        <View key={`${idx}-${p.slice(0, 12)}`} style={styles.paragraph}>
          <DistortedText
            text={p}
            onComplete={idx === paragraphs.length - 1 ? onLastComplete : undefined}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
  },
  paragraph: {
    marginBottom: 4,
  },
});
