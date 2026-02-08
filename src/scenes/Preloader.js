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

const BAR_WIDTH = 250;
const BAR_HEIGHT = 8;

export default class Preloader extends Phaser.Scene {
  constructor() {
    super({ key: 'scene-preloader' });
  }

  preload() {
    const { width: camWidth, height: camHeight } = this.cameras.main;
    const x = camWidth / 2 - BAR_WIDTH / 2;
    const y = camHeight / 2 - BAR_HEIGHT / 2;

    this.loadBarBorder = this.add.graphics();
    this.loadBarBorder.lineStyle(2, 0xffffff, 1);
    this.loadBarBorder.strokeRect(x, y, BAR_WIDTH, BAR_HEIGHT);

    this.loadBarFill = this.add.graphics();
    this.load.on('progress', (value) => {
      this.loadBarFill.clear();
      this.loadBarFill.fillStyle(0xffffff, 1);
      this.loadBarFill.fillRect(x, y, BAR_WIDTH * value, BAR_HEIGHT);
    });

    this.load.image('bg', './bg.png');
    SPRITE_IDS.forEach((id) => {
        this.load.aseprite(id, `./${id}.png`, `./${id}.json`);
    });
    this.load.aseprite('fx-boom', './fx-boom.png', './fx-boom.json');

    this.load.audio('ost-fight', './ost-fight.mp3');
    this.load.audio('ost-lament', './ost-lament.mp3');
    this.load.audio('ost-good-time', './ost-good-time.mp3');

    this.load.audio('sfx-explosion', './sfx-explosion.mp3');
    this.load.audio('sfx-explosion4', './sfx-explosion4.mp3');
  }

  create() {
    this.loadBarBorder.destroy();
    this.loadBarFill.destroy();

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
