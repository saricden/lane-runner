import Phaser from 'phaser';

const SPRITE_IDS = [
  'ninja',
  'pig',
  'monkey',
  'master',
  'mask_racoon',
  'knight',
  'inspector',
  'flan',
  'boy'
];

export default class Preloader extends Phaser.Scene {
  constructor() {
    super({ key: 'scene-preloader' });
  }

  preload() {
    this.load.image('bg', '/bg.png');
    SPRITE_IDS.forEach((id) => {
        this.load.aseprite(id, `/${id}.png`, `/${id}.json`);
    });
    this.load.aseprite('fx-boom', '/fx-boom.png', '/fx-boom.json');

    this.load.audio('ost-fight', '/ost-fight.mp3');
    this.load.audio('ost-lament', '/ost-lament.mp3');
    this.load.audio('ost-good-time', '/ost-good-time.mp3');

    this.load.audio('sfx-explosion', '/sfx-explosion.mp3');
    this.load.audio('sfx-explosion4', '/sfx-explosion4.mp3');
  }

  create() {
    console.log('PreloaderScene');
    SPRITE_IDS.forEach((id) => {
        this.anims.createFromAseprite(id);
    });
    this.anims.createFromAseprite('fx-boom');

    this.add.text(720 / 2, 720 / 2, 'Press anywhere to start.', {
      fontFamily: 'sans-serif',
      fontSize: 18
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => this.scene.start('scene-title'));
  }
}
