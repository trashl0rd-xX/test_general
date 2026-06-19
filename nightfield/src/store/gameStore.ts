import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Entity } from '../types/entity';
import type { Room } from '../types/room';

export type InventoryItem = {
  itemId: string;
  acquiredAt: number;
};

type GameStore = {
  // Location
  currentRoomId: string;
  visitedRooms: Set<string>;
  rooms: Map<string, Room>;

  // Sanity
  sanity: number;
  sanityFloor: number;

  // Flags
  flags: Record<string, boolean>;

  // Inventory
  inventory: InventoryItem[];

  // Narrative
  inkState: string | null;

  // Entities
  entities: Map<string, Entity>;
  activeEntityId: string | null;

  // Session
  totalSteps: number;
  phase: 'title' | 'playing' | 'encounter' | 'hallucination' | 'gameover' | 'ending';

  // Text seed — changes on each room entry to re-roll distortion
  textSeed: number;

  // Actions
  setRooms: (rooms: Map<string, Room>) => void;
  setEntities: (entities: Map<string, Entity>) => void;
  moveTo: (roomId: string) => void;
  setFlag: (key: string, value: boolean) => void;
  modifySanity: (delta: number) => void;
  addToInventory: (itemId: string) => void;
  removeFromInventory: (itemId: string) => void;
  setInkState: (state: string | null) => void;
  setActiveEntity: (entityId: string | null) => void;
  setPhase: (phase: GameStore['phase']) => void;
  moveEntity: (entityId: string, roomId: string) => void;
  resetGame: () => void;
};

const INITIAL_SANITY = 85;

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    currentRoomId: 'open_field_center',
    visitedRooms: new Set(),
    rooms: new Map(),
    sanity: INITIAL_SANITY,
    sanityFloor: INITIAL_SANITY,
    flags: {},
    inventory: [],
    inkState: null,
    entities: new Map(),
    activeEntityId: null,
    totalSteps: 0,
    phase: 'title',
    textSeed: 1,

    setRooms: (rooms) => set({ rooms }),
    setEntities: (entities) => set({ entities }),

    moveTo: (roomId) =>
      set((s) => {
        const visited = new Set(s.visitedRooms);
        visited.add(s.currentRoomId);
        return {
          currentRoomId: roomId,
          visitedRooms: visited,
          totalSteps: s.totalSteps + 1,
          textSeed: Math.floor(Math.random() * 999999) + 1,
        };
      }),

    setFlag: (key, value) =>
      set((s) => ({ flags: { ...s.flags, [key]: value } })),

    modifySanity: (delta) =>
      set((s) => {
        const next = Math.max(0, Math.min(100, s.sanity + delta));
        return {
          sanity: next,
          sanityFloor: Math.min(s.sanityFloor, next),
        };
      }),

    addToInventory: (itemId) =>
      set((s) => ({
        inventory: [...s.inventory, { itemId, acquiredAt: Date.now() }],
      })),

    removeFromInventory: (itemId) =>
      set((s) => ({
        inventory: s.inventory.filter((i) => i.itemId !== itemId),
      })),

    setInkState: (inkState) => set({ inkState }),

    setActiveEntity: (activeEntityId) => set({ activeEntityId }),

    setPhase: (phase) => set({ phase }),

    moveEntity: (entityId, roomId) =>
      set((s) => {
        const entities = new Map(s.entities);
        const entity = entities.get(entityId);
        if (entity) entities.set(entityId, { ...entity, currentRoomId: roomId });
        return { entities };
      }),

    resetGame: () =>
      set({
        currentRoomId: 'open_field_center',
        visitedRooms: new Set(),
        sanity: INITIAL_SANITY,
        sanityFloor: INITIAL_SANITY,
        flags: {},
        inventory: [],
        inkState: null,
        activeEntityId: null,
        totalSteps: 0,
        phase: 'playing',
        textSeed: Math.floor(Math.random() * 999999) + 1,
      }),
  }))
);
