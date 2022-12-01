import Game from '~/scenes/Game'
import { Direction, SORT_ORDER } from '~/core/Constants'
import { Healthbar } from './Healthbar'
import { RIGHT } from 'phaser'

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
  public static readonly MAX_HEALTH = 500

  private readonly BODY_POSITION: { x: number; y: number }
  public onPunch: Array<(dir: Direction) => void> = []
  public onDied: Array<() => void> = []

  // state
  public currLeftState: EnemyArmState = EnemyArmState.IDLE
  public currRightState: EnemyArmState = EnemyArmState.IDLE

  // renderer
  private game: Game
  private sprite: Phaser.GameObjects.Sprite

  // Health
  public maxHealth: number = Enemy.MAX_HEALTH
  public health: number = this.maxHealth
  public onHealthChanged: Array<() => void> = []
  public healthBar!: Healthbar

  constructor(game: Game, config: EnemyConfig) {
    this.game = game
    const { position } = config
    this.BODY_POSITION = position
    this.setupHealthBar()
    this.sprite = this.game.add.sprite(position.x, position.y, 'enemy-idle')
    this.sprite.setScale(0.75)
    this.sprite.setDepth(SORT_ORDER.enemy)
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

    const duration = 60000 / this.game.bpm / 2

    const otherState = this.getState(
      direction === Direction.LEFT ? Direction.RIGHT : Direction.LEFT
    )
    if (otherState !== EnemyArmState.PUNCHING) {
      this.sprite.setTexture(`enemy-windup-${direction.toLowerCase()}`)
      this.game.tweens.add({
        targets: [this.sprite],
        y: '-=10',
        duration: duration,
        onComplete: () => {
          this.setState(direction, EnemyArmState.WIND_UP_COMPLETE)
        },
      })
    }
    this.setState(direction, EnemyArmState.WINDING_UP)
    this.game.time.delayedCall(duration, () => {
      this.setState(direction, EnemyArmState.WIND_UP_COMPLETE)
    })
  }

  startPunch(direction: Direction) {
    const currState = this.getState(direction)
    // We need to wind up a punch first before starting it
    if (currState != EnemyArmState.WIND_UP_COMPLETE) {
      return
    }

    const duration = 60000 / this.game.bpm / 3
    this.setState(direction, EnemyArmState.PUNCHING)
    this.game.time.delayedCall(duration, () => {
      this.punch(direction)
    })
    const bodyPos = direction === Direction.LEFT ? 90 : -90
    this.sprite.setTexture(`enemy-punch-${direction.toLowerCase()}`)
    this.game.tweens.add({
      targets: [this.sprite],
      x: `+=${bodyPos}`,
      y: '+=100',
      duration: duration,
      ease: 'Quint.easeOut',
      onComplete: () => {
        this.punch(direction)
      },
    })
  }

  punch(direction: Direction) {
    const duration = 60000 / this.game.bpm / 2
    // broadcast punch
    this.onPunch.forEach((handler) => handler(direction))

    const otherState = this.getState(
      direction === Direction.LEFT ? Direction.RIGHT : Direction.LEFT
    )
    if (otherState === EnemyArmState.WINDING_UP) {
      this.sprite.setTexture(`enemy-punch-windup-${direction.toLowerCase()}`)
    } else {
      this.sprite.setTexture(`enemy-punch-${direction.toLowerCase()}`)
    }
    setTimeout(() => {
      this.setState(direction, EnemyArmState.IDLE)
      this.sprite.setTexture('enemy-idle')
    }, duration)

    this.game.tweens.add({
      targets: [this.sprite],
      x: this.BODY_POSITION.x,
      y: this.BODY_POSITION.y,
      ease: 'Quint.easeIn',
      duration: duration,
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

  takeDamage(damageAmt: number, playerPunchDirection: Direction) {
    this.health -= damageAmt
    const hitDirection =
      playerPunchDirection == Direction.LEFT ? 'right' : 'left'
    const texture = `enemy-hit-${hitDirection}`
    this.sprite.setTexture(texture)
    const delay = this.health > 0 ? 60000 / (this.game.bpm * 4) : 5000
    this.game.tweens.add({
      targets: [this.sprite],
      y: `-=${this.health > 0 ? 15 : 30}`,
      yoyo: this.health > 0,
      duration: delay,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        if (this.health > 0) {
          this.sprite.setTexture('enemy-idle')
        }
      },
    })

    this.onHealthChanged.forEach((handler) => handler())
    if (this.health <= 0) {
      this.onDied.forEach((handler) => handler())
    }
  }

  reset() {
    this.sprite.setPosition(this.BODY_POSITION.x, this.BODY_POSITION.y)
    this.sprite.setTexture('enemy-idle')
    this.health = this.maxHealth
    this.onHealthChanged.forEach((handler) => handler())
  }

  setMaxHealth(maxHealth: number) {
    this.maxHealth = maxHealth
  }
}
