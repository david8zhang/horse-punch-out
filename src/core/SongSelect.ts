import {
  DEFAULT_BPM,
  DEFAULT_FONT,
  MUSIC_BPM_MAPPING,
  SORT_ORDER,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from '~/core/Constants'
import Game from '~/scenes/Game'

export class SongSelect {
  public static readonly SONG_PAGE_SIZE = 10
  public titleText!: Phaser.GameObjects.Text
  public tempoText!: Phaser.GameObjects.Text
  public bpmText!: Phaser.GameObjects.Text
  public game: Game
  public container!: Phaser.GameObjects.Container
  public songOptions: Phaser.GameObjects.Text[] = []

  constructor(game: Game, bpm: number) {
    this.game = game
    this.container = this.game.add.container().setDepth(SORT_ORDER.top)
    this.initUI(bpm)
  }

  initUI(bpm: number) {
    const bg = this.game.add.rectangle(
      WINDOW_WIDTH / 2,
      WINDOW_HEIGHT / 2,
      WINDOW_WIDTH,
      WINDOW_HEIGHT,
      0x000000
    )
    this.titleText = this.game.add
      .text(WINDOW_WIDTH / 2, 40, 'Song Select')
      .setStyle({
        fontFamily: DEFAULT_FONT,
        fontSize: '40px',
      })
    this.titleText.setPosition(
      this.titleText.x - this.titleText.displayWidth / 2,
      this.titleText.y - this.titleText.displayHeight / 2
    )

    // Add text for current tempo
    this.tempoText = this.game.add
      .text(
        WINDOW_WIDTH / 2,
        this.titleText.y + this.titleText.displayHeight + 20,
        'Tempo: '
      )
      .setStyle({
        fontFamily: DEFAULT_FONT,
        fontSize: '20px',
      })
    this.bpmText = this.game.add
      .text(this.tempoText.x, this.tempoText.y, `${bpm} BPM`)
      .setStyle({
        fontFamily: DEFAULT_FONT,
        fontSize: '20px',
      })
    this.tempoText.setPosition(
      WINDOW_WIDTH / 2 -
        (this.tempoText.displayWidth + this.bpmText.displayWidth) / 2,
      this.tempoText.y
    )
    this.container.add(bg)
    this.container.add(this.titleText)
    this.container.add(this.tempoText)
    this.container.add(this.bpmText)
    this.container.setVisible(false)
  }

  showSongListForBPM(bpm: number) {
    this.container.setVisible(true)
    this.bpmText.setText(`${bpm} BPM`)
    this.tempoText.setPosition(
      WINDOW_WIDTH / 2 -
        (this.tempoText.displayWidth + this.bpmText.displayWidth) / 2,
      this.tempoText.y
    )
    this.renderSongConfigForBPM(bpm)
  }

  hide() {
    this.container.setVisible(false)
    this.songOptions.forEach((songOption) => {
      songOption.destroy()
    })
  }

  private renderSongConfigForBPM(bpm: number) {
    const songList = MUSIC_BPM_MAPPING[bpm] || []
    let y = this.tempoText.y + 40
    for (let i = 0; i < SongSelect.SONG_PAGE_SIZE; i++) {
      if (songList[i]) {
        const song = songList[i]
        const songText = this.game.add
          .text(40, y, song.name)
          .setStyle({
            fontSize: '20px',
            fontFamily: DEFAULT_FONT,
          })
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => {
            this.hide()
            this.game.selectSong(song.link)
          })
          .setDepth(SORT_ORDER.top + 100)
        this.songOptions.push(songText)
        y += songText.displayHeight + 25
      }
    }
  }
}
