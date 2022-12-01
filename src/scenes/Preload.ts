import { WINDOW_HEIGHT, WINDOW_WIDTH } from '~/core/Constants'

export class Preload extends Phaser.Scene {
  public loaded: string[] = []
  public loadingText!: Phaser.GameObjects.Text

  constructor() {
    super('preload')
  }

  preload() {
    // ui
    this.load.image('gameover', 'ui/gameover.png')
    this.load.image('heart', 'ui/heart.png')
    this.load.image('splash', 'ui/splash.png')
    this.load.image('fight-bg', 'ui/fight-background.png')

    this.load.image('cutscene-1', 'sprites/cutscene-1.png')
    this.load.image('cutscene-2', 'sprites/cutscene-2.png')
    this.load.image('cutscene-3', 'sprites/cutscene-3.png')
    this.load.image('cutscene-4', 'sprites/cutscene-4.png')

    // tutorial
    this.load.image('tutorial-prompt-keyA', 'tutorial/A_Key_Light.png')
    this.load.image('tutorial-prompt-keyD', 'tutorial/D_Key_Light.png')
    this.load.image('tutorial-prompt-keySpace', 'tutorial/Space_Key_Light.png')

    this.loadSprites()

    this.loadingText = this.add.text(0, 0, 'Loading: 0%', {
      fontSize: '30px',
      fontFamily: 'VCR',
    })
    this.loadingText.setPosition(
      WINDOW_WIDTH / 2 - this.loadingText.displayWidth / 2,
      WINDOW_HEIGHT / 2 - this.loadingText.displayHeight / 2
    )

    this.load.on('complete', () => {
      this.scene.start('start')
    })

    this.load.on('progress', (percentComplete) => {
      const percentage = Math.round(percentComplete * 100)
      this.loadingText.setText(`Loading: ${percentage}%`)
    })
  }

  loadSprites() {
    this.load.image(
      'enemy-punch-windup-left',
      'sprites/enemy-punch-windup-left.png'
    )
    this.load.image(
      'enemy-punch-windup-right',
      'sprites/enemy-punch-windup-right.png'
    )
    this.load.image('enemy-idle', 'sprites/enemy-idle.png')
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
