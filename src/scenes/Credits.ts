import { YouTubePlayer } from 'youtube-player/dist/types'
import {
  DEFAULT_FONT,
  SORT_ORDER,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from '~/core/Constants'

export class Credits extends Phaser.Scene {
  public youtubePlayer!: YouTubePlayer
  private static CREDIT_SECTIONS = {
    PROGRAMMING: ['DoctorMuskrat', 'zed_studios'],
    ART: ['stripedpants'],
    MUSIC: [
      'ghostr.ca',
      'Shalone Cason',
      'Ron Gelinas Chillout Lounge',
      'boolMax',
      'SOLETRAIT Music',
      'DJ Ajax',
    ],
  }

  public thanksText!: Phaser.GameObjects.Text
  public creditsText!: Phaser.GameObjects.Text

  constructor() {
    super('credits')
  }

  init(data) {
    if (data.youtubePlayer) {
      this.youtubePlayer = data.youtubePlayer
    }
  }

  create() {
    const titleText = this.add
      .text(WINDOW_WIDTH / 2, 25, 'You Won!', {
        fontFamily: DEFAULT_FONT,
        fontSize: '50px',
        color: 'white',
      })
      .setDepth(SORT_ORDER.top)
    titleText.setPosition(titleText.x - titleText.displayWidth / 2, titleText.y)
    this.thanksText = this.add.text(
      WINDOW_WIDTH / 2,
      titleText.y + titleText.displayHeight + 20,
      'Thanks for Playing!',
      {
        fontFamily: DEFAULT_FONT,
        fontSize: '30px',
        color: 'white',
      }
    )
    this.thanksText.setPosition(
      this.thanksText.x - this.thanksText.displayWidth / 2,
      this.thanksText.y
    )

    const tryFreestyle = this.add
      .text(
        WINDOW_WIDTH / 2,
        WINDOW_HEIGHT / 2,
        'Try playing with custom songs in Freestyle mode!',
        {
          fontFamily: DEFAULT_FONT,
          fontSize: '30px',
        }
      )
      .setAlpha(0)
      .setWordWrapWidth(WINDOW_WIDTH - 50)
      .setAlign('center')
    tryFreestyle.setPosition(
      tryFreestyle.x - tryFreestyle.displayWidth / 2,
      tryFreestyle.y
    )
    this.tweenCreditSections(0, () => {
      this.tweens.add({
        targets: [tryFreestyle],
        alpha: {
          from: 0,
          to: 1,
        },
        completeDelay: 2000,
        onComplete: () => {
          this.youtubePlayer.stopVideo()
          this.scene.start('start', {
            youtubePlayer: this.youtubePlayer,
          })
        },
      })
    })
  }

  tweenCreditSections(currIndex: number, onComplete: Function) {
    if (currIndex === Object.keys(Credits.CREDIT_SECTIONS).length) {
      onComplete()
      return
    } else {
      const keys = Object.keys(Credits.CREDIT_SECTIONS)
      const container = this.renderSection(keys[currIndex])
      this.tweens.add({
        targets: [container],
        delay: 100,
        duration: 500,
        hold: 2500,
        alpha: {
          from: 0,
          to: 1,
        },
        yoyo: true,
        onComplete: () => {
          container.destroy()
          this.tweenCreditSections(currIndex + 1, onComplete)
        },
      })
    }
  }

  renderSection(key: string) {
    const container = this.add.container()
    container.setAlpha(0)
    const sectionTitle = this.add
      .text(
        WINDOW_WIDTH / 2,
        this.thanksText.y + this.thanksText.displayHeight + 75,
        key,
        {
          fontFamily: DEFAULT_FONT,
          fontSize: '35px',
        }
      )
      .setStroke('#ffffff', 2)
    let y = sectionTitle.y + sectionTitle.displayHeight + 20
    Credits.CREDIT_SECTIONS[key].forEach((name) => {
      const text = this.add.text(WINDOW_WIDTH / 2, y, name, {
        fontFamily: DEFAULT_FONT,
        fontSize: '25px',
        color: 'white',
      })
      text.setPosition(text.x - text.displayWidth / 2, text.y)
      y += text.displayHeight + 20
      container.add(text)
    })

    sectionTitle.setPosition(
      WINDOW_WIDTH / 2 - sectionTitle.displayWidth / 2,
      sectionTitle.y
    )
    container.add(sectionTitle)
    return container
  }
}
