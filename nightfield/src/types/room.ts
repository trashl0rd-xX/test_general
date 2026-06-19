export type ExitCondition = {
  flagRequired?: string;
  flagForbidden?: string;
  sanityThreshold?: number; // only visible BELOW this value
  entityBlocking?: string;
};

export type Exit = {
  direction: string;
  targetRoomId: string;
  label: string;
  condition?: ExitCondition;
  transitDescription?: string;
};

export type RoomObject = {
  id: string;
  label: string;
  examineInkKnot: string;
  interactInkKnot?: string;
  requiredFlag?: string;
  consumedOnInteract?: boolean;
};

export type AmbientTrack = {
  file: string;
  volume: number;
  loop: boolean;
};

export type EntitySpawn = {
  entityId: string;
  probability: number;
};

export type Room = {
  id: string;
  name: string;
  descriptionInkKnot: string;
  shortDescription: string;
  firstVisitInkKnot?: string;
  exits: Exit[];
  objects: RoomObject[];
  ambientTracks: AmbientTrack[];
  sanityDrainPerTick: number;
  entitySpawnTable?: EntitySpawn[];
  tags: string[];
};
