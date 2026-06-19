export type NarrativeChoice = {
  index: number;
  text: string;
  isPhantom?: boolean;
};

export type NarrativeResult = {
  paragraphs: string[];
  choices: NarrativeChoice[];
};

export type GamePhase =
  | 'title'
  | 'playing'
  | 'encounter'
  | 'hallucination'
  | 'gameover'
  | 'ending';
