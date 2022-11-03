export class Preload extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  preload() {
    // Load assets here!
  }

  create() {
    this.scene.start('game')
  }
}
