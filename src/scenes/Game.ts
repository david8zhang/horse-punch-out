import Phaser from 'phaser'
import {
  Direction,
  ENEMY_DAMAGE,
  PLAYER_DAMAGE_MAPPING,
  SORT_ORDER,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from '~/core/Constants'
import { Enemy } from '~/core/Enemy'
import { BeatQuality, BeatTracker } from '~/core/BeatTracker'
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
  public numEnemyActionsBeforeSwitch: number = 10
  public currEnemyActions: number = -3 // Start it at negative to give player time to adjust

  // track number of player attacks before enemy can attack
  public numPlayerActionsBeforeSwitch: number = 10
  public currPlayerActions: number = -3
  public playerInputMiss: boolean = false
  public playerInputMissText!: Phaser.GameObjects.Text

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
        this.player.damage(ENEMY_DAMAGE)
        this.cameras.main.shake(150, 0.005)
        if (this.player.health <= 0) {
          this.scene.start('gameover', {
            score: 0,
          })
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
        maxHealth: Enemy.MAX_HEALTH,
      },
      this.enemy,
      this.enemy.onDamaged
    )

    this.playerInputMissText = this.add
      .text(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 'Miss!')
      .setStyle({
        fontSize: '40px',
        color: 'white',
      })
      .setDepth(SORT_ORDER.ui)
      .setVisible(false)
    this.playerInputMissText.setPosition(
      WINDOW_WIDTH / 2 - this.playerInputMissText.displayWidth / 2,
      WINDOW_HEIGHT / 2 - this.playerInputMissText.displayHeight / 2
    )
  }

  handleOnBeatForAttackPhase() {
    if (this.currAttackPhase === AttackPhase.ENEMY) {
      if (this.currEnemyActions >= this.numEnemyActionsBeforeSwitch) {
        // Always end enemy attack string with a punch
        if (this.enemy.isWindingUp) {
          this.enemy.onBeat(true)
        } else {
          this.switchPhase()
        }
      } else {
        if (this.currEnemyActions >= 0) {
          this.enemy.onBeat(false)
        }
        this.currEnemyActions++
      }
    } else {
      if (
        this.playerInputMiss ||
        this.currPlayerActions + 1 == this.numPlayerActionsBeforeSwitch
      ) {
        this.switchPhase()
      } else {
        this.currPlayerActions++
      }
    }
  }

  onPlayerInputMiss() {
    this.tweens.add({
      targets: [this.playerInputMissText],
      alpha: {
        from: 1,
        to: 0,
      },
      y: '-=20',
      onStart: () => {
        this.playerInputMissText.setVisible(true)
      },
      onComplete: () => {
        this.playerInputMissText
          .setPosition(
            WINDOW_WIDTH / 2 - this.playerInputMissText.displayWidth / 2,
            WINDOW_HEIGHT / 2 - this.playerInputMissText.displayHeight / 2
          )
          .setVisible(false)
          .setAlpha(1)
      },
      duration: 1000,
    })
    this.playerInputMiss = true
  }

  switchPhase() {
    if (this.currAttackPhase === AttackPhase.ENEMY) {
      this.currPlayerActions = -3
      this.currAttackPhase = AttackPhase.PLAYER
    } else {
      this.playerInputMiss = false
      this.currEnemyActions = -3
      this.numEnemyActionsBeforeSwitch = 10
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

  handlePlayerAttack(beatQuality: BeatQuality) {
    this.cameras.main.shake(150, 0.005)
    const damageToDeal = PLAYER_DAMAGE_MAPPING[beatQuality]
    this.enemy.damage(damageToDeal)

    const beatQualityText = this.add
      .text(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, beatQuality)
      .setStyle({
        fontSize: '30px',
        color: 'white',
      })
      .setDepth(SORT_ORDER.ui)
      .setVisible(false)

    beatQualityText.setPosition(
      WINDOW_WIDTH / 2 - beatQualityText.displayWidth / 2,
      WINDOW_HEIGHT / 2 - beatQualityText.displayHeight / 2
    )

    this.tweens.add({
      targets: [beatQualityText],
      alpha: {
        from: 1,
        to: 0,
      },
      y: '-=20',
      onStart: () => {
        beatQualityText.setVisible(true)
      },
      onComplete: () => {
        beatQualityText.destroy()
      },
      duration: 500,
    })
  }
}
