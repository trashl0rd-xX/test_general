import * as SQLite from 'expo-sqlite';
import { useGameStore } from '../store/gameStore';
import { narrativeEngine } from './narrativeEngine';

const DB_NAME = 'nightfield.db';

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS save_slots (
        slot_id     INTEGER PRIMARY KEY,
        saved_at    INTEGER NOT NULL,
        room_name   TEXT NOT NULL,
        sanity      INTEGER NOT NULL,
        total_steps INTEGER NOT NULL,
        state_json  TEXT NOT NULL
      );
    `);
  }
  return db;
}

export async function saveGame(slotId: number = 0): Promise<void> {
  const database = await getDb();
  const store = useGameStore.getState();
  const room = store.rooms.get(store.currentRoomId);

  const payload = {
    currentRoomId: store.currentRoomId,
    visitedRooms: Array.from(store.visitedRooms),
    sanity: store.sanity,
    sanityFloor: store.sanityFloor,
    flags: store.flags,
    inventory: store.inventory,
    totalSteps: store.totalSteps,
    inkState: narrativeEngine.serializeState(),
  };

  await database.runAsync(
    `INSERT OR REPLACE INTO save_slots (slot_id, saved_at, room_name, sanity, total_steps, state_json)
     VALUES (?, ?, ?, ?, ?, ?)`,
    slotId,
    Date.now(),
    room?.name ?? store.currentRoomId,
    Math.round(store.sanity),
    store.totalSteps,
    JSON.stringify(payload)
  );
}

export async function loadGame(slotId: number = 0): Promise<boolean> {
  const database = await getDb();
  const row = await database.getFirstAsync<{ state_json: string }>(
    'SELECT state_json FROM save_slots WHERE slot_id = ?',
    slotId
  );

  if (!row) return false;

  const payload = JSON.parse(row.state_json);
  const store = useGameStore.getState();

  store.resetGame();
  useGameStore.setState({
    currentRoomId: payload.currentRoomId,
    visitedRooms: new Set(payload.visitedRooms),
    sanity: payload.sanity,
    sanityFloor: payload.sanityFloor,
    flags: payload.flags,
    inventory: payload.inventory,
    totalSteps: payload.totalSteps,
    phase: 'playing',
  });

  if (payload.inkState) {
    store.setInkState(payload.inkState);
  }

  return true;
}

export async function hasSave(slotId: number = 0): Promise<boolean> {
  const database = await getDb();
  const row = await database.getFirstAsync<{ slot_id: number }>(
    'SELECT slot_id FROM save_slots WHERE slot_id = ?',
    slotId
  );
  return !!row;
}
