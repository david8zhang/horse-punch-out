import Game from '~/scenes/Game'
import { Direction } from '~/core/Constants'
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

  private game: Game
  private body: Phaser.GameObjects.Rectangle
  private rightFist: Phaser.GameObjects.Arc
  private leftFist: Phaser.GameObjects.Arc

  public currDodgeDirection: Direction = Direction.NONE
  public currPunchDirection: Direction = Direction.NONE
  public prevPunchDirection: Direction = Direction.LEFT

  constructor(game: Game, config: PlayerConfig) {
    this.game = game
    const { position } = config
    this.body = this.game.add.rectangle(
      position.x,
      position.y,
      Player.BODY_WIDTH,
      Player.BODY_HEIGHT,
      0xffdbac
    )
    this.rightFist = this.game.add.circle(
      position.x + this.body.width,
      position.y,
      Player.FIST_RADIUS,
      0x00ff00
    )
    this.leftFist = this.game.add.circle(
      position.x - this.body.width,
      position.y,
      Player.FIST_RADIUS,
      0x00ff00
    )
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
          const newPunchDirection =
            this.prevPunchDirection === Direction.LEFT
              ? Direction.RIGHT
              : Direction.LEFT
          this.punch(newPunchDirection)
          break
        }
      }
    })
  }

  dodge(direction: Direction) {
    if (this.currDodgeDirection !== Direction.NONE) {
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
      duration: 250,
      yoyo: true,
    })
    this.game.tweens.add({
      targets: [this.leftFist, this.rightFist],
      x: `+=${fistTranslatePos}`,
      ease: 'Cubic.easeInOut',
      duration: 250,
      yoyo: true,
      onComplete: () => {
        this.currDodgeDirection = Direction.NONE
      },
    })
  }

  punch(direction: Direction) {
    if (this.currPunchDirection !== Direction.NONE) {
      return
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
      duration: 150,
      yoyo: true,
    })
    this.game.tweens.add({
      targets: [fistToMove],
      y: '-=300',
      x: `+=${bodyPos}`,
      duration: 150,
      yoyo: true,
      onComplete: () => {
        this.currPunchDirection = Direction.NONE
      },
    })
  }
}
