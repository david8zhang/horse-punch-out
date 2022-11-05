import Game from '~/scenes/Game'
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '~/core/Constants'
import { Player } from './Player'

export class Healthbar {
  private scene: Game

  public static LENGTH = 200
  public static WIDTH = 20
  public static MAX_HEALTH = 6
  public static Y_POS = WINDOW_HEIGHT - 30
  public static X_POS = WINDOW_WIDTH - Healthbar.LENGTH - 10

  private bar: Phaser.GameObjects.Graphics
  private player: Player

  constructor(scene: Game, player: Player) {
    this.scene = scene
    this.player = player

    // Draw bar
    this.bar = new Phaser.GameObjects.Graphics(this.scene)
    this.bar.setDepth(1000)
    this.scene.add.existing(this.bar)
    this.setupHealthEvents()
    this.draw()

    this.scene.add
      .text(Healthbar.X_POS - 50, Healthbar.Y_POS, 'HP:', {
        fontSize: '16px',
        fontFamily: 'Daydream',
      })
      .setOrigin(0)
  }

  setupHealthEvents(): void {
    this.player.onDamaged.push(this.handleHealthDecreased.bind(this))
  }

  handleHealthDecreased(): void {
    this.draw()
  }

  draw(): void {
    const percentage = this.player.health / Player.MAX_HEALTH
    const length = Math.max(0, Math.floor(percentage * Healthbar.LENGTH))
    this.bar.fillStyle(0x000000)

    // Draw a black rectangle for healthbar BG
    this.bar.fillRect(
      Healthbar.X_POS,
      Healthbar.Y_POS,
      Healthbar.LENGTH,
      Healthbar.WIDTH
    )

    if (percentage <= 0.33) {
      this.bar.fillStyle(0xff0000)
    } else if (percentage <= 0.67) {
      this.bar.fillStyle(0xf1c40f)
    } else {
      this.bar.fillStyle(0x2ecc71)
    }

    // Draw a colored rectangle to represent health
    this.bar.fillRect(Healthbar.X_POS, Healthbar.Y_POS, length, Healthbar.WIDTH)
  }
}
