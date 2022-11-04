import Phaser from 'phaser'
import { Direction, WINDOW_HEIGHT, WINDOW_WIDTH } from '~/core/Constants'
import { Enemy } from '~/core/Enemy'
import { Player } from '~/core/Player'

export default class Game extends Phaser.Scene {
  public player!: Player
  public enemy!: Enemy

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
    this.enemy = new Enemy(this, {
      position: {
        x: WINDOW_WIDTH / 2,
        y: WINDOW_HEIGHT - 400,
      },
    })
    this.enemy.onPunch.push((punchDirection: Direction) => {
      // TODO: put this logic somewhere else
      if (this.player.currDodgeDirection == punchDirection) {
        // player successfully dodged
        console.log('damn, you doged it')
      } else {
        // got punched
        console.log('u got punched')
      }
    })
  }
}
