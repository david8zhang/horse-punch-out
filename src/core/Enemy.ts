import Game from '~/scenes/Game'
import { Direction } from '~/core/Constants'

export interface EnemyConfig {
  position: {
    x: number
    y: number
  }
}

export class Enemy {
  private static readonly BODY_WIDTH = 100
  private static readonly BODY_HEIGHT = 250
  private static readonly FIST_RADIUS = 40
  private readonly RIGHT_FIST_POSITION: number
  private readonly LEFT_FIST_POSITION: number
  private readonly BODY_POSITION: { x: number; y: number }

  public onPunch: Array<(dir: Direction) => void> = []
  private game: Game
  private body: Phaser.GameObjects.Rectangle
  private rightFist: Phaser.GameObjects.Arc
  private leftFist: Phaser.GameObjects.Arc
  private punchDirection: Direction = Direction.NONE

  constructor(game: Game, config: EnemyConfig) {
    this.game = game
    const { position } = config
    this.BODY_POSITION = position
    this.body = this.game.add.rectangle(
      position.x,
      position.y,
      Enemy.BODY_WIDTH,
      Enemy.BODY_HEIGHT,
      0x11dbac
    )
    this.RIGHT_FIST_POSITION = position.x + this.body.width
    this.rightFist = this.game.add.circle(
      this.RIGHT_FIST_POSITION,
      position.y,
      Enemy.FIST_RADIUS,
      0xff0000
    )
    this.LEFT_FIST_POSITION = position.x - this.body.width
    this.leftFist = this.game.add.circle(
      this.LEFT_FIST_POSITION,
      position.y,
      Enemy.FIST_RADIUS,
      0xff0000
    )
    this.initKeyPressListener()
  }

  initKeyPressListener() {
    // TODO: Make this fire based on a timer
    this.game.input.keyboard.on('keydown', (e) => {
      switch (e.code) {
        case 'ArrowLeft': {
          this.startPunch(Direction.LEFT)
          break
        }
        case 'ArrowRight': {
          this.startPunch(Direction.RIGHT)
          break
        }
      }
    })
  }

  startPunch(direction: Direction) {
    if (this.punchDirection !== Direction.NONE) {
      return
    }
    this.punchDirection = direction
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
      duration: 150,
      yoyo: true,
    })
    this.game.tweens.add({
      targets: [fistToMove],
      y: '+=300',
      x: `+=${bodyPos}`,
      ease: 'Quint.easeIn',
      duration: 150, // this is like an "grace period" (in addition to the wind up) giving players time to react to the punch animation, larger number = more lenient
      onComplete: () => {
        // punch when fist reaches end
        this.punch(direction, fistToMove)
      },
    })
  }

  punch(direction: Direction, fistToMove: Phaser.GameObjects.Arc) {
    // broadcast punch
    this.onPunch.forEach((handler) => handler(direction))
    this.game.tweens.add({
      targets: [fistToMove],
      x:
        fistToMove === this.rightFist
          ? this.RIGHT_FIST_POSITION
          : this.LEFT_FIST_POSITION,
      y: this.BODY_POSITION.y,
      duration: 300,
      ease: 'Quint.easeInOut',
      onComplete: () => {
        this.punchDirection = Direction.NONE
      },
    })
  }
}
