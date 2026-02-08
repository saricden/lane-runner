import Phaser from 'phaser';

const BG_SCROLL_SPEED = 0.25;

export default class Title extends Phaser.Scene {
  constructor() {
    super({ key: 'scene-title' });
  }

  create() {
    const gotoCharacterSelect = () => {
      this.bgm.destroy();
      this.scene.start('scene-character-select');
    }

    function gotoDiscord() {
      window.open('https://discord.gg/XnTUwXqw74', '_blank');
    }

    document.querySelectorAll('.menu').forEach((menu) => menu.classList.remove('on'));
    document.querySelector('.menu.title').classList.add('on');
    document.querySelector('[data-goto="character-select"]').addEventListener('click', gotoCharacterSelect);
    document.querySelector('[data-goto="discord"]').addEventListener('click', gotoDiscord);

    // Bg
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    this.bg = this.add.tileSprite(centerX, centerY, 640, 480, 'bg').setOrigin(0.5);
    this.bg.setScale(2);
    this.bg.setAlpha(0.35);

    this.bgm = this.sound.add('ost-lament');
    this.bgm.play({ loop: true, volume: 0.5 });

    const bestScore = window.localStorage.getItem('sdn_best-score') || 0;
    document.querySelector('.best-score').textContent = `Best score: ${bestScore}`;

    const deleteListeners = () => {
      document.querySelector('[data-goto="character-select"]').removeEventListener('click', gotoCharacterSelect);
      document.querySelector('[data-goto="discord"]').removeEventListener('click', gotoDiscord);
    }

    this.events.once('destroy', deleteListeners);
    this.events.once('shutdown', deleteListeners);
  }

  update() {
    this.bg.tilePositionY += BG_SCROLL_SPEED;
  }
}
