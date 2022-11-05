import Phaser from 'phaser'
import {
  Direction,
  SORT_ORDER,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from '~/core/Constants'
import { Enemy, EnemyState } from '~/core/Enemy'
import { BeatTracker } from '~/core/BeatTracker'
import { Player } from '~/core/Player'
import { Healthbar } from '~/core/Healthbar'

export enum AttackPhase {
  PLAYER,
  ENEMY,
}

export default class Game extends Phaser.Scene {
  public player!: Player
  public enemy!: Enemy
  public beatTracker!: BeatTracker
  public currAttackPhase: AttackPhase = AttackPhase.PLAYER

  public bpm = 100

  // track number of enemy attacks before player can attack
  public numEnemyActionsBeforeSwitch: number = Phaser.Math.Between(5, 10)
  public currEnemyActions: number = -3 // Start it at negative to give player time to adjust

  // track number of player attacks before enemy can attack
  public numPlayerActionsBeforeSwitch: number = 10
  public currPlayerActions: number = -3

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
    this.beatTracker = new BeatTracker(this, this.bpm)
    this.enemy = new Enemy(this, {
      position: {
        x: WINDOW_WIDTH / 2,
        y: WINDOW_HEIGHT - 400,
      },
    })
    this.enemy.onPunch.push((punchDirection: Direction) => {
      // TODO: put this logic somewhere else (probably in player class)
      if (this.player.currDodgeDirection == punchDirection) {
        // player successfully dodged
      } else {
        // got punched
        this.player.damage()
        this.cameras.main.shake(150, 0.005)
        if (this.player.health <= 0) {
          console.log('you lose')
        }
      }
    })
    this.beatTracker.addBeatListener(() => {
      this.handleOnBeatForAttackPhase()
    })
    this.beatTracker.start()
    this.startPhaseSwitchCountdown()

    // create health bars
    new Healthbar(
      this,
      {
        position: {
          x: WINDOW_WIDTH - Healthbar.LENGTH - 10,
          y: WINDOW_HEIGHT - 30,
        },
        maxHealth: Player.MAX_HEALTH,
      },
      this.player,
      this.player.onDamaged
    )
    new Healthbar(
      this,
      {
        position: {
          x: 60,
          y: 30,
        },
        maxHealth: 20,
      },
      this.enemy,
      this.enemy.onDamaged
    )
  }
  //   public static Y_POS = WINDOW_HEIGHT - 30
  //   public static X_POS = WINDOW_WIDTH - Healthbar.LENGTH - 60

  handleOnBeatForAttackPhase() {
    if (this.currAttackPhase === AttackPhase.ENEMY) {
      if (this.currEnemyActions >= this.numEnemyActionsBeforeSwitch) {
        // Always end enemy attack string with a punch
        if (this.enemy.currState === EnemyState.WIND_UP_COMPLETE) {
          this.enemy.onBeat()
        } else {
          this.switchPhase()
        }
      } else {
        if (this.currEnemyActions >= 0) {
          this.enemy.onBeat()
        }
        this.currEnemyActions++
      }
    } else {
      if (this.currPlayerActions + 1 == this.numPlayerActionsBeforeSwitch) {
        this.switchPhase()
      } else {
        this.currPlayerActions++
      }
    }
  }

  switchPhase() {
    if (this.currAttackPhase === AttackPhase.ENEMY) {
      this.currPlayerActions = -3
      this.currAttackPhase = AttackPhase.PLAYER
    } else {
      this.currEnemyActions = -3
      this.numEnemyActionsBeforeSwitch = Phaser.Math.Between(5, 10)
      this.currAttackPhase = AttackPhase.ENEMY
    }
    this.beatTracker.handlePhaseSwitch(this.currAttackPhase)
    this.startPhaseSwitchCountdown()
  }

  canPlayerAttack() {
    return (
      this.currAttackPhase === AttackPhase.PLAYER && this.currPlayerActions >= 0
    )
  }

  startPhaseSwitchCountdown() {
    const duration = 60000 / this.bpm
    let countdown = 3
    const countdownText = this.add
      .text(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, `${countdown}`)
      .setStyle({
        fontSize: '30px',
        color: '#ffffff',
      })
      .setDepth(SORT_ORDER.ui)
    countdownText.setPosition(
      WINDOW_WIDTH / 2 - countdownText.displayWidth / 2,
      WINDOW_HEIGHT / 2 - countdownText.displayHeight / 2
    )
    this.tweens.add({
      targets: [countdownText],
      alpha: {
        from: 1,
        to: 0,
      },
      duration: duration,
      repeat: 3,
      onRepeat: () => {
        countdown--
        let text = `${countdown}`
        if (countdown === 0) {
          text =
            this.currAttackPhase === AttackPhase.PLAYER
              ? 'Player Attack!'
              : 'Enemy Attack!'
        }
        countdownText
          .setText(text)
          .setAlpha(1)
          .setPosition(
            WINDOW_WIDTH / 2 - countdownText.displayWidth / 2,
            WINDOW_HEIGHT / 2 - countdownText.displayHeight / 2
          )
      },
      onComplete: () => {
        countdownText.destroy()
      },
    })
  }
}
