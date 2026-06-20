import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGameStore, type InventoryItem } from '../store/gameStore';
import { narrativeEngine } from './narrativeEngine';

type SavePayload = {
  savedAt: number;
  roomName: string;
  sanity: number;
  totalSteps: number;
  currentRoomId: string;
  visitedRooms: string[];
  sanityFloor: number;
  flags: Record<string, boolean>;
  inventory: InventoryItem[];
  inkState: string | null;
};

const slotKey = (slotId: number) => `nightfield_save_${slotId}`;

export async function saveGame(slotId = 0): Promise<void> {
  const store = useGameStore.getState();
  const room = store.rooms.get(store.currentRoomId);

  const payload: SavePayload = {
    savedAt: Date.now(),
    roomName: room?.name ?? store.currentRoomId,
    sanity: Math.round(store.sanity),
    totalSteps: store.totalSteps,
    currentRoomId: store.currentRoomId,
    visitedRooms: Array.from(store.visitedRooms),
    sanityFloor: store.sanityFloor,
    flags: store.flags,
    inventory: store.inventory,
    inkState: narrativeEngine.serializeState(),
  };

  await AsyncStorage.setItem(slotKey(slotId), JSON.stringify(payload));
}

export async function loadGame(slotId = 0): Promise<boolean> {
  const raw = await AsyncStorage.getItem(slotKey(slotId));
  if (!raw) return false;

  const payload: SavePayload = JSON.parse(raw);
  useGameStore.setState({
    currentRoomId: payload.currentRoomId,
    visitedRooms: new Set(payload.visitedRooms),
    sanity: payload.sanity,
    sanityFloor: payload.sanityFloor,
    flags: payload.flags,
    inventory: payload.inventory,
    totalSteps: payload.totalSteps,
    phase: 'playing',
    inkState: payload.inkState,
  });

  return true;
}

export async function hasSave(slotId = 0): Promise<boolean> {
  return (await AsyncStorage.getItem(slotKey(slotId))) !== null;
}
