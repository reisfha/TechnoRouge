import './styles/cards.css';
import './styles/hud.css';
import './styles/menus.css';
import './styles/map.css';

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { MapScene } from './scenes/MapScene';
import { CombatScene } from './scenes/CombatScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 960,
  height: 640,
  backgroundColor: '#0a0a0f',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, MapScene, CombatScene],
  input: {
    keyboard: true,
    touch: true,
    mouse: true,
  },
};

new Phaser.Game(config);
