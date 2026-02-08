import Phaser from 'phaser';

const BG_SCROLL_SPEED = 0.25;

export default class CharacterSelect extends Phaser.Scene {
    constructor() {
        super({ key: 'scene-character-select' });
    }

    create() {
        const playAs = (id) => {
            this.bgm.destroy();
            this.scene.start('scene-game', { id });
        }

        function playAsSelectedCharacter(e) {
            const id = e.currentTarget.getAttribute('data-charsel');
            playAs(id);
        }

        const backToTitle = () => {
            this.bgm.destroy();
            this.scene.start('scene-title');
        }

        const charBtns = document.querySelectorAll('[data-charsel]');
        const btnBack = document.querySelector('[data-goto="title"]');

        document.querySelectorAll('.menu').forEach((menu) => menu.classList.remove('on'));
        document.querySelector('.menu.character').classList.add('on');

        charBtns.forEach((btn) => {
            btn.addEventListener('click', playAsSelectedCharacter);
        });

        btnBack.addEventListener('click', backToTitle);

        // Bg
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;

        this.bg = this.add.tileSprite(centerX, centerY, 640, 480, 'bg').setOrigin(0.5);
        this.bg.setScale(2);
        this.bg.setAlpha(0.35);

        this.bgm = this.sound.add('ost-good-time');
        this.bgm.play({ loop: true, volume: 0.5 });

        const deleteListeners = () => {
            charBtns.forEach((btn) => {
                btn.removeEventListener('click', playAsSelectedCharacter);
            });
            btnBack.removeEventListener('click', backToTitle);
        }

        this.events.once('destroy', deleteListeners);
        this.events.once('shutdown', deleteListeners);
    }

    update() {
        this.bg.tilePositionY += BG_SCROLL_SPEED;
    }
}
