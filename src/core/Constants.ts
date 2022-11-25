import { BeatQuality } from './BeatTracker'

export const DEFAULT_BPM = 100
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
  enemy: 300,
  player: 400,
  ui: 500,
  top: 600,
}

export const PLAYER_DAMAGE_MAPPING = {
  [BeatQuality.EARLY]: 10,
  [BeatQuality.LATE]: 10,
  [BeatQuality.PERFECT]: 20,
}

export const ENEMY_DAMAGE = 25

export const MUSIC_BPM_MAPPING = {
  100: [
    {
      name: 'Unwritten - Natasha Bedingfield',
      link: 'https://www.youtube.com/watch?v=vRQb_-mRcAc&ab_channel=7clouds',
    },
    {
      name: "Hips Don't Lie - Shakira feat. Wycleaf Jean",
      link: 'https://www.youtube.com/watch?v=JDjunuWB3Jo&ab_channel=PizzaMusic',
    },
    {
      name: 'Man in the Mirror - Michael Jackson',
      link: 'https://www.youtube.com/watch?v=Z9NYDgbKsBE',
    },
  ],
}
