export class Preload extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  preload() {
    // Load assets here!
    // Game Over
    this.load.image('gameover', 'gameover/gameover.png')
  }

  create() {
    this.scene.start('game')
  }
}
