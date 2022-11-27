import { DEFAULT_FONT, MUSIC_BPM_MAPPING, WINDOW_WIDTH } from '~/core/Constants'
import { button } from '~/ui/Button'
import { formInput } from '~/ui/Input'

export class SongSelect extends Phaser.Scene {
  public titleText!: Phaser.GameObjects.Text
  public tempoText!: Phaser.GameObjects.Text
  public bpm: number = 100
  public static readonly SONG_PAGE_SIZE = 10

  constructor() {
    super('song-select')
  }

  init(data) {
    if (data && data.bpm) {
      this.bpm = data.bpm
    }
  }

  create() {
    this.titleText = this.add
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
    this.tempoText = this.add
      .text(
        WINDOW_WIDTH / 2,
        this.titleText.y + this.titleText.displayHeight + 20,
        'Tempo: '
      )
      .setStyle({
        fontFamily: 'VCR',
        fontSize: '20px',
      })
    const bpmText = this.add
      .text(this.tempoText.x, this.tempoText.y, `${this.bpm} BPM`)
      .setStyle({
        fontFamily: 'VCR',
        fontSize: '20px',
      })
    this.tempoText.setPosition(
      WINDOW_WIDTH / 2 -
        (this.tempoText.displayWidth + bpmText.displayWidth) / 2,
      this.tempoText.y
    )
    this.renderSongConfigForBPM()

    const searchInput = formInput() as HTMLElement
    const searchInputDom = this.add
      .dom(WINDOW_WIDTH / 2 - 75, this.scale.height - 40, searchInput)
      .setOrigin(0.5)

    const nextButton = button('Next', {
      fontSize: '20px',
      color: 'black',
      fontFamily: DEFAULT_FONT,
      width: 125,
      height: 45,
    }) as HTMLElement
    const buttonDom = this.add.dom(
      searchInputDom.x + WINDOW_WIDTH / 2 + 5,
      searchInputDom.y,
      nextButton
    )
  }

  renderSongConfigForBPM() {
    const songList = MUSIC_BPM_MAPPING[this.bpm]
    let y = this.tempoText.y + 40
    for (let i = 0; i < SongSelect.SONG_PAGE_SIZE; i++) {
      if (songList[i]) {
        const song = songList[i]
        const songText = this.add
          .text(0, y, song.name)
          .setStyle({
            fontSize: '20px',
            fontFamily: 'VCR',
          })
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => {
            console.log('Clicked!')
          })
        y += songText.displayHeight + 25
      }
    }
    console.log(y)
  }
}
