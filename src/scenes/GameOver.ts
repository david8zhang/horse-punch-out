import Phaser from 'phaser'
import { button } from '~/ui/Button'
import { DEFAULT_FONT, WINDOW_HEIGHT, WINDOW_WIDTH } from '~/core/constants'

export default class GameOver extends Phaser.Scene {
  private score = 0

  constructor() {
    super('gameover')
  }

  init(data): void {
    if (data.score) {
      this.score = data.score
    }
  }

  create(): void {
    this.cameras.main.fadeIn(2000, 1, 1, 1)
    const bg = this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 'gameover')
    bg.setScale(2)
    const domElementsContainer = this.add.container(0, 0)
    this.add
      .text(this.scale.width / 2, this.scale.height / 3, 'GAME OVER')
      .setStyle({
        fontSize: '40px',
        fontFamily: DEFAULT_FONT,
      })
      .setOrigin(0.5)

    this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 3 + 50,
        `Score: ${this.score}`
      )
      .setStyle({
        fontSize: '40px',
        fontFamily: DEFAULT_FONT,
      })
      .setOrigin(0.5)

    const restartButton = button('Play Again', {
      fontSize: '20px',
      fontFamily: DEFAULT_FONT,
      color: 'black',
      width: 150,
      height: 40,
    }) as HTMLElement

    const restartButtonDom = this.add
      .dom(this.scale.width / 2, this.scale.height / 2 + 30, restartButton)
      .setOrigin(0.5)
      .addListener('click')
      .on('click', () => {
        const gameScene = this.scene.get('game')
        gameScene.registry.destroy()
        gameScene.scene.restart()
        gameScene.sound.removeAll()
        this.scene.start('game')
      })
    domElementsContainer.add(restartButtonDom)
    domElementsContainer.setAlpha(0)
    this.time.delayedCall(500, () => {
      this.tweens.add({
        targets: domElementsContainer,
        alpha: { value: 1, duration: 500 },
      })
    })
  }
}
