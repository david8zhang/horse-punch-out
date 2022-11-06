import Phaser from 'phaser'
import { WINDOW_HEIGHT, WINDOW_WIDTH } from './core/Constants'

import Game from './scenes/Game'
import GameOver from './scenes/GameOver'
import { Preload } from './scenes/Preload'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: WINDOW_WIDTH,
  height: WINDOW_HEIGHT,
  parent: 'phaser',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      // debug: true,
    },
  },
  dom: {
    createContainer: true,
  },
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Preload, Game, GameOver],
}

export default new Phaser.Game(config)
