import { BeatQuality } from './BeatTracker'

export const DEFAULT_BPM = 110
export const DEFAULT_FONT = 'VCR'

export const WINDOW_WIDTH = 800
export const WINDOW_HEIGHT = 600

export enum Direction {
  RIGHT = 'RIGHT',
  LEFT = 'LEFT',
  NONE = 'NONE',
}

export const SORT_ORDER = {
  background: 100,
  body: 300,
  fist: 400,
  ui: 500,
  top: 600,
}

export const PLAYER_DAMAGE_MAPPING = {
  [BeatQuality.EARLY]: 5,
  [BeatQuality.LATE]: 5,
  [BeatQuality.PERFECT]: 10,
}

export const ENEMY_DAMAGE = 25

export const MUSIC_BPM_MAPPING = {
  100: ['unwritten'],
}
