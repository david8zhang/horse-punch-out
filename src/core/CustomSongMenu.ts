import Game from '~/scenes/Game'
import { button } from '~/ui/Button'
import { formInput } from '~/ui/Input'
import {
  DEFAULT_FONT,
  SORT_ORDER,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from './Constants'

export class CustomSongMenu {
  private game: Game
  private container: Phaser.GameObjects.Container
  constructor(game: Game) {
    this.game = game
    this.container = this.game.add.container().setDepth(SORT_ORDER.top)
    this.initYoutubeSearchBar()
  }

  initYoutubeSearchBar() {
    const bg = this.game.add.rectangle(
      WINDOW_WIDTH / 2,
      WINDOW_HEIGHT / 2,
      WINDOW_WIDTH,
      WINDOW_HEIGHT,
      0x000000
    )

    const searchInput = formInput('Enter a Youtube link', {
      width: '500px',
    }) as HTMLElement
    const searchInputDom = this.game.add
      .dom(290, WINDOW_HEIGHT / 2, searchInput)
      .setOrigin(0.5)

    const bpmInput = formInput('Enter song BPM', {
      width: '200px',
    }) as HTMLElement
    const bpmInputDOM = this.game.add
      .dom(650, WINDOW_HEIGHT / 2, bpmInput)
      .setOrigin(0.5)

    const nextButton = button('Next', {
      fontSize: '20px',
      color: 'black',
      fontFamily: DEFAULT_FONT,
      width: 125,
      height: 45,
    }) as HTMLElement
    const buttonDom = this.game.add
      .dom(WINDOW_WIDTH / 2, searchInputDom.y + 75, nextButton)
      .setOrigin(0.5)
      .addListener('click')
      .on('click', () => {
        this.hide()
        const link = (searchInput as any).value
        const bpm = (bpmInput as any).value
        this.game.selectSong(link, bpm)
      })
    this.container.add(bg)
    this.container.add(searchInputDom)
    this.container.add(bpmInputDOM)
    this.container.add(buttonDom)
  }

  hide() {
    this.container.setVisible(false)
  }

  show() {
    this.container.setVisible(true)
  }
}
