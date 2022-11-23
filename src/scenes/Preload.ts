import { WINDOW_HEIGHT, WINDOW_WIDTH } from '~/core/Constants'

export class Preload extends Phaser.Scene {
  public loaded: string[] = []
  public loadingText!: Phaser.GameObjects.Text
  public songList: string[] = ['unwritten']

  constructor() {
    super('preload')
  }

  preload() {
    this.load.image('gameover', 'ui/gameover.png')
    this.load.image('heart', 'ui/heart.png')
    this.load.audio('unwritten', 'music/unwritten.mp3')
    this.loadSprites()

    this.loadingText = this.add.text(
      0,
      0,
      `Loading: ${this.loaded.length / this.songList.length}%`,
      {
        fontSize: '30px',
      }
    )
    this.loadingText.setPosition(
      WINDOW_WIDTH / 2 - this.loadingText.displayWidth / 2,
      WINDOW_HEIGHT / 2 - this.loadingText.displayHeight / 2
    )

    this.load.on('complete', (e) => {
      if (this.loaded.length === this.songList.length) {
        this.scene.start('start')
      }
    })

    this.load.on('filecomplete', (e) => {
      if (this.songList.includes(e)) {
        this.loaded.push(e)
      }
      this.loadingText.setText(
        `Loading: ${Math.round(
          (this.loaded.length / this.songList.length) * 100
        )}%`
      )
    })
    this.load.on('loaderror', (e) => {
      console.error(e)
    })
  }

  loadSprites() {
    const variants = ['hit', 'dodge', 'windup', 'direction']
    const directions = ['left', 'right']
    variants.forEach((variant) => {
      directions.forEach((dir) => {
        this.load.image(
          `player-${variant}-${dir}`,
          `sprites/player-${variant}-${dir}.png`
        )
        this.load.image(
          `enemy-${variant}-${dir}`,
          `sprites/player-${variant}-${dir}.png`
        )
      })
    })
  }
}
