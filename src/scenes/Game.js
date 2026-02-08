import Phaser from 'phaser';

const PLAYER_Y = 180;
const PLAYER_CENTER_OFFSET = 90;
const TWEEN_DURATION = 180;
const BG_SCROLL_SPEED = 1;
const BG_SCROLL_SPEED_MAX = 8;
const BG_SCROLL_RAMP_PER_SEC = 0.04;
const ENEMY_SPAWN_MARGIN = 80;
const ENEMY_SPAWN_INTERVAL_MIN = 1500;
const ENEMY_SPAWN_INTERVAL_MAX = 3500;
const ENEMY_SPAWN_INTERVAL_MIN_CLAMP = 600;
const ENEMY_SPAWN_RAMP_PER_SEC_MS = 25;
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

export default class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'scene-game' });
  }

  init(data) {
    this.playerId = data.id ?? 'ninja';
  }

  create() {
    document.querySelectorAll('.menu').forEach((menu) => menu.classList.remove('on'));
    this.hudEl = document.querySelector('.hud');
    this.hudEl.classList.add('on');

    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    this.bg = this.add.tileSprite(centerX, centerY, 640, 480, 'bg').setOrigin(0.5);
    this.bg.setScale(2);
    const leftX = centerX - PLAYER_CENTER_OFFSET;
    const rightX = centerX + PLAYER_CENTER_OFFSET;

    const startOnLeft = Phaser.Math.Between(0, 1) === 0;
    const startX = startOnLeft ? leftX : rightX;

    this.player = this.physics.add.sprite(startX, PLAYER_Y, this.playerId);
    this.player.play({key: `${this.playerId}-run`, repeat: -1}, true);
    this.player.setScale(3);

    this.leftX = leftX;
    this.rightX = rightX;

    this.input.on('pointerdown', (pointer) => {
      if (this.hp === 0) return;
      const targetX = pointer.x < width / 2 ? this.leftX : this.rightX;
      if (this.player.x === targetX) return;

      this.tweens.add({
        targets: this.player,
        x: targetX,
        duration: TWEEN_DURATION,
        ease: 'Power2',
      });
    });

    this.globalTime = 0;
    this.hp = 5;
    this.enemyIds = [...SPRITE_IDS].filter((id) => id !== this.playerId);
    this.enemies = this.physics.add.group();
    this.booms = this.add.group();
    this.nextEnemySpawnAt = 0;
    this.distance = 0;
    this.lastScoreUpdateAt = 0;

    const restartGame = () => {
      this.scoreEl.textContent = '0';
      this.heartsIcon1.setAttribute('src', './ui-heart-full.png');
      this.heartsIcon2.setAttribute('src', './ui-heart-full.png');
      this.heartsIcon3.setAttribute('src', './ui-heart-full.png');
      this.heartsIcon4.setAttribute('src', './ui-heart-full.png');
      this.heartsIcon5.setAttribute('src', './ui-heart-full.png');
      this.scene.start('scene-title');
    }

    this.physics.add.overlap(
      this.player,
      this.enemies,
      (player, enemy) => {
        const {x: ex, y: ey} = enemy;
        const boom = this.booms.create(ex, ey, 'fx-boom');
        boom.setOrigin(0.5, 1);
        boom.setScale(3);
        boom.on('animationcomplete', () => boom.destroy());
        boom.play('boom');
        enemy.destroy();
        this.hp -= 1;

        if (this.hp === 0) {
          this.sound.play('sfx-explosion4');
          this.cameras.main.flash(1000);
          this.cameras.main.shake(1300);
          this.player.destroy();
          this.bgm.stop();
        }
        else {
          const detune = Phaser.Math.Between(-1100, 1100);
          this.sound.play('sfx-explosion', { detune });
          this.cameras.main.flash(300);
          this.cameras.main.shake(500, 0.03);
        }

        if (this.hp === 0) {
          this.heartsIcon1.setAttribute('src', './ui-heart-empty.png');
          this.heartsIcon2.setAttribute('src', './ui-heart-empty.png');
          this.heartsIcon3.setAttribute('src', './ui-heart-empty.png');
          this.heartsIcon4.setAttribute('src', './ui-heart-empty.png');
          this.heartsIcon5.setAttribute('src', './ui-heart-empty.png');
          this.hudEl.classList.remove('on');

          this.time.delayedCall(1000, () => {
            this.tweens.add({
              duration: 1000,
              alpha: 0.35,
              targets: [
                this.bg,
                ...this.enemies.getChildren()
              ]
            });
            // Update best score
            const finalScore = Math.floor(this.distance / 10);
            const bestScore = parseInt(window.localStorage.getItem('sdn_best-score') || 0);

            if (finalScore > bestScore) {
              window.localStorage.setItem('sdn_best-score', finalScore);
            }

            // Update UI
            document.querySelector('.final-score').textContent = `Final score: ${finalScore}`;
            document.querySelector('.menu.game-over').classList.add('on');

            document.querySelector('[data-goto="restart"]').addEventListener('click', restartGame);
          });
        }
        else if (this.hp === 1) {
          this.heartsIcon1.setAttribute('src', './ui-heart-full.png');
          this.heartsIcon2.setAttribute('src', './ui-heart-empty.png');
          this.heartsIcon3.setAttribute('src', './ui-heart-empty.png');
          this.heartsIcon4.setAttribute('src', './ui-heart-empty.png');
          this.heartsIcon5.setAttribute('src', './ui-heart-empty.png');
        }
        else if (this.hp === 2) {
          this.heartsIcon1.setAttribute('src', './ui-heart-full.png');
          this.heartsIcon2.setAttribute('src', './ui-heart-full.png');
          this.heartsIcon3.setAttribute('src', './ui-heart-empty.png');
          this.heartsIcon4.setAttribute('src', './ui-heart-empty.png');
          this.heartsIcon5.setAttribute('src', './ui-heart-empty.png');
        }
        else if (this.hp === 3) {
          this.heartsIcon1.setAttribute('src', './ui-heart-full.png');
          this.heartsIcon2.setAttribute('src', './ui-heart-full.png');
          this.heartsIcon3.setAttribute('src', './ui-heart-full.png');
          this.heartsIcon4.setAttribute('src', './ui-heart-empty.png');
          this.heartsIcon5.setAttribute('src', './ui-heart-empty.png');
        }
        else if (this.hp === 4) {
          this.heartsIcon1.setAttribute('src', './ui-heart-full.png');
          this.heartsIcon2.setAttribute('src', './ui-heart-full.png');
          this.heartsIcon3.setAttribute('src', './ui-heart-full.png');
          this.heartsIcon4.setAttribute('src', './ui-heart-full.png');
          this.heartsIcon5.setAttribute('src', './ui-heart-empty.png');
        }
        else if (this.hp === 5) {
          this.heartsIcon1.setAttribute('src', './ui-heart-full.png');
          this.heartsIcon2.setAttribute('src', './ui-heart-full.png');
          this.heartsIcon3.setAttribute('src', './ui-heart-full.png');
          this.heartsIcon4.setAttribute('src', './ui-heart-full.png');
          this.heartsIcon5.setAttribute('src', './ui-heart-full.png');
        }
      },
      null,
      this
    );

    this.scoreEl = document.querySelector('.hud .score');
    this.heartsIcon1 = document.querySelector('.hud .hp img:nth-of-type(1)');
    this.heartsIcon2 = document.querySelector('.hud .hp img:nth-of-type(2)');
    this.heartsIcon3 = document.querySelector('.hud .hp img:nth-of-type(3)');
    this.heartsIcon4 = document.querySelector('.hud .hp img:nth-of-type(4)');
    this.heartsIcon5 = document.querySelector('.hud .hp img:nth-of-type(5)');

    if (!this.bgm) {
      this.bgm = this.sound.add('ost-fight');
    }

    this.bgm.play({ loop: true, volume: 0.65 });

    const deleteListeners = () => {
      document.querySelector('[data-goto="restart"]').removeEventListener('click', restartGame);
    }

    this.events.once('destroy', deleteListeners);
    this.events.once('shutdown', deleteListeners);
  }

  spawnEnemy() {
    if (this.enemyIds.length === 0) return;
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const leftX = centerX - PLAYER_CENTER_OFFSET;
    const rightX = centerX + PLAYER_CENTER_OFFSET;
    const side = Phaser.Math.Between(0, 1) === 0 ? leftX : rightX;
    const id = Phaser.Utils.Array.GetRandom(this.enemyIds);
    const enemy = this.enemies.create(side, height + ENEMY_SPAWN_MARGIN, id);
    enemy.setScale(3);
    enemy.setOrigin(0.5, 1);
    enemy.play({ key: `${id}-run`, repeat: -1 }, true);
  }

  update(time, delta) {
    this.globalTime += delta;
    const elapsedSec = this.globalTime / 1000;

    this.scrollSpeed = Phaser.Math.Clamp(
      BG_SCROLL_SPEED + elapsedSec * BG_SCROLL_RAMP_PER_SEC,
      BG_SCROLL_SPEED,
      BG_SCROLL_SPEED_MAX
    );
    const spawnMin = Phaser.Math.Clamp(
      ENEMY_SPAWN_INTERVAL_MIN - elapsedSec * ENEMY_SPAWN_RAMP_PER_SEC_MS,
      ENEMY_SPAWN_INTERVAL_MIN_CLAMP,
      ENEMY_SPAWN_INTERVAL_MIN
    );
    const spawnMax = Phaser.Math.Clamp(
      ENEMY_SPAWN_INTERVAL_MAX - elapsedSec * ENEMY_SPAWN_RAMP_PER_SEC_MS * 1.5,
      spawnMin + 200,
      ENEMY_SPAWN_INTERVAL_MAX
    );

    if (this.hp > 0) {
      this.bg.tilePositionY += this.scrollSpeed;
      this.distance += this.scrollSpeed;
    }

    if (this.globalTime >= this.nextEnemySpawnAt) {
      this.spawnEnemy();
      this.nextEnemySpawnAt = this.globalTime + Phaser.Math.Between(spawnMin, spawnMax);
    }
    this.enemies.getChildren().forEach((enemy) => {
      if (this.hp > 0) enemy.y -= this.scrollSpeed;
      else enemy.y += this.scrollSpeed / 3;
      if (enemy.y < -50) enemy.destroy();
    });
    this.booms.getChildren().forEach((boom) => {
      if (this.hp > 0) boom.y -= this.scrollSpeed;
    });

    if (this.globalTime - this.lastScoreUpdateAt >= 1000) {
      this.lastScoreUpdateAt = this.globalTime;
      if (this.scoreEl) this.scoreEl.textContent = Math.floor(this.distance / 10);
    }
  }
}
