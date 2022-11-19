import { DEFAULT_FONT, WINDOW_HEIGHT, WINDOW_WIDTH } from '~/core/Constants'
import { button } from '~/ui/Button'

export class Start extends Phaser.Scene {
  constructor() {
    super('start')
  }

  create() {
    const titleText = this.add
      .text(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 'Beat of the Dead Horse')
      .setStyle({
        fontSize: '40px',
        fontFamily: DEFAULT_FONT,
      })
    titleText.setPosition(
      titleText.x - titleText.displayWidth / 2,
      WINDOW_HEIGHT * 0.4
    )

    const domElementsContainer = this.add.container(0, 0)
    const startButton = button('Start', {
      fontSize: '20px',
      color: 'black',
      fontFamily: DEFAULT_FONT,
      width: 150,
      height: 40,
    }) as HTMLElement

    const restartButtonDom = this.add
      .dom(this.scale.width / 2, this.scale.height / 2 + 30, startButton)
      .setOrigin(0.5)
      .addListener('click')
      .on('click', () => {
        this.scene.start('game')
      })
    domElementsContainer.add(restartButtonDom)
  }
}
