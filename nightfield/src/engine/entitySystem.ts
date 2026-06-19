import { useGameStore } from '../store/gameStore';
import type { Entity } from '../types/entity';

class EntitySystem {
  tick() {
    const store = useGameStore.getState();
    const { entities, currentRoomId } = store;

    entities.forEach((entity, id) => {
      const nextRoom = this.computeNextRoom(entity);
      if (nextRoom !== entity.currentRoomId) {
        store.moveEntity(id, nextRoom);
      }
    });

    this.checkProximity();
  }

  private computeNextRoom(entity: Entity): string {
    switch (entity.behavior) {
      case 'dormant':
      case 'static':
        return entity.currentRoomId;

      case 'patrol': {
        if (!entity.patrolRoute || entity.patrolRoute.length === 0) {
          return entity.currentRoomId;
        }
        const idx = entity.patrolRoute.indexOf(entity.currentRoomId);
        const next = (idx + 1) % entity.patrolRoute.length;
        return entity.patrolRoute[next];
      }

      case 'hunt': {
        const { currentRoomId, rooms } = useGameStore.getState();
        const room = rooms.get(entity.currentRoomId);
        if (!room) return entity.currentRoomId;
        // Move toward player room using exit graph (simple: pick any exit toward player)
        for (const exit of room.exits) {
          if (exit.targetRoomId === currentRoomId) return currentRoomId;
        }
        // Pick first available exit as crude pathfinding
        return room.exits[0]?.targetRoomId ?? entity.currentRoomId;
      }

      case 'wander': {
        const { rooms } = useGameStore.getState();
        const room = rooms.get(entity.currentRoomId);
        if (!room || room.exits.length === 0) return entity.currentRoomId;
        const exits = room.exits.filter((e) => !e.condition);
        if (exits.length === 0) return entity.currentRoomId;
        return exits[Math.floor(Math.random() * exits.length)].targetRoomId;
      }

      default:
        return entity.currentRoomId;
    }
  }

  private checkProximity() {
    const { entities, currentRoomId, rooms, modifySanity, setActiveEntity, phase } =
      useGameStore.getState();

    if (phase !== 'playing') return;

    entities.forEach((entity, id) => {
      if (entity.currentRoomId === currentRoomId) {
        setActiveEntity(id);
        modifySanity(-entity.sanityDrainOnProximity);
        return;
      }

      // Check if entity is adjacent (within detectionRange=1 for now)
      const entityRoom = rooms.get(entity.currentRoomId);
      const isAdjacent = entityRoom?.exits.some((e) => e.targetRoomId === currentRoomId);
      if (isAdjacent) {
        modifySanity(-entity.sanityDrainOnProximity * 0.4);
      }
    });
  }

  isEntityInRoom(roomId: string): Entity | undefined {
    const { entities } = useGameStore.getState();
    for (const entity of entities.values()) {
      if (entity.currentRoomId === roomId) return entity;
    }
    return undefined;
  }
}

export const entitySystem = new EntitySystem();
