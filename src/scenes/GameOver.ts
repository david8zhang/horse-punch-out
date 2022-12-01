import Phaser from 'phaser'
import { button } from '~/ui/Button'
import { DEFAULT_FONT, WINDOW_HEIGHT, WINDOW_WIDTH } from '~/core/constants'
import { YouTubePlayer } from 'youtube-player/dist/types'

export default class GameOver extends Phaser.Scene {
  private score = 0
  public youtubePlayer!: YouTubePlayer

  constructor() {
    super('gameover')
  }

  init(data): void {
    if (data.score) {
      this.score = data.score
    }
    if (data.youtubePlayer) {
      this.youtubePlayer = data.youtubePlayer
    }
  }

  create(): void {
    this.cameras.main.fadeIn(2000, 1, 1, 1)
    const bg = this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 'gameover')
    const domElementsContainer = this.add.container(0, 0)
    const restartButton = button('Play Again', {
      fontSize: '20px',
      fontFamily: DEFAULT_FONT,
      color: 'black',
      width: 150,
      height: 40,
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: 'black',
      borderRadius: '10px',
      cursor: 'pointer',
    }) as HTMLElement

    const restartButtonDom = this.add
      .dom(this.scale.width / 2, this.scale.height / 2, restartButton)
      .setOrigin(0.5)
      .addListener('click')
      .on('click', () => {
        const gameScene = this.scene.get('game')
        gameScene.registry.destroy()
        gameScene.scene.restart()
        gameScene.sound.removeAll()
        this.scene.start('game', {
          youtubePlayer: this.youtubePlayer,
          skipTutorial: true,
        })
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
