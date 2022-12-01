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
  60: [
    {
      name: 'Tik Tok - Ke$ha',
      link: 'https://www.youtube.com/watch?v=OF04pKp-r9o',
    },
    {
      name: 'Call Me Maybe - Carly Rae Jepsen',
      link: 'https://www.youtube.com/watch?v=FUVwhKsfHiE',
    },
    {
      name: "It's My Life - Bon Jovi",
      link: 'https://www.youtube.com/watch?v=ZXfLxqsNO4s',
    },
  ],
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
  110: [
    {
      name: 'Hollaback Girl - Gwen Stefani',
      link: 'https://www.youtube.com/watch?v=_jAAixDgHhM',
    },
    {
      name: 'Wannabe - Spice Girls',
      link: 'https://www.youtube.com/watch?v=HNehiNC_tq0',
      delay: 4,
    },
    {
      name: 'Another One Bites the Dust - Queen',
      link: 'https://www.youtube.com/watch?v=kwwaWVP2PGE',
      delay: 1,
    },
  ],
  120: [
    {
      name: 'Tik Tok - Ke$ha',
      link: 'https://www.youtube.com/watch?v=OF04pKp-r9o',
    },
    {
      name: 'Call Me Maybe - Carly Rae Jepsen',
      link: 'https://www.youtube.com/watch?v=FUVwhKsfHiE',
    },
    {
      name: "It's My Life - Bon Jovi",
      link: 'https://www.youtube.com/watch?v=ZXfLxqsNO4s',
    },
    {
      name: 'Dynamite - Taio Cruz',
      link: 'https://www.youtube.com/watch?v=2JUNnKmZhqA',
    },
    {
      name: 'Forever - Chris Brown',
      link: 'https://www.youtube.com/watch?v=-s6dlaOrnIg',
    },
    {
      name: "Don't Cha - Pussycat Dolls",
      link: 'https://www.youtube.com/watch?v=5w-lMYTc7fU',
    },
  ],
  130: [
    {
      name: 'On The Floor - Jennifer Lopez',
      link: 'https://www.youtube.com/watch?v=70XspGKI8kQ',
    },
    {
      name: 'Pumped Up Kicks - Foster The People',
      link: 'https://www.youtube.com/watch?v=k_aQYP8rsgE',
    },
    {
      name: 'Party Rock Anthem - LMFAO',
      link: 'https://www.youtube.com/watch?v=zIh5AHxh-Ok',
    },
    {
      name: 'Timber - Pitbull ft. Kesha',
      link: 'https://www.youtube.com/watch?v=zHESy8XsJPs',
    },
  ],
}
