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
      name: 'Moombahton Trap',
      link: 'https://www.youtube.com/watch?v=Udq3RjCNfsY',
    },
    {
      name: 'Techno Beats',
      link: 'https://www.youtube.com/watch?v=bFK46JkMhjI',
    },
  ],
  110: [
    {
      name: 'Under the Shade',
      link: 'https://www.youtube.com/watch?v=kk1dphZU0cc',
    },
    {
      name: 'Melodic Techno Rock',
      link: 'https://www.youtube.com/watch?v=sY9h95OzH2U',
    },
  ],
  120: [
    {
      name: 'Exciting Mood',
      link: 'https://www.youtube.com/watch?v=MP9MFdK2rUg',
    },
    {
      name: 'Dance',
      link: 'https://www.youtube.com/watch?v=c65IzrEM8PE',
    },
    {
      name: 'Rock Beat',
      link: 'https://www.youtube.com/watch?v=OJXZTMpvgus',
    },
  ],
  130: [
    {
      name: 'Uptempo Beats',
      link: 'https://www.youtube.com/watch?v=MvSMBdCxT8I',
    },
    {
      name: 'Fairy Tale',
      link: 'https://www.youtube.com/watch?v=b2WX_O1YwHk',
    },
    {
      name: 'Zumba Zumba',
      link: 'https://www.youtube.com/watch?v=Qv11UYhq2j0',
    },
  ],
}
