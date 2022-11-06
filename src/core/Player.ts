import Game from '~/scenes/Game'
import { Direction } from '~/core/Constants'
import { SORT_ORDER } from './Constants'

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
  public static readonly MAX_HEALTH = 3

  private game: Game
  private body: Phaser.GameObjects.Rectangle
  private rightFist: Phaser.GameObjects.Arc
  private leftFist: Phaser.GameObjects.Arc

  public currDodgeDirection: Direction = Direction.NONE
  public currPunchDirection: Direction = Direction.NONE
  public prevPunchDirection: Direction = Direction.LEFT
  public health: number = Player.MAX_HEALTH

  public onDamaged: Array<() => void> = []

  constructor(game: Game, config: PlayerConfig) {
    this.game = game
    const { position } = config
    this.body = this.game.add
      .rectangle(
        position.x,
        position.y,
        Player.BODY_WIDTH,
        Player.BODY_HEIGHT,
        0xffdbac
      )
      .setDepth(SORT_ORDER.body)
    this.rightFist = this.game.add
      .circle(
        position.x + this.body.width,
        position.y,
        Player.FIST_RADIUS,
        0x00ff00
      )
      .setDepth(SORT_ORDER.fist)
    this.leftFist = this.game.add
      .circle(
        position.x - this.body.width,
        position.y,
        Player.FIST_RADIUS,
        0x00ff00
      )
      .setDepth(SORT_ORDER.fist)
    this.initKeyPressListener()
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
    let bodyAngle = 0
    let bodyTranslatePos = 0
    let fistTranslatePos = 0
    if (direction === Direction.RIGHT) {
      bodyAngle = 60
      bodyTranslatePos = 50
      fistTranslatePos = 100
    } else if (direction === Direction.LEFT) {
      bodyAngle = -60
      bodyTranslatePos = -50
      fistTranslatePos = -100
    }
    this.game.tweens.add({
      targets: [this.body],
      angle: {
        from: 0,
        to: bodyAngle,
      },
      y: `+=${Math.abs(bodyTranslatePos)}`,
      x: `+=${bodyTranslatePos}`,
      ease: 'Cubic',
      duration: 200,
      yoyo: true,
    })
    this.game.tweens.add({
      targets: [this.leftFist, this.rightFist],
      x: `+=${fistTranslatePos}`,
      ease: 'Cubic.easeInOut',
      duration: 200,
      yoyo: true,
      onComplete: () => {
        this.currDodgeDirection = Direction.NONE
      },
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
      this.game.cameras.main.shake(150, 0.005)
      // TODO: put this logic in "game" or somewhere else
      this.game.enemy.damage()
    } else {
      // if the player misses an input, then attack phase goes back to the enemy
      this.game.onPlayerInputMiss()
    }

    this.prevPunchDirection = direction
    this.currPunchDirection = direction
    const fistToMove =
      direction === Direction.LEFT ? this.leftFist : this.rightFist
    const bodyAngle = direction === Direction.LEFT ? 10 : -10
    const bodyPos = direction === Direction.LEFT ? 50 : -50
    this.game.tweens.add({
      targets: [this.body],
      angle: {
        from: 0,
        to: bodyAngle,
      },
      duration: 100,
      yoyo: true,
    })
    this.game.tweens.add({
      targets: [fistToMove],
      y: '-=300',
      x: `+=${bodyPos}`,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        this.currPunchDirection = Direction.NONE
      },
    })
  }

  damage() {
    this.health--
    this.onDamaged.forEach((handler) => handler())
  }
}
