import {
  DEFAULT_FONT,
  Direction,
  SORT_ORDER,
  WINDOW_WIDTH,
} from '~/core/Constants'
import Game, { AttackPhase } from '~/scenes/Game'
import { button } from '~/ui/Button'
import { BeatQuality } from './BeatTracker'
import { Enemy } from './Enemy'
import { Player } from './Player'

export class Tutorial {
  public static readonly SONG_PAGE_SIZE = 10
  public game: Game
  public container!: Phaser.GameObjects.Container
  public player!: Player
  public enemy!: Enemy
  private tutorialSteps: Array<() => void>
  private curStep: number = 0
  private titleText!: Phaser.GameObjects.Text

  constructor(game: Game, player: Player, enemy: Enemy) {
    this.game = game
    this.player = player
    this.enemy = enemy
    this.enemy.onPunch.push((direction) => {
      // Take no damage from enemy punches
      this.player.handleEnemyPunch(direction, 0)
    })
    this.container = this.game.add.container().setDepth(SORT_ORDER.top)
    this.titleText = this.game.add.text(WINDOW_WIDTH / 2, 40, '').setStyle({
      fontFamily: DEFAULT_FONT,
      fontSize: '25px',
    })
    this.titleText.setPosition(
      this.titleText.x - this.titleText.displayWidth / 2,
      this.titleText.y - this.titleText.displayHeight / 2
    )
    this.container.add(this.titleText)

    this.tutorialSteps = [
      this.teachDodgeLeft.bind(this),
      this.teachDodgeRight.bind(this),
      this.teachPunch.bind(this),
      this.teachDodgeOnBeat.bind(this),
      this.teachEnemyDoublePunches.bind(this),
      this.teachPunchOnBeat.bind(this),
      this.promptStartGame.bind(this),
    ]
    this.game.sound.play('splash-bgm', {
      loop: true,
      volume: 0.4,
    })
    this.tutorialSteps[0]()
  }

  nextStep() {
    this.curStep++
    this.tutorialSteps[this.curStep]()
  }

  setTitleText(text: string) {
    this.titleText.setColor('rgb(255, 255, 255, 1)')
    this.titleText.setText(text)
    this.titleText.setPosition(
      WINDOW_WIDTH / 2 - this.titleText.displayWidth / 2,
      40 - this.titleText.displayHeight / 2
    )
  }

  stepCompletedText(text: string) {
    this.setTitleText(text)
    this.game.tweens.addCounter({
      from: 1,
      to: 0,
      duration: 900,
      onUpdate: (tween) => {
        const val = tween.getValue()
        this.titleText.setColor(`rgb(255, 255, 255, ${val}`)
      },
    })
  }

  teachDodgeLeft() {
    this.setTitleText('Dodge left!')
    this.enemy.windUp(Direction.LEFT)
    const keyPrompt = this.game.add
      .sprite(
        this.enemy.BODY_POSITION.x - 200,
        this.enemy.BODY_POSITION.y + 150,
        'tutorial-prompt-keyA'
      )
      .setDepth(SORT_ORDER.ui)
    this.player.onDodge.push((dir) => {
      if (dir === Direction.LEFT) {
        this.enemy.startPunch(Direction.LEFT)
        keyPrompt.destroy()
        this.stepCompletedText('Nice dodge!')
        setTimeout(() => {
          this.nextStep()
        }, 1000)
        this.player.onDodge.splice(0, 1)
      }
    })
  }

  teachDodgeRight() {
    this.setTitleText('Dodge right!')
    this.enemy.windUp(Direction.RIGHT)
    const keyPrompt = this.game.add
      .sprite(
        this.enemy.BODY_POSITION.x + 200,
        this.enemy.BODY_POSITION.y + 150,
        'tutorial-prompt-keyD'
      )
      .setDepth(SORT_ORDER.ui)
    this.player.onDodge.push((dir) => {
      if (dir === Direction.RIGHT) {
        this.enemy.startPunch(Direction.RIGHT)
        keyPrompt.destroy()
        this.stepCompletedText('Slick moves!')
        setTimeout(() => {
          this.nextStep()
        }, 1000)
        this.player.onDodge.splice(0, 1)
      }
    })
  }

  teachDodgeOnBeat() {
    this.setTitleText('Dodge to the beat!')
    this.game.beatTracker.restart(90)
    this.game.beatTracker.addBeatListener(() => {
      this.enemy.onBeat(false)
      this.enemy.forbidDoublePunches = true
    })

    let dodgeCount = 0
    this.player.onDodgedPunch.push(() => {
      dodgeCount++
      this.setTitleText(`(${dodgeCount}/5) dodges`)
      if (dodgeCount >= 5) {
        this.player.onDodgedPunch.splice(0, 1)
        this.game.beatTracker.beatListeners.splice(0, 1)
        this.game.beatTracker.pause()
        this.stepCompletedText('Great dodging!')
        setTimeout(() => {
          this.nextStep()
        }, 1000)
      }
    })
  }

  teachEnemyDoublePunches() {
    this.setTitleText('Dodge faster punches!')
    this.game.beatTracker.restart(90)
    this.game.beatTracker.addBeatListener(() => {
      this.enemy.onBeat(false)
      this.enemy.forbidDoublePunches = false
    })

    let doubleDodgeCount = 0
    this.player.onDodgedPunch.push(() => {
      doubleDodgeCount++
      this.setTitleText(`(${doubleDodgeCount}/10) dodges`)
      if (doubleDodgeCount >= 10) {
        this.game.beatTracker.pause()
        this.stepCompletedText('Great dodging!')
        setTimeout(() => {
          this.nextStep()
        }, 1000)
        this.player.onDodgedPunch.splice(0, 1)
        this.game.beatTracker.beatListeners.splice(0, 1)
      }
    })
  }

  teachPunch() {
    this.setTitleText('Let him have it!')
    this.game.beatTracker.alwaysPerfectBeat = true
    const keyPrompt = this.game.add
      .sprite(
        this.enemy.BODY_POSITION.x + 200,
        this.enemy.BODY_POSITION.y - 170,
        'tutorial-prompt-keySpace'
      )
      .setDepth(SORT_ORDER.ui)
    let punchCount = 0
    this.game.currAttackPhase = AttackPhase.PLAYER
    this.game.currPlayerActions = 100
    this.player.onPunch.push(() => {
      punchCount++
      this.setTitleText(`(${punchCount}/5) punches`)
      if (punchCount >= 5) {
        this.game.currAttackPhase = AttackPhase.ENEMY
        this.stepCompletedText('You showed him!')
        keyPrompt.destroy()
        setTimeout(() => {
          this.nextStep()
        }, 1000)
        this.player.onPunch.splice(0, 1)
      }
    })
  }

  teachPunchOnBeat() {
    this.setTitleText('Punch to the beat!')
    this.game.currAttackPhase = AttackPhase.PLAYER
    this.game.beatTracker.restart(90)
    this.game.beatTracker.alwaysPerfectBeat = false
    this.game.beatTracker.handlePhaseSwitch(AttackPhase.PLAYER)
    let punchCount = 0
    this.game.currPlayerActions = 100
    this.player.onPunch.push((beatQuality) => {
      if (beatQuality === BeatQuality.PERFECT) {
        punchCount++
        this.setTitleText(`(${punchCount}/5) perfect punches`)
      }
      if (punchCount >= 5) {
        this.stepCompletedText('Awesome!')
        setTimeout(() => {
          this.nextStep()
        })
        this.player.onPunch.splice(0, 1)
      }
    })
  }

  promptStartGame() {
    const nextButton = button("I'm Ready!", {
      fontSize: '20px',
      color: 'black',
      fontFamily: DEFAULT_FONT,
      width: 200,
      height: 45,
    }) as HTMLElement
    this.game.add
      .dom(WINDOW_WIDTH - 140, 40, nextButton)
      .setOrigin(0.5)
      .addListener('click')
      .on('click', () => {
        this.game.scene.start('game', { skipTutorial: true })
      })
  }
}
