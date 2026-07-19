export type CharacterClass = 'NETRUNNER' | 'STREET_SAMURAI' | 'CORPORATE_FIXER';

export type CardType = 'Attack' | 'Defense' | 'Skill' | 'Power';
export type CardRarity = 'Common' | 'Uncommon' | 'Rare' | 'Starter';

export interface Card {
  id: string; // unique per instance in deck
  cardId: string; // base identifier
  name: string;
  type: CardType;
  cost: number;
  description: string;
  rarity: CardRarity;
  class: CharacterClass;
  isUpgraded: boolean;
  
  // Base values (can be modified by status effects)
  damage?: number;
  block?: number;
  hits?: number;
  
  // Custom play logic handled in reducer/actions
  // We'll use a string id to lookup effects
}

export type EnemyIntentType = 'ATTACK' | 'DEFEND' | 'SPECIAL' | 'DEBUFF' | 'BUFF';

export interface EnemyIntent {
  type: EnemyIntentType;
  value?: number;
  secondaryValue?: number;
  description?: string;
}

export interface StatusEffects {
  strength: number; // +dmg per stack
  dexterity: number; // +block per stack
  vulnerable: number; // take 50% more dmg (turns)
  weak: number; // deal 25% less dmg (turns)
  virus: number; // netrunner: 1 dmg per stack turn start
  burn: number; // dmg each turn (turns)
  stunned: number; // skip turn
  momentum: number; // next attack deals +X dmg
  temporaryStrength?: number; // strength that is removed at end of turn
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
  gold: number;
  deck: Card[];
  relics: string[];
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

export type NodeType = 'COMBAT' | 'ELITE' | 'REST' | 'SHOP' | 'EVENT' | 'BOSS';

export interface MapNode {
  id: string;
  type: NodeType;
  row: number;
  col: number;
  connectedTo: string[]; // ids of nodes in next row
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
  rewards?: { gold: number, cards: Card[] };
}

export interface RunState {
  floorsCleared: number;
  enemiesKilled: number;
  cardsPlayed: number;
}

export interface GameState {
  screen: ScreenState;
  player: Player | null;
  map: MapState | null;
  combat: CombatState | null;
  run: RunState;
}
