import Game from '~/scenes/Game'
import {
  Direction,
  ENEMY_DAMAGE,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from '~/core/Constants'
import { SORT_ORDER } from './Constants'
import { Healthbar } from './Healthbar'

export interface PlayerConfig {
  position: {
    x: number
    y: number
  }
}

export class Player {
  private static readonly BODY_WIDTH = 100
  private static readonly BODY_HEIGHT = 250
  private static readonly FIST_RADIUS = 40
  public static readonly MAX_HEALTH = 500

  private game: Game
  private sprite: Phaser.GameObjects.Sprite

  public currDodgeDirection: Direction = Direction.NONE
  public currPunchDirection: Direction = Direction.NONE
  public prevPunchDirection: Direction = Direction.LEFT

  // TODO: change to readonly (define a getter, no setter)
  public maxHealth: number = Player.MAX_HEALTH
  public health: number = this.maxHealth
  public healthBar!: Healthbar

  public onDamaged: Array<() => void> = []
  public onDied: Array<() => void> = []

  constructor(game: Game, config: PlayerConfig) {
    this.game = game
    const { position } = config
    this.sprite = game.add.sprite(position.x, position.y, 'player-windup-left')
    this.sprite.setScale(0.5)
    this.sprite.setDepth(SORT_ORDER.player)

    this.initKeyPressListener()
    this.setupHealthbar()
  }

  setupHealthbar() {
    this.healthBar = new Healthbar(
      this.game,
      {
        position: {
          x: WINDOW_WIDTH - Healthbar.LENGTH - 40,
          y: WINDOW_HEIGHT - 30,
        },
      },
      this
    )
    this.onDamaged.push(() => {
      this.healthBar.draw()
    })
  }

  initKeyPressListener() {
    this.game.input.keyboard.on('keydown', (e) => {
      switch (e.code) {
        case 'KeyA': {
          this.dodge(Direction.LEFT)
          break
        }
        case 'KeyD': {
          this.dodge(Direction.RIGHT)
          break
        }
        case 'Space': {
          if (this.game.canPlayerAttack()) {
            const newPunchDirection =
              this.prevPunchDirection === Direction.LEFT
                ? Direction.RIGHT
                : Direction.LEFT
            this.punch(newPunchDirection)
          }

          break
        }
      }
    })
  }

  dodge(direction: Direction) {
    if (
      this.currDodgeDirection !== Direction.NONE ||
      this.currPunchDirection !== Direction.NONE
    ) {
      return
    }
    this.currDodgeDirection = direction
    let bodyTranslatePos = 0
    if (direction === Direction.RIGHT) {
      bodyTranslatePos = 80
    } else if (direction === Direction.LEFT) {
      bodyTranslatePos = -80
    }
    const duration = 60000 / this.game.bpm / 2
    this.playAnimation(
      `player-dodge-${direction === Direction.LEFT ? 'left' : 'right'}`,
      duration,
      () => (this.currDodgeDirection = Direction.NONE)
    )
    this.game.tweens.add({
      targets: [this.sprite],
      y: `+=${Math.abs(bodyTranslatePos / 2)}`,
      x: `+=${bodyTranslatePos}`,
      ease: 'Cubic',
      duration: duration / 2,
      yoyo: true,
    })
  }

  punch(direction: Direction) {
    if (
      this.currPunchDirection !== Direction.NONE ||
      this.currDodgeDirection !== Direction.NONE
    ) {
      return
    }

    if (this.game.beatTracker.isOnBeat) {
      const beatQuality = this.game.beatTracker.beatQuality
      this.game.handlePlayerAttack(beatQuality)
    } else {
      // if the player misses an input, then attack phase goes back to the enemy
      this.game.onPlayerInputMiss()
    }
    this.prevPunchDirection = direction
    this.currPunchDirection = direction
    const duration = 60000 / this.game.bpm / 2
    this.playAnimation(
      `player-punch-${direction === Direction.LEFT ? 'left' : 'right'}`,
      duration,
      () => (this.currPunchDirection = Direction.NONE)
    )
    this.game.tweens.add({
      targets: [this.sprite],
      ease: 'Cubic.easeOut',
      y: `-=${10}`,
      duration: duration / 2,
      yoyo: true,
    })
  }

  handleEnemyPunch(punchDirection: Direction) {
    if (this.currDodgeDirection == punchDirection) {
      // player successfully dodged
    } else {
      const duration = 60000 / this.game.bpm / 2
      this.playAnimation(
        `player-hit-${punchDirection === Direction.LEFT ? 'right' : 'left'}`,
        duration
      )
      this.damage(ENEMY_DAMAGE)
      this.game.cameras.main.shake(150, 0.005)
    }
  }

  damage(damageAmt: number) {
    this.health -= damageAmt
    this.onDamaged.forEach((handler) => handler())
    if (this.health <= 0) {
      this.onDied.forEach((handler) => handler())
    }
  }

  playAnimation(
    animationName: string,
    duration: number,
    onAnimationFinished?: () => void
  ) {
    this.sprite.setTexture(animationName)
    // reset to idle pose
    setTimeout(() => {
      this.sprite.setTexture(
        `player-windup-${Math.random() > 0.5 ? 'right' : 'left'}`
      )
      this.currPunchDirection = Direction.NONE
      onAnimationFinished?.()
    }, duration)
  }
}
