import { YouTubePlayer } from 'youtube-player/dist/types'
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '~/core/Constants'

export class Cutscene extends Phaser.Scene {
  public youtubePlayer: YouTubePlayer | null = null

  constructor() {
    super('cutscene')
  }

  init(data) {
    if (data.youtubePlayer) {
      this.youtubePlayer = data.youtubePlayer
    }
  }

  create() {
    const img1 = 'cutscene-1'
    const img2 = 'cutscene-2'
    const img3 = 'cutscene-3'
    const img4 = 'cutscene-4'

    this.input.keyboard.on('keydown', (e) => {
      if (e.code === 'Space') {
        this.scene.start('game', {
          skipTutorial: true,
          youtubePlayer: this.youtubePlayer,
        })
      }
    })

    const bgImage = this.add
      .image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, img1)
      .setAlpha(0)
    const skipText = this.add.text(WINDOW_WIDTH, WINDOW_HEIGHT, 'Skip', {
      fontSize: '20px',
      fontFamily: 'VCR',
    })
    skipText.setPosition(WINDOW_WIDTH - skipText.displayWidth - 20, 35)
    const spaceKey = this.add.image(skipText.x, 20, 'tutorial-prompt-keySpace')
    spaceKey.setPosition(skipText.x - skipText.displayWidth - 20, 40)
    this.tweens.add({
      targets: bgImage,
      alpha: {
        from: 0,
        to: 1,
      },
      yoyo: true,
      duration: 1000,
      hold: 3000,
      onStart: () => {
        bgImage.setTexture(img1)
      },
      onComplete: () => {
        this.tweens.add({
          targets: bgImage,
          delay: 500,
          alpha: {
            from: 0,
            to: 1,
          },
          yoyo: true,
          duration: 1000,
          hold: 3000,
          onStart: () => {
            bgImage.setTexture(img2)
          },
          onComplete: () => {
            this.tweens.add({
              targets: bgImage,
              delay: 500,
              alpha: {
                from: 0,
                to: 1,
              },
              duration: 1000,
              hold: 3000,
              yoyo: true,
              onStart: () => {
                bgImage.setTexture(img3)
              },
              onComplete: () => {
                this.tweens.add({
                  targets: bgImage,
                  delay: 500,
                  alpha: {
                    from: 0,
                    to: 1,
                  },
                  duration: 1000,
                  hold: 3000,
                  yoyo: true,
                  onStart: () => {
                    bgImage.setTexture(img4)
                  },
                  onComplete: () => {
                    this.scene.start('game', {
                      youtubePlayer: this.youtubePlayer,
                    })
                  },
                })
              },
            })
          },
        })
      },
    })
  }
}
