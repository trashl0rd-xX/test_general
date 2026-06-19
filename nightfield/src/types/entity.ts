export type EntityBehavior = 'wander' | 'patrol' | 'hunt' | 'dormant' | 'static';

export type EntityEncounterResponse = {
  choiceLabel: string;
  inkKnot: string;
  sanityEffect: number;
  successCondition?: {
    flagRequired?: string;
    statCheck?: { stat: 'sanity'; threshold: number; comparison: 'above' | 'below' };
  };
};

export type Entity = {
  id: string;
  name: string;
  currentRoomId: string;
  behavior: EntityBehavior;
  patrolRoute?: string[];
  detectionRange: number;
  soundFile?: string;
  proximityText: string[];
  encounterInkKnot: string;
  encounterResponses: EntityEncounterResponse[];
  sanityDrainOnProximity: number;
  isKillable: boolean;
  killCondition?: { flagRequired: string };
};
