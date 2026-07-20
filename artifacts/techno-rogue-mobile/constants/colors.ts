export const Colors = {
  bg: '#0a0a0f',
  bgCard: '#0f0f1a',
  bgPanel: '#12121f',
  border: '#1a1a3a',
  borderBright: '#2a2a5a',

  cyan: '#44aaff',
  cyanDim: '#1a4466',
  cyanGlow: '#66ccff',

  red: '#ff4455',
  redDim: '#661a22',

  green: '#44ff88',
  greenDim: '#1a6633',

  yellow: '#ffcc44',
  yellowDim: '#664e1a',

  purple: '#aa44ff',
  purpleDim: '#441a66',

  text: '#e0e8ff',
  textDim: '#6070a0',
  textBright: '#ffffff',

  hp: '#ff4455',
  block: '#44aaff',
  energy: '#ffcc44',
  poison: '#44ff88',
  weak: '#ffaa44',
  vulnerable: '#ff6644',
  strength: '#ff4488',
};

export const NODE_COLORS: Record<string, string> = {
  combat: Colors.red,
  elite: Colors.purple,
  boss: '#ff2200',
  shop: Colors.yellow,
  rest: Colors.green,
  event: Colors.cyan,
};

export const NODE_ICONS: Record<string, string> = {
  combat: '⚔',
  elite: '☠',
  boss: '💀',
  shop: '🛒',
  rest: '🛏',
  event: '❓',
};

export const CARD_TYPE_COLORS: Record<string, string> = {
  code: Colors.cyan,
  firewall: Colors.blue,
  daemon: Colors.purple,
  virus: Colors.green,
  ice: '#88ccff',
  protocol: Colors.yellow,
  blue: '#4488ff',
};
