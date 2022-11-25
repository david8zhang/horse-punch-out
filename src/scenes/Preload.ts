import { WINDOW_HEIGHT, WINDOW_WIDTH } from '~/core/Constants'

export class Preload extends Phaser.Scene {
  public loaded: string[] = []
  public loadingText!: Phaser.GameObjects.Text

  constructor() {
    super('preload')
  }

  preload() {
    this.load.image('gameover', 'ui/gameover.png')
    this.load.image('heart', 'ui/heart.png')
    this.loadSprites()
    this.scene.start('start')
  }

  loadSprites() {
    const variants = ['hit', 'dodge', 'windup', 'punch']
    const directions = ['left', 'right']
    variants.forEach((variant) => {
      directions.forEach((dir) => {
        this.load.image(
          `player-${variant}-${dir}`,
          `sprites/player-${variant}-${dir}.png`
        )
        this.load.image(
          `enemy-${variant}-${dir}`,
          `sprites/enemy-${variant}-${dir}.png`
        )
      })
    })
  }
}
