import {
  DEFAULT_BPM,
  DEFAULT_FONT,
  MUSIC_BPM_MAPPING,
  SORT_ORDER,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from '~/core/Constants'
import Game from '~/scenes/Game'
import { button } from '~/ui/Button'
import { formInput } from '~/ui/Input'

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
    const searchingYoutubeText = this.game.add.text(
      WINDOW_WIDTH / 2,
      WINDOW_HEIGHT / 2,
      'Loading...'
    )
    searchingYoutubeText
      .setPosition(
        searchingYoutubeText.x - searchingYoutubeText.displayWidth / 2,
        searchingYoutubeText.y - searchingYoutubeText.displayHeight / 2 - 50
      )
      .setStyle({
        fontFamily: 'VCR',
        color: 'white',
        fontSize: '30px',
      })
      .setDepth(SORT_ORDER.top)
      .setVisible(false)

    this.titleText = this.game.add
      .text(WINDOW_WIDTH / 2, 40, 'Song Select')
      .setStyle({
        fontFamily: 'VCR',
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
        fontFamily: 'VCR',
        fontSize: '20px',
      })
    this.bpmText = this.game.add
      .text(this.tempoText.x, this.tempoText.y, `${bpm} BPM`)
      .setStyle({
        fontFamily: 'VCR',
        fontSize: '20px',
      })
    this.tempoText.setPosition(
      WINDOW_WIDTH / 2 -
        (this.tempoText.displayWidth + this.bpmText.displayWidth) / 2,
      this.tempoText.y
    )
    const searchInput = formInput() as HTMLElement
    const searchInputDom = this.game.add
      .dom(WINDOW_WIDTH / 2 - 75, this.game.scale.height - 40, searchInput)
      .setOrigin(0.5)

    const nextButton = button('Next', {
      fontSize: '20px',
      color: 'black',
      fontFamily: DEFAULT_FONT,
      width: 125,
      height: 45,
    }) as HTMLElement
    const buttonDom = this.game.add
      .dom(
        searchInputDom.x + WINDOW_WIDTH / 2 + 5,
        searchInputDom.y,
        nextButton
      )
      .setOrigin(0.5)
      .addListener('click')
      .on('click', () => {
        this.hide()
        const link = (searchInput as any).value
        this.game.selectSong(link)
      })
    this.container.add(bg)
    this.container.add(buttonDom)
    this.container.add(this.titleText)
    this.container.add(this.tempoText)
    this.container.add(this.bpmText)
    this.container.add(searchInputDom)
    this.container.add(searchingYoutubeText)
    this.container.setVisible(false)
  }

  showSongListForBPM(bpm: number) {
    this.container.setVisible(true)
    this.bpmText.setText(`BPM: ${bpm}`)
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
          .text(0, y, song.name)
          .setStyle({
            fontSize: '20px',
            fontFamily: 'VCR',
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
