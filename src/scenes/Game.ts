import Phaser from 'phaser'
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '~/core/Constants'
import { Player } from '~/core/Player'

export default class Game extends Phaser.Scene {
  public player!: Player

  constructor() {
    super('game')
  }

  create() {
    this.player = new Player(this, {
      position: {
        x: WINDOW_WIDTH / 2,
        y: WINDOW_HEIGHT - 50,
      },
    })
  }
}
