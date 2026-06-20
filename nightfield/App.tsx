import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useGameStore } from './src/store/gameStore';
import { loadRooms, loadEntities } from './src/utils/roomLoader';
import { TitleScreen } from './src/screens/TitleScreen';
import { GameScreen } from './src/screens/GameScreen';

export default function App() {
  const setRooms = useGameStore((s) => s.setRooms);
  const setEntities = useGameStore((s) => s.setEntities);
  const [screen, setScreen] = useState<'title' | 'game'>('title');

  useEffect(() => {
    setRooms(loadRooms());
    setEntities(loadEntities());
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        {screen === 'title' ? (
          <TitleScreen onStart={() => setScreen('game')} />
        ) : (
          <GameScreen onTitle={() => setScreen('title')} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080808',
  },
});
