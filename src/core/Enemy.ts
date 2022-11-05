import Game from '~/scenes/Game'
import { Time } from 'phaser'
import { Direction, SORT_ORDER } from '~/core/Constants'

export interface EnemyConfig {
  position: {
    x: number
    y: number
  }
}

export enum EnemyState {
  IDLE = 'IDLE',
  WINDING_UP = 'WINDING_UP',
  WIND_UP_COMPLETE = 'WIND_UP_COMPLETE',
  PUNCHING = 'PUNCHING',
}

export class Enemy {
  private static readonly WIND_UP_TIME = 1000
  private static readonly BODY_WIDTH = 100
  private static readonly BODY_HEIGHT = 250
  private static readonly FIST_RADIUS = 40
  private readonly RIGHT_FIST_POSITION: number
  private readonly LEFT_FIST_POSITION: number
  private readonly BODY_POSITION: { x: number; y: number }
  public onPunch: Array<(dir: Direction) => void> = []

  // state
  public currState: EnemyState = EnemyState.IDLE
  private punchDirection: Direction = Direction.NONE

  // renderer
  private game: Game
  private body: Phaser.GameObjects.Rectangle
  private rightFist: Phaser.GameObjects.Arc
  private leftFist: Phaser.GameObjects.Arc

  constructor(game: Game, config: EnemyConfig) {
    this.game = game
    const { position } = config
    this.BODY_POSITION = position
    this.body = this.game.add
      .rectangle(
        position.x,
        position.y,
        Enemy.BODY_WIDTH,
        Enemy.BODY_HEIGHT,
        0x11dbac
      )
      .setDepth(SORT_ORDER.body)
    this.RIGHT_FIST_POSITION = position.x + this.body.width
    this.rightFist = this.game.add
      .circle(this.RIGHT_FIST_POSITION, position.y, Enemy.FIST_RADIUS, 0xff0000)
      .setDepth(SORT_ORDER.fist)
    this.LEFT_FIST_POSITION = position.x - this.body.width
    this.leftFist = this.game.add
      .circle(this.LEFT_FIST_POSITION, position.y, Enemy.FIST_RADIUS, 0xff0000)
      .setDepth(SORT_ORDER.fist)
  }

  windUp(direction: Direction) {
    // Don't wind up a new punch if we're already punching
    if (this.currState !== EnemyState.IDLE) {
      return
    }
    this.currState = EnemyState.WINDING_UP
    this.punchDirection = direction
    const fistToMove =
      direction === Direction.LEFT ? this.leftFist : this.rightFist
    this.game.tweens.add({
      targets: [fistToMove],
      y: '-= 50',
      ease: 'Quad.easeInOut',
      duration: 50,
      onComplete: () => {
        this.currState = EnemyState.WIND_UP_COMPLETE
      },
    })
  }

  startPunch() {
    // We need to wind up a punch first before starting it
    if (this.currState != EnemyState.WIND_UP_COMPLETE) {
      return
    }
    this.currState = EnemyState.PUNCHING
    const fistToMove =
      this.punchDirection === Direction.LEFT ? this.leftFist : this.rightFist
    const bodyAngle = this.punchDirection === Direction.LEFT ? -10 : 10
    const bodyPos = this.punchDirection === Direction.LEFT ? 150 : -150
    const punchDuration = 50

    this.game.tweens.add({
      targets: [this.body],
      angle: {
        from: 0,
        to: bodyAngle,
      },
      duration: punchDuration,
      yoyo: true,
    })
    this.game.tweens.add({
      targets: [fistToMove],
      y: '+=400',
      x: `+=${bodyPos}`,
      ease: 'Quint.easeIn',
      duration: punchDuration, // this is like an "grace period" (in addition to the wind up) giving players time to react to the punch animation, larger number = more lenient
      onComplete: () => {
        // punch when fist reaches end
        this.punch()
      },
    })
  }

  punch() {
    const fistToMove =
      this.punchDirection === Direction.LEFT ? this.leftFist : this.rightFist
    // broadcast punch
    this.onPunch.forEach((handler) => handler(this.punchDirection))
    this.game.tweens.add({
      targets: [fistToMove],
      x:
        fistToMove === this.rightFist
          ? this.RIGHT_FIST_POSITION
          : this.LEFT_FIST_POSITION,
      y: this.BODY_POSITION.y,
      duration: 150, // punch recovery time
      ease: 'Quint.easeInOut',
      onComplete: () => {
        this.currState = EnemyState.IDLE
        this.punchDirection = Direction.NONE
      },
    })
  }

  onBeat() {
    if (this.currState === EnemyState.WIND_UP_COMPLETE) {
      this.startPunch()
    } else {
      const randDirection =
        Phaser.Math.Between(0, 1) === 0 ? Direction.LEFT : Direction.RIGHT
      this.windUp(randDirection)
    }
  }
}
