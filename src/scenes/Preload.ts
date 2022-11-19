export class Preload extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  preload() {
    this.load.image('gameover', 'ui/gameover.png')
    this.load.image('heart', 'ui/heart.png')
    this.load.audio('unwritten', 'music/unwritten.mp3')
  }

  create() {
    this.scene.start('start')
  }
}
