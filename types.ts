export enum AppPhase {
  IDLE = 'IDLE',
  COUNTDOWN_5 = 'COUNTDOWN_5',
  COUNTDOWN_4 = 'COUNTDOWN_4',
  COUNTDOWN_3 = 'COUNTDOWN_3',
  COUNTDOWN_2 = 'COUNTDOWN_2',
  COUNTDOWN_1 = 'COUNTDOWN_1',
  YEAR_REVEAL = 'YEAR_REVEAL',
  TREE_FORMATION = 'TREE_FORMATION',
  PHOTO_WALL = 'PHOTO_WALL',
}

export interface ParticleState {
  count: number;
}

export type Orientation = 'landscape' | 'portrait';

export interface GalleryItem {
  id: string;
  url: string;
  orientation: Orientation;
}