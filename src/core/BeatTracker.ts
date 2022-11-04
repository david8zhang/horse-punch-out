import Game from '~/scenes/Game'
import { SORT_ORDER, WINDOW_HEIGHT, WINDOW_WIDTH } from './Constants'

// Do something on each beat (with either +/- ms delay)
export interface BeatListenerConfig {
  delay: number
  callback: Function
}

export class BeatTracker {
  private bpm: number = 100
  private game: Game
  private background: Phaser.GameObjects.Rectangle

  public leftBeatCircle!: Phaser.GameObjects.Arc
  public rightBeatCircle!: Phaser.GameObjects.Arc
  public middleCircle!: Phaser.GameObjects.Arc

  public beatListeners: Array<() => void> = []

  constructor(game: Game, bpm: number) {
    this.game = game
    this.bpm = bpm
    this.background = this.game.add
      .rectangle(
        WINDOW_WIDTH / 2,
        WINDOW_HEIGHT / 2,
        WINDOW_WIDTH,
        WINDOW_HEIGHT
      )
      .setFillStyle(0xff0000)
      .setAlpha(0.25)
      .setDepth(SORT_ORDER.background)
      .setVisible(false)
  }

  addBeatListener(beatListener: () => void) {
    this.beatListeners.push(beatListener)
  }

  start() {
    this.createBeatCircles()
    this.createBeatEvent()
  }

  createBeatEvent() {
    const delayBetweenBeats = 60000 / this.bpm
    this.game.time.addEvent({
      delay: delayBetweenBeats,
      callback: () => {
        this.onBeat()
      },
      repeat: -1,
    })
  }

  tweenBeatUI(
    target: Phaser.GameObjects.Arc,
    tweenDistance: number,
    duration: number,
    onRepeat?: Function
  ) {
    this.game.tweens.add({
      targets: [target],
      x: `+=${tweenDistance}`,
      duration,
      repeat: -1,
      onRepeat: () => {
        if (onRepeat) {
          onRepeat()
        }
      },
    })
  }

  createBeatCircles() {
    const midCircle = this.game.add
      .circle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2 + 50, 10, 0xff0000)
      .setDepth(SORT_ORDER.ui)
      .setAlpha(0)
    const innerLeftBeatCircle = this.game.add
      .circle(WINDOW_WIDTH / 2 - 50, WINDOW_HEIGHT / 2 + 50, 10)
      .setStrokeStyle(2, 0xff0000)
      .setDepth(SORT_ORDER.ui)
    const outerLeftBeatCircle = this.game.add
      .circle(WINDOW_WIDTH / 2 - 100, WINDOW_HEIGHT / 2 + 50, 10)
      .setStrokeStyle(2, 0xff0000)
    const innerRightBeatCircle = this.game.add
      .circle(WINDOW_WIDTH / 2 + 50, WINDOW_HEIGHT / 2 + 50, 10)
      .setStrokeStyle(2, 0xff0000)
      .setDepth(SORT_ORDER.ui)
    const outerRightBeatCircle = this.game.add
      .circle(WINDOW_WIDTH / 2 + 100, WINDOW_HEIGHT / 2 + 50, 10)
      .setStrokeStyle(2, 0xff0000)
      .setDepth(SORT_ORDER.ui)

    const delayBetweenBeats = 60000 / this.bpm
    this.tweenBeatUI(innerLeftBeatCircle, 50, delayBetweenBeats)
    this.tweenBeatUI(outerLeftBeatCircle, 50, delayBetweenBeats)
    this.tweenBeatUI(innerRightBeatCircle, -50, delayBetweenBeats)
    this.tweenBeatUI(outerRightBeatCircle, -50, delayBetweenBeats, () => {
      midCircle.setVisible(true).setAlpha(1)
      this.game.tweens.add({
        delay: 50,
        alpha: {
          from: 1,
          to: 0,
        },
        duration: 100,
        targets: [midCircle],
        onComplete: () => {
          midCircle.setVisible(false)
        },
      })
    })
  }

  get isOnBeat() {
    return (
      Math.round(Math.abs(this.leftBeatCircle.x - this.middleCircle.x)) < 20 ||
      this.middleCircle.visible
    )
  }

  onBeat() {
    this.beatListeners.forEach((fn) => {
      fn()
    })

    const delayBetweenBeats = 60000 / this.bpm - 100
    // Decrease the accuracy by 1 every 20ms
    this.game.tweens.add({
      targets: [this.background],
      duration: delayBetweenBeats,
      onStart: () => {
        this.background.setVisible(true)
      },
      alpha: {
        from: 0.25,
        to: 0,
      },
      onComplete: () => {
        this.background.setVisible(false)
        this.background.setAlpha(0.5)
      },
    })
  }
}
