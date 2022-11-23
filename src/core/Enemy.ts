import Game from '~/scenes/Game'
import { Direction, SORT_ORDER } from '~/core/Constants'
import { Healthbar } from './Healthbar'

export interface EnemyConfig {
  position: {
    x: number
    y: number
  }
}

export enum EnemyArmState {
  IDLE = 'IDLE',
  WINDING_UP = 'WINDING_UP',
  WIND_UP_COMPLETE = 'WIND_UP_COMPLETE',
  PUNCHING = 'PUNCHING',
}

export enum EnemyAction {
  PASS = 'PASS',
  PUNCH = 'PUNCH',
  WIND_UP = 'WIND_UP',
}

export class Enemy {
  private static readonly BODY_WIDTH = 100
  private static readonly BODY_HEIGHT = 250
  private static readonly FIST_RADIUS = 40
  private static readonly PUNCH_DURATION = 50
  public static readonly MAX_HEALTH = 500

  private readonly RIGHT_FIST_POSITION: number
  private readonly LEFT_FIST_POSITION: number
  private readonly BODY_POSITION: { x: number; y: number }
  public onPunch: Array<(dir: Direction) => void> = []
  public onDied: Array<() => void> = []

  // state
  public currLeftState: EnemyArmState = EnemyArmState.IDLE
  public currRightState: EnemyArmState = EnemyArmState.IDLE

  // renderer
  private game: Game
  private body: Phaser.GameObjects.Rectangle
  private rightFist: Phaser.GameObjects.Arc
  private leftFist: Phaser.GameObjects.Arc

  // Health
  public maxHealth: number = Enemy.MAX_HEALTH
  public health: number = this.maxHealth
  public onHealthChanged: Array<() => void> = []
  public healthBar!: Healthbar

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
    this.setupHealthBar()
  }

  setupHealthBar() {
    this.healthBar = new Healthbar(
      this.game,
      {
        position: {
          x: 10,
          y: 10,
        },
      },
      this
    )
    this.onHealthChanged.push(() => {
      this.healthBar.draw()
    })
  }

  setState(direction: Direction, newState: EnemyArmState) {
    if (direction === Direction.LEFT) {
      this.currLeftState = newState
    } else {
      this.currRightState = newState
    }
  }

  getState(direction: Direction) {
    return direction === Direction.LEFT
      ? this.currLeftState
      : this.currRightState
  }

  windUp(direction: Direction) {
    const currState = this.getState(direction)
    // Don't wind up a new punch if we're already punching
    if (currState !== EnemyArmState.IDLE) {
      return
    }
    this.setState(direction, EnemyArmState.WINDING_UP)
    const fistToMove =
      direction === Direction.LEFT ? this.leftFist : this.rightFist
    this.game.tweens.add({
      targets: [fistToMove],
      y: '-= 50',
      ease: 'Quad.easeInOut',
      duration: 50,
      onComplete: () => {
        this.setState(direction, EnemyArmState.WIND_UP_COMPLETE)
      },
    })
  }

  startPunch(direction: Direction) {
    const currState = this.getState(direction)
    // We need to wind up a punch first before starting it
    if (currState != EnemyArmState.WIND_UP_COMPLETE) {
      return
    }
    this.setState(direction, EnemyArmState.PUNCHING)
    const fistToMove =
      direction === Direction.LEFT ? this.leftFist : this.rightFist
    const bodyAngle = direction === Direction.LEFT ? -10 : 10
    const bodyPos = direction === Direction.LEFT ? 150 : -150

    this.game.tweens.add({
      targets: [this.body],
      angle: {
        from: 0,
        to: bodyAngle,
      },
      duration: Enemy.PUNCH_DURATION,
      yoyo: true,
    })
    this.game.tweens.add({
      targets: [fistToMove],
      y: '+=400',
      x: `+=${bodyPos}`,
      ease: 'Quint.easeIn',
      duration: Enemy.PUNCH_DURATION, // this is like an "grace period" (in addition to the wind up) giving players time to react to the punch animation, larger number = more lenient
      onComplete: () => {
        // punch when fist reaches end
        this.punch(direction)
      },
    })
  }

  punch(direction: Direction) {
    const fistToMove =
      direction === Direction.LEFT ? this.leftFist : this.rightFist
    // broadcast punch
    this.onPunch.forEach((handler) => handler(direction))
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
        this.setState(direction, EnemyArmState.IDLE)
      },
    })
  }

  public get isWindingUp() {
    return (
      this.currLeftState === EnemyArmState.WIND_UP_COMPLETE ||
      this.currRightState === EnemyArmState.WIND_UP_COMPLETE
    )
  }

  getPossibleActionForState(
    direction: Direction,
    isLastAttack: boolean
  ): EnemyAction {
    const state =
      direction === Direction.LEFT ? this.currLeftState : this.currRightState
    const otherState =
      direction === Direction.LEFT ? this.currRightState : this.currLeftState
    if (isLastAttack) {
      switch (state) {
        case EnemyArmState.WIND_UP_COMPLETE: {
          return EnemyAction.PUNCH
        }
        default:
          return EnemyAction.PASS
      }
    }
    switch (state) {
      case EnemyArmState.WIND_UP_COMPLETE: {
        return EnemyAction.PUNCH
      }
      case EnemyArmState.IDLE: {
        if (otherState === EnemyArmState.WINDING_UP) {
          return EnemyAction.PASS
        }
        const possibleActions = [EnemyAction.WIND_UP, EnemyAction.PASS]
        return possibleActions[
          Phaser.Math.Between(0, possibleActions.length - 1)
        ]
      }
      default:
        return EnemyAction.PASS
    }
  }

  handleAction(action: EnemyAction, direction: Direction) {
    switch (action) {
      case EnemyAction.PUNCH: {
        this.startPunch(direction)
        break
      }
      case EnemyAction.WIND_UP: {
        this.windUp(direction)
        break
      }
      default:
        break
    }
  }

  onBeat(isLastAttack: boolean) {
    const leftAction = this.getPossibleActionForState(
      Direction.LEFT,
      isLastAttack
    )
    this.handleAction(leftAction, Direction.LEFT)
    const rightAction = this.getPossibleActionForState(
      Direction.RIGHT,
      isLastAttack
    )
    this.handleAction(rightAction, Direction.RIGHT)
  }

  damage(damageAmt: number) {
    this.health -= damageAmt
    this.onHealthChanged.forEach((handler) => handler())
    if (this.health <= 0) {
      this.onDied.forEach((handler) => handler())
    }
  }

  reset() {
    this.health = this.maxHealth
    this.onHealthChanged.forEach((handler) => handler())
  }

  setMaxHealth(maxHealth: number) {
    this.maxHealth = maxHealth
  }
}
