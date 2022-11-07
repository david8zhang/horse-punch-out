import Game from '~/scenes/Game'
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '~/core/Constants'
import { Player } from './Player'

export interface HealthbarConfig {
  maxHealth: number
  position: {
    x: number
    y: number
  }
}
export class Healthbar {
  private scene: Game

  public static LENGTH = 200
  public static WIDTH = 20

  private bar: Phaser.GameObjects.Graphics
  private entity: { health: number }
  private config: HealthbarConfig

  constructor(
    scene: Game,
    config: HealthbarConfig,
    entity: { health: number },
    onHealthChanged: Array<() => void>
  ) {
    this.scene = scene
    this.entity = entity
    this.config = config

    // Draw bar
    this.bar = new Phaser.GameObjects.Graphics(this.scene)
    this.bar.setDepth(1000)
    this.scene.add.existing(this.bar)
    onHealthChanged.push(this.handleHealthDecreased.bind(this))
    this.draw()

    this.scene.add
      .text(config.position.x - 40, config.position.y, 'HP:', {
        fontSize: '16px',
        fontFamily: 'Daydream',
      })
      .setOrigin(0)
  }

  handleHealthDecreased(): void {
    this.draw()
  }

  draw(): void {
    const percentage = this.entity.health / this.config.maxHealth
    const length = Math.max(0, Math.floor(percentage * Healthbar.LENGTH))
    this.bar.fillStyle(0x333333)

    // Draw a black rectangle for healthbar BG
    this.bar.fillRect(
      this.config.position.x,
      this.config.position.y,
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
    this.bar.fillRect(
      this.config.position.x,
      this.config.position.y,
      length,
      Healthbar.WIDTH
    )
  }
}
