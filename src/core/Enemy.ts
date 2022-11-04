import Game from '~/scenes/Game'
import { Direction } from '~/core/Constants'
export interface EnemyConfig {
  position: {
    x: number
    y: number
  }
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

  // renderer
  private game: Game
  private body: Phaser.GameObjects.Rectangle
  private rightFist: Phaser.GameObjects.Arc
  private leftFist: Phaser.GameObjects.Arc

  // state
  private punchDirection: Direction = Direction.NONE
  private punchTimer = 0
  private windUpTimer = 0

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
  }

  windUp(direction: Direction) {
    // Don't wind up a new punch if we're already punching
    if (this.punchDirection !== Direction.NONE) {
      return
    }
    this.punchDirection = direction
    const fistToMove =
      direction === Direction.LEFT ? this.leftFist : this.rightFist
    this.game.tweens.add({
      targets: [fistToMove],
      y: '-= 50',
      ease: 'Quad.easeInOut',
      duration: Enemy.WIND_UP_TIME / 2,
    })
    this.windUpTimer = Enemy.WIND_UP_TIME / 2
  }

  startPunch() {
    // We need to wind up a punch first before starting it
    if (this.punchDirection === Direction.NONE) {
      return
    }
    const fistToMove =
      this.punchDirection === Direction.LEFT ? this.leftFist : this.rightFist
    const bodyAngle = this.punchDirection === Direction.LEFT ? -10 : 10
    const bodyPos = this.punchDirection === Direction.LEFT ? 150 : -150
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
      y: '+=400',
      x: `+=${bodyPos}`,
      ease: 'Quint.easeIn',
      duration: 150, // this is like an "grace period" (in addition to the wind up) giving players time to react to the punch animation, larger number = more lenient
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
      duration: 300, // punch recovery time
      ease: 'Quint.easeInOut',
      onComplete: () => {
        this.punchDirection = Direction.NONE
      },
    })
  }

  update(delta) {
    this.punchTimer -= delta
    if (this.punchTimer <= 0) {
      this.punchTimer = Math.random() * 2500 + 500 // punches are anywhere between 0.5 and 3 seconds
      this.windUp(Math.random() < 0.5 ? Direction.LEFT : Direction.RIGHT)
    }
    // TODO: for now, wind up will just last 500 ms, but later this should be set by beat map
    if (this.windUpTimer > 0) {
      this.windUpTimer -= delta
      if (this.windUpTimer <= 0) {
        this.startPunch()
      }
    }
  }
}
