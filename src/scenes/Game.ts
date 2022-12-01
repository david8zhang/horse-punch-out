import Phaser from 'phaser'
import {
  DEFAULT_BPM,
  DEFAULT_FONT,
  Direction,
  PLAYER_DAMAGE_MAPPING,
  SORT_ORDER,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from '~/core/Constants'
import { Enemy } from '~/core/Enemy'
import { BeatQuality, BeatTracker } from '~/core/BeatTracker'
import { Player } from '~/core/Player'
// @ts-ignore
import YoutubePlayer from 'youtube-player'
// @ts-ignore
import { YouTubePlayer } from 'youtube-player/dist/types'
// @ts-ignore
import PlayerStates from 'youtube-player/dist/constants/PlayerStates'
import { SongSelect } from '~/core/SongSelect'

export enum AttackPhase {
  PLAYER,
  ENEMY,
}

export default class Game extends Phaser.Scene {
  public delay: number = 0
  public player!: Player
  public enemy!: Enemy
  public beatTracker!: BeatTracker
  public currAttackPhase: AttackPhase = AttackPhase.ENEMY

  // Embedded youtube video UI
  public youtubePlayer!: YouTubePlayer
  public isPlaying: boolean = false
  public selectedSong: string = ''
  public songSelectMenu!: SongSelect

  public bpm = DEFAULT_BPM

  // track number of enemy attacks before player can attack
  public numEnemyActionsBeforeSwitch: number = 10
  public currEnemyActions: number = -3 // Start it at negative to give player time to adjust

  // track number of player attacks before enemy can attack
  public numPlayerActionsBeforeSwitch: number = 10
  public currPlayerActions: number = -3
  public playerInputMiss: boolean = false
  public playerInputMissText!: Phaser.GameObjects.Text

  // Victory Text
  public victoryText!: Phaser.GameObjects.Text
  public victoryTextBG!: Phaser.GameObjects.Rectangle

  constructor() {
    super('game')
  }

  init(data) {
    if (data) {
      this.selectedSong = data.selectedSong
      this.youtubePlayer = data.youtubePlayer
    }
    this.bpm = DEFAULT_BPM
  }

  selectSong(songLink: string, delay: number) {
    this.beatTracker.hide()
    const url = new URL(songLink)
    if (url.searchParams.get('v')) {
      const youtubeSongId = url.searchParams.get('v') as string
      this.youtubePlayer.loadVideoById(youtubeSongId, delay)
      this.youtubePlayer.stopVideo()
      this.youtubePlayer.playVideo()
    }
  }

  createYoutubePlayer() {
    this.youtubePlayer = YoutubePlayer('player')
    this.youtubePlayer.on('stateChange', (event) => {
      if (event.data === PlayerStates.PLAYING && !this.isPlaying) {
        this.isPlaying = true
        this.restart()
      }
    })
  }

  create() {
    this.victoryTextBG = this.add
      .rectangle(
        WINDOW_WIDTH / 2,
        WINDOW_HEIGHT / 2,
        WINDOW_WIDTH,
        WINDOW_HEIGHT,
        0x000000
      )
      .setAlpha(0.5)
      .setVisible(false)
      .setDepth(SORT_ORDER.top)
    this.victoryText = this.add
      .text(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 'Victory!', {
        fontFamily: DEFAULT_FONT,
        fontSize: '40px',
      })
      .setVisible(false)
      .setDepth(SORT_ORDER.top)
    this.victoryText.setPosition(
      this.victoryText.x - this.victoryText.displayWidth / 2,
      this.victoryText.y
    )
    this.songSelectMenu = new SongSelect(this, this.bpm)
    this.songSelectMenu.showSongListForBPM(this.bpm)
    if (!this.youtubePlayer) {
      this.createYoutubePlayer()
    }
    this.player = new Player(this, {
      position: {
        x: WINDOW_WIDTH / 2,
        y: WINDOW_HEIGHT - 140,
      },
    })
    this.player.onDied.push(this.gameOver.bind(this))
    this.beatTracker = new BeatTracker(this, this.bpm)
    this.enemy = new Enemy(this, {
      position: {
        x: WINDOW_WIDTH / 2,
        y: WINDOW_HEIGHT - 325,
      },
    })
    this.enemy.onDied.push(this.handleDefeatedEnemy.bind(this))
    this.enemy.onPunch.push(this.player.handleEnemyPunch.bind(this.player))
    this.beatTracker.addBeatListener(() => {
      this.handleOnBeatForAttackPhase()
    })
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
    const playerInputMissText = this.add
      .text(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 'Miss!')
      .setStyle({
        fontSize: '40px',
        color: 'white',
        fontFamily: DEFAULT_FONT,
      })
      .setDepth(SORT_ORDER.ui)
      .setVisible(false)
    playerInputMissText.setPosition(
      WINDOW_WIDTH / 2 - playerInputMissText.displayWidth / 2,
      WINDOW_HEIGHT / 2 - playerInputMissText.displayHeight / 2
    )
    this.tweens.add({
      targets: [playerInputMissText],
      alpha: {
        from: 1,
        to: 0,
      },
      y: '-=20',
      onStart: () => {
        playerInputMissText.setVisible(true)
      },
      onComplete: () => {
        playerInputMissText.destroy()
      },
      duration: 500,
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
      this.currAttackPhase === AttackPhase.PLAYER &&
      this.currPlayerActions >= 0 &&
      this.enemy.health > 0
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
        fontFamily: DEFAULT_FONT,
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

  handlePlayerAttack(
    beatQuality: BeatQuality,
    playerPunchDirection: Direction
  ) {
    this.cameras.main.shake(150, 0.005)
    const damageToDeal = PLAYER_DAMAGE_MAPPING[beatQuality]
    this.enemy.takeDamage(damageToDeal, playerPunchDirection)

    const beatQualityText = this.add
      .text(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, beatQuality)
      .setStyle({
        fontSize: '30px',
        color: 'white',
        fontFamily: DEFAULT_FONT,
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

  gameOver() {
    this.youtubePlayer.stopVideo()
    this.isPlaying = false
    this.beatTracker.pause()
    this.currAttackPhase = AttackPhase.PLAYER
    this.currEnemyActions = -3
    this.currPlayerActions = -3
    this.scene.start('gameover', {
      score: 0,
      youtubePlayer: this.youtubePlayer,
    })
  }

  handleDefeatedEnemy() {
    this.isPlaying = false
    // Hide beat tracker
    this.beatTracker.hide()
    this.beatTracker.pause()

    this.victoryText
      .setAlpha(0)
      .setVisible(true)
      .setPosition(this.victoryText.x, this.victoryText.y - 20)
    this.victoryTextBG.setAlpha(0).setVisible(true)
    this.tweens.add({
      targets: [this.victoryText],
      alpha: {
        from: 0,
        to: 1,
      },
      y: '+=20',
      delay: 1000,
      duration: 2000,
    })
    this.tweens.add({
      targets: [this.victoryTextBG],
      alpha: {
        from: 0,
        to: 0.5,
      },
      delay: 1000,
      duration: 2000,
    })

    this.time.delayedCall(5000, () => {
      this.youtubePlayer.stopVideo()
      // Increase the enemy's max health & BPM speed
      this.victoryText.setVisible(false)
      this.victoryTextBG.setVisible(false)
      this.bpm += 10
      this.songSelectMenu.showSongListForBPM(this.bpm)
      this.enemy.setMaxHealth(Math.round(this.enemy.maxHealth * 1.5))
      this.enemy.reset()
    })
  }

  restart() {
    // Reset the attack phase counters
    this.currAttackPhase = AttackPhase.ENEMY
    this.currEnemyActions = -3
    this.currPlayerActions = -3

    // Restart the beat tracker
    this.beatTracker.show()
    this.beatTracker.restart(this.bpm)
    this.startPhaseSwitchCountdown()
  }
}
