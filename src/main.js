import Phaser from 'phaser';
import './style.css';
import Preloader from './scenes/Preloader';
import Title from './scenes/Title';
import CharacterSelect from './scenes/CharacterSelect';
import Game from './scenes/Game';

const config = {
  type: Phaser.WEBGL,
  width: 720,
  height: 720,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
    },
  },
  pixelArt: true,
  scene: [Preloader, Title, CharacterSelect, Game],
};

new Phaser.Game(config);
