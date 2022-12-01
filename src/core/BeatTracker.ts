import Game, { AttackPhase } from '~/scenes/Game'
import {
  MUSIC_BPM_MAPPING,
  SORT_ORDER,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from './Constants'

// Do something on each beat (with either +/- ms delay)
export interface BeatListenerConfig {
  delay: number
  callback: Function
}

export enum BeatQuality {
  EARLY = 'Early!',
  PERFECT = 'Perfect!',
  LATE = 'Late!',
}

export class BeatTracker {
  private static readonly LATE_THRESHOLD_MS = 40
  private static readonly EARLY_THRESHOLD_DIFF = -5

  private bpm: number
  private game: Game
  private background: Phaser.GameObjects.Rectangle
  private beatEvent!: Phaser.Time.TimerEvent
  private beatTrackerUITweens: Phaser.Tweens.Tween[] = []

  public leftBeatCircle!: Phaser.GameObjects.Arc
  public rightBeatCircle!: Phaser.GameObjects.Arc
  public middleCircle!: Phaser.GameObjects.Arc
  public allCircles: Phaser.GameObjects.Arc[] = []

  public beatListeners: Array<() => void> = []
  public alwaysPerfectBeat: boolean = false
  private lastBeatTimestamp: number = 0

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
      .setFillStyle(
        this.game.currAttackPhase === AttackPhase.PLAYER ? 0x00ff00 : 0xff0000
      )
      .setAlpha(0.25)
      .setDepth(SORT_ORDER.background)
      .setVisible(false)
    this.initBeatAndUI()
  }

  addBeatListener(beatListener: () => void) {
    this.beatListeners.push(beatListener)
  }

  initBeatAndUI() {
    this.createBeatCircles()
    this.createBeatEvent()
  }

  pause() {
    this.hide()
    this.beatEvent.paused = true
    this.beatTrackerUITweens.forEach((tween) => {
      tween.pause()
      tween.restart()
    })
  }

  start() {
    this.show()
    this.beatEvent.paused = false
    this.beatTrackerUITweens.forEach((tween) => {
      tween.resume()
    })
  }

  restart(bpm: number) {
    this.bpm = bpm
    this.beatTrackerUITweens.forEach((tween) => tween.stop())
    this.beatTrackerUITweens = []
    this.allCircles.forEach((circle) => circle.destroy())
    this.allCircles = []
    this.beatEvent.destroy()
    this.initBeatAndUI()
    this.start()
    this.background.setFillStyle(
      this.game.currAttackPhase === AttackPhase.PLAYER ? 0x00ff00 : 0xff0000
    )
  }

  hide() {
    this.allCircles.forEach((circle) => {
      circle.setVisible(false)
    })
  }

  show() {
    this.allCircles.forEach((circle) => {
      circle.setVisible(true)
    })
  }

  handlePhaseSwitch(newAttackPhase: AttackPhase) {
    const circleColor =
      newAttackPhase === AttackPhase.ENEMY ? 0xff0000 : 0x00ff00
    this.allCircles.forEach((circle) => {
      circle.setStrokeStyle(2, circleColor)
    })
    this.middleCircle.setFillStyle(circleColor)
    this.background.setFillStyle(circleColor)
  }

  createBeatEvent() {
    const delayBetweenBeats = 60000 / this.bpm
    this.beatEvent = this.game.time.addEvent({
      delay: delayBetweenBeats,
      callback: () => {
        this.onBeat()
      },
      repeat: -1,
    })
    this.beatEvent.paused = true
  }

  addBeatUITween(
    target: Phaser.GameObjects.Arc,
    tweenDistance: number,
    duration: number,
    fade: boolean = false,
    onRepeat?: Function
  ) {
    const newTween = this.game.tweens.add({
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
    if (fade) {
      target.setAlpha(0)
      this.game.tweens.add({
        targets: [target],
        duration,
        alpha: {
          from: 0,
          to: 1,
        },
        repeat: -1,
      })
    }
    this.beatTrackerUITweens.push(newTween)
    newTween.paused = true
    return newTween
  }

  createCircle(xOffset: number, yOffset: number, color: number) {
    const circle = this.game.add
      .circle(WINDOW_WIDTH / 2 + xOffset, WINDOW_HEIGHT / 2 + yOffset, 10)
      .setDepth(SORT_ORDER.ui)
      .setStrokeStyle(2, color)
    this.allCircles.push(circle)
    return circle
  }

  // Refactor this
  createBeatCircles() {
    const color =
      this.game.currAttackPhase === AttackPhase.PLAYER ? 0x00ff00 : 0xff0000
    this.middleCircle = this.game.add
      .circle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2 + 50, 10, color)
      .setDepth(SORT_ORDER.ui)
      .setAlpha(0)
    this.leftBeatCircle = this.createCircle(-50, 50, color)
    this.rightBeatCircle = this.createCircle(50, 50, color)
    const outerLeftBeatCircle = this.createCircle(-100, 50, color)
    const outerRightBeatCircle = this.createCircle(100, 50, color)

    const delayBetweenBeats = 60000 / this.bpm
    this.addBeatUITween(this.leftBeatCircle, 50, delayBetweenBeats)
    this.addBeatUITween(this.rightBeatCircle, -50, delayBetweenBeats)
    this.addBeatUITween(outerLeftBeatCircle, 50, delayBetweenBeats, true)
    this.addBeatUITween(
      outerRightBeatCircle,
      -50,
      delayBetweenBeats,
      true,
      () => {
        this.middleCircle.setVisible(true).setAlpha(1)
        this.game.tweens.add({
          delay: 50,
          alpha: {
            from: 1,
            to: 0,
          },
          duration: 100,
          targets: [this.middleCircle],
          onComplete: () => {
            this.middleCircle.setVisible(false)
          },
        })
      }
    )
  }

  get beatQuality(): BeatQuality {
    if (this.alwaysPerfectBeat) {
      return BeatQuality.PERFECT
    }

    let currTimestamp = Date.now()
    if (this.middleCircle.visible) {
      // If the middle circle is already visible, beat quality can be perfect or late
      const timeDiff = currTimestamp - this.lastBeatTimestamp
      if (timeDiff > BeatTracker.LATE_THRESHOLD_MS) {
        return BeatQuality.LATE
      } else {
        return BeatQuality.PERFECT
      }
    } else {
      const diff = this.leftBeatCircle.x - this.middleCircle.x
      if (diff < BeatTracker.EARLY_THRESHOLD_DIFF) {
        return BeatQuality.EARLY
      } else {
        return BeatQuality.PERFECT
      }
    }
  }

  get isOnBeat() {
    if (this.alwaysPerfectBeat) {
      return true
    }

    if (this.middleCircle.visible) {
      return true
    } else {
      const diff = this.leftBeatCircle.x - this.middleCircle.x
      return diff > -10
    }
  }

  onBeat() {
    this.lastBeatTimestamp = Date.now()
    this.beatListeners.forEach((fn) => {
      fn()
    })

    if (!this.beatEvent.paused) {
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
}
