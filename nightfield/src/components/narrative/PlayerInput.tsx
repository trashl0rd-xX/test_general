import React, { useRef, useState } from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';

type Props = {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  style?: object;
};

export function PlayerInput({ onSubmit, disabled, style }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue('');
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <Text style={[styles.prompt, disabled && styles.dim]}>›</Text>
        <TextInput
          ref={inputRef}
          style={[styles.input, disabled && styles.dim]}
          value={value}
          onChangeText={setValue}
          onSubmitEditing={handleSubmit}
          placeholder="what do you do?"
          placeholderTextColor="#2e2b27"
          returnKeyType="send"
          editable={!disabled}
          autoCorrect={false}
          autoCapitalize="none"
          blurOnSubmit={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1f1e1c',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prompt: {
    color: '#7a6a52',
    fontSize: 18,
    lineHeight: 24,
  },
  input: {
    flex: 1,
    color: '#9a8e78',
    fontSize: 16,
    fontFamily: 'serif',
    paddingVertical: 4,
  },
  dim: {
    opacity: 0.3,
  },
});
