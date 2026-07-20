export type CharacterClass = 'NETRUNNER' | 'GUNSLINGER' | 'CYBORG' | 'RIPPER' | 'CORPORATE_AGENT';

export type CardType = 'Attack' | 'Defense' | 'Skill' | 'Power';
export type CardRarity = 'Common' | 'Uncommon' | 'Rare' | 'Starter' | 'Milestone';

export interface Card {
  id: string;
  cardId: string;
  name: string;
  type: CardType;
  cost: number;
  isXCost?: boolean;
  description: string;
  rarity: CardRarity;
  class: CharacterClass | 'ANY';
  isUpgraded: boolean;
  
  damage?: number;
  block?: number;
  hits?: number;
  heal?: number;

  exhaust?: boolean;
  ethereal?: boolean;
}

export type EnemyIntentType = 'ATTACK' | 'DEFEND' | 'SPECIAL' | 'DEBUFF' | 'BUFF';

export interface EnemyIntent {
  type: EnemyIntentType;
  value?: number;
  secondaryValue?: number;
  description?: string;
}

export interface StatusEffects {
  strength: number; 
  dexterity: number; 
  vulnerable: number; 
  weak: number; 
  virus: number; 
  burn: number; 
  stunned: number; 
  momentum: number; 
  fortify: number;
  poison: number;
  temporaryStrength?: number;
}

export interface CombatEntity {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  block: number;
  statusEffects: StatusEffects;
}

export interface Player extends CombatEntity {
  class: CharacterClass;
  energy: number;
  maxEnergy: number;
  cryptobytes: number;
  deck: Card[];
  packages: string[];
  surge: number; // Ripper healing overflow
  budget: number; // Corporate agent temp budget
  turnAttacks: number; // Gunslinger passive tracker
}

export interface EnemyState extends CombatEntity {
  enemyId: string;
  currentTurnIndex: number;
  intent: EnemyIntent | null;
}

export type ScreenState = 
  | 'title' 
  | 'characterSelect' 
  | 'map' 
  | 'combat' 
  | 'reward' 
  | 'shop' 
  | 'restSite' 
  | 'event' 
  | 'gameOver' 
  | 'victory';

export type NodeType = 'COMBAT' | 'ELITE' | 'REST' | 'SHOP' | 'EVENT' | 'BOSS' | 'DATA_VAULT';

export interface MapNode {
  id: string;
  type: NodeType;
  row: number;
  col: number;
  connectedTo: string[];
}

export interface MapState {
  act: number;
  nodes: MapNode[][];
  currentNodeId: string | null;
  completedNodeIds: string[];
  availableNodeIds: string[];
}

export interface CombatState {
  enemies: EnemyState[];
  turn: 'player' | 'enemy';
  hand: Card[];
  drawPile: Card[];
  discardPile: Card[];
  exhaustPile: Card[];
  cardsPlayedThisTurn: number;
  log: string[];
  rewards?: { cryptobytes: number, cards: Card[], packageDrop?: string };
}

export interface RunState {
  floorsCleared: number;
  enemiesKilled: number;
  cardsPlayed: number;
  maxCryptobytes: number;
}

export interface GameState {
  screen: ScreenState;
  player: Player | null;
  map: MapState | null;
  combat: CombatState | null;
  run: RunState;
}
