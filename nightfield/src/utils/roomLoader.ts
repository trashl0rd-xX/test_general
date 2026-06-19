import type { Room } from '../types/room';
import type { Entity } from '../types/entity';

// Static imports — bundled at build time (Expo doesn't support dynamic require for json in native)
import openFieldCenter from '../../assets/data/rooms/open_field_center.json';
import firstClearing from '../../assets/data/rooms/first_clearing.json';
import theStalker from '../../assets/data/entities/the_stalker.json';

const ROOM_DATA: Room[] = [openFieldCenter as Room, firstClearing as Room];
const ENTITY_DATA: Entity[] = [theStalker as Entity];

export function loadRooms(): Map<string, Room> {
  const map = new Map<string, Room>();
  for (const room of ROOM_DATA) {
    map.set(room.id, room);
  }
  return map;
}

export function loadEntities(): Map<string, Entity> {
  const map = new Map<string, Entity>();
  for (const entity of ENTITY_DATA) {
    map.set(entity.id, entity);
  }
  return map;
}
