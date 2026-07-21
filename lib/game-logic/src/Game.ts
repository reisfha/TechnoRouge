import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { CardInstance } from './entities/Card';
import { CardEffect, TargetType } from './data/cards';
import { getEnemyDef } from './data/enemies';
import { CLASS_DEFINITIONS, ClassDefinition } from './data/classes';
import { shuffleArray } from './utils/helpers';
import { GameMap, generateMap, advanceToNode } from './data/map';
import { SeededRNG } from './rng';

export type TurnPhase =
  | 'init'
  | 'player_turn'
  | 'enemy_turn'
  | 'victory'
  | 'defeat';

export type GameEventType =
  | 'state_changed'
  | 'card_played'
  | 'turn_changed'
  | 'damage_dealt'
  | 'enemy_damaged'
  | 'player_hit'
  | 'game_over'
  | 'cryptoBytes_earned';

export type GameEventCallback = (event: GameEventType, data?: any) => void;

class GameState {
  player: Player | null = null;
  enemies: Enemy[] = [];
  phase: TurnPhase = 'init';
  turnNumber: number = 0;
  classDef: ClassDefinition | null = null;
  selectedTargetIndex: number = 0;
  cryptoBytes: number = 0;
  map: GameMap | null = null;
  currentNodeType: 'combat' | 'elite' | 'boss' = 'combat';
  seed: number = 0;
  rng: SeededRNG = new SeededRNG(0);
  private listeners: Map<GameEventType, GameEventCallback[]> = new Map();

  on(event: GameEventType, cb: GameEventCallback): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(cb);
  }

  off(event: GameEventType, cb: GameEventCallback): void {
    const cbs = this.listeners.get(event);
    if (cbs) this.listeners.set(event, cbs.filter((l) => l !== cb));
  }

  emit(event: GameEventType, data?: any): void {
    this.listeners.get(event)?.forEach((cb) => cb(event, data));
  }

  startRun(className: string, seed?: number): void {
    const classDef = CLASS_DEFINITIONS.find((c) => c.id === className);
    if (!classDef) throw new Error(`Unknown class: ${className}`);
    this.seed = seed ?? Math.floor(Math.random() * 2 ** 32);
    this.rng = new SeededRNG(this.seed);
    this.classDef = classDef;
    this.player = new Player(classDef.maxHp, classDef.maxEnergy, classDef.starterDeck);
    this.player.rng = this.rng;
    this.turnNumber = 0;
    this.phase = 'init';
    this.cryptoBytes = 0;
    this.map = null;
    this.emit('state_changed');
  }

  generateMap(act: number = 1): GameMap {
    this.map = generateMap(act, this.rng);
    return this.map;
  }

  advanceMap(nodeId: string): void {
    if (!this.map) return;
    this.map = advanceToNode(this.map, nodeId);
    this.emit('state_changed');
  }

  spawnEnemies(type: 'combat' | 'elite' | 'boss' = 'combat'): void {
    this.phase = 'init';
    this.currentNodeType = type;
    let pool: string[];
    if (type === 'boss') {
      pool = ['system_guardian'];
    } else if (type === 'elite') {
      pool = ['firewall_daemon', 'data_vampire', 'system_guardian'];
    } else {
      pool = ['patrol_ice', 'firewall_daemon', 'corrupted_node', 'data_vampire'];
    }
    const count = type === 'boss' ? 1 : 1 + this.rng.nextInt(0, 2);
    const shuffled = shuffleArray(pool, this.rng);
    this.enemies = shuffled.slice(0, count).map((id) => new Enemy(getEnemyDef(id), this.rng));
    this.selectedTargetIndex = 0;
  }

  awardCryptoBytes(type: 'combat' | 'elite' | 'boss'): void {
    const base = type === 'boss' ? 75 : type === 'elite' ? 25 : 10;
    const floorBonus = this.map?.currentNodeId
      ? (this.map.layers.findIndex((l) =>
          l.nodes.some((n) => n.id === this.map!.currentNodeId)
        ) || 0)
      : 0;
    const total = base + floorBonus;
    this.cryptoBytes += total;
    this.emit('cryptoBytes_earned', { amount: total });
  }

  startCombat(): void {
    for (const enemy of this.enemies) {
      enemy.chooseIntent();
    }
    this.startPlayerTurn();
  }

  startPlayerTurn(): void {
    if (!this.player) return;
    this.turnNumber++;
    this.phase = 'player_turn';
    this.player.resetBlock();
    this.player.startNewTurn();
    this.emit('turn_changed', { phase: 'player_turn', turn: this.turnNumber });
    this.emit('state_changed');
  }

  playCard(handIndex: number): boolean {
    if (!this.player || this.phase !== 'player_turn') return false;
    const card = this.player.playCard(handIndex);
    if (!card) return false;

    this.resolveCardEffects(card);

    if (card.def.exhaust) {
      this.player.exhaustPile.push(card);
    } else {
      this.player.discardPile.push(card);
    }
    this.emit('card_played', { card, handIndex });
    this.emit('state_changed');

    this.checkEnemyDeath();
    return true;
  }

  private resolveCardEffects(card: CardInstance): void {
    if (!this.player) return;
    const player = this.player;
    const defaultTarget = card.target as TargetType;

    for (const effect of card.effects) {
      this.resolveEffect(effect, player, defaultTarget);
    }
  }

  private resolveEffect(effect: CardEffect, player: Player, defaultTarget: TargetType): void {
    const playerStrength = player.getEffectStacks('strength');
    const target = (effect.target ?? defaultTarget) as TargetType;

    switch (effect.type) {
      case 'damage': {
        let dmg = effect.value ?? 0;
        dmg += playerStrength;
        const weakStacks = player.getEffectStacks('weak');
        if (weakStacks > 0) dmg = Math.floor(dmg * 0.75);
        if (target === 'all_enemies') {
          for (const enemy of this.enemies) {
            const actualDmg = enemy.takeDamage(dmg);
            this.emit('enemy_damaged', { enemy, damage: actualDmg });
            this.emit('damage_dealt', { source: 'player', target: enemy, damage: actualDmg });
          }
        } else {
          const enemyTarget = this.getSelectedEnemy();
          if (enemyTarget) {
            const actualDmg = enemyTarget.takeDamage(dmg);
            this.emit('enemy_damaged', { enemy: enemyTarget, damage: actualDmg });
            this.emit('damage_dealt', { source: 'player', target: enemyTarget, damage: actualDmg });
          }
        }
        break;
      }
      case 'aoe_damage': {
        let dmg = effect.value ?? 0;
        dmg += playerStrength;
        const weakStacks = player.getEffectStacks('weak');
        if (weakStacks > 0) dmg = Math.floor(dmg * 0.75);
        for (const enemy of this.enemies) {
          const actualDmg = enemy.takeDamage(dmg);
          this.emit('enemy_damaged', { enemy, damage: actualDmg });
          this.emit('damage_dealt', { source: 'player', target: enemy, damage: actualDmg });
        }
        break;
      }
      case 'block': {
        let block = effect.value ?? 0;
        const fortifyStacks = player.getEffectStacks('fortify');
        if (fortifyStacks > 0) block += fortifyStacks;
        player.gainBlock(block);
        break;
      }
      case 'gain_energy': {
        player.energy += effect.value ?? 0;
        break;
      }
      case 'draw': {
        player.drawCards(effect.value ?? 1);
        break;
      }
      case 'draw_from_discard': {
        player.drawFromDiscard(effect.value ?? 1);
        break;
      }
      case 'heal': {
        player.heal(effect.value ?? 0);
        break;
      }
      case 'apply_effect': {
        if (target === 'self') {
          player.addEffect(effect.effectType ?? 'buff', 'buff', effect.value ?? 1, effect.duration ?? 3);
        } else if (target === 'all_enemies') {
          for (const enemy of this.enemies) {
            enemy.addEffect(effect.effectType ?? 'debuff', 'debuff', effect.value ?? 1, effect.duration ?? 3);
          }
        } else {
          const enemyTarget = this.getSelectedEnemy();
          if (enemyTarget) {
            enemyTarget.addEffect(effect.effectType ?? 'debuff', 'debuff', effect.value ?? 1, effect.duration ?? 3);
          }
        }
        break;
      }
    }
  }

  endPlayerTurn(): void {
    if (!this.player || this.phase !== 'player_turn') return;
    this.phase = 'enemy_turn';
    this.player.discardHand();
    this.emit('turn_changed', { phase: 'enemy_turn' });
    this.emit('state_changed');
    this.executeEnemyTurn();
  }

  private executeEnemyTurn(): void {
    if (!this.player) return;

    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;
      const intent = enemy.chooseIntent();

      switch (intent.type) {
        case 'attack': {
          let dmg = intent.value ?? 0;
          dmg += enemy.strength;
          const weakStacks = enemy.getEffectStacks('weak');
          if (weakStacks > 0) dmg = Math.floor(dmg * 0.75);
          this.player.takeDamage(dmg);
          this.emit('player_hit', { damage: dmg, enemy });
          break;
        }
        case 'defend': {
          enemy.gainBlock(intent.value ?? 0);
          break;
        }
        case 'buff': {
          enemy.strength += intent.effectValue ?? 0;
          enemy.addEffect('strength', 'buff', intent.effectValue ?? 0, intent.duration ?? 99);
          break;
        }
        case 'debuff': {
          this.player.addEffect(intent.effectType ?? 'weak', 'debuff', intent.effectValue ?? 1, intent.duration ?? 2);
          break;
        }
        case 'status': {
          this.player.addEffect(intent.effectType ?? 'poison', 'debuff', intent.effectValue ?? 3, intent.duration ?? 3);
          break;
        }
      }
    }

    this.applyEndOfTurnEffects();
    this.endEnemyTurn();
  }

  private applyEndOfTurnEffects(): void {
    if (!this.player) return;
    const playerPoison = this.player.applyStatusDamage();
    if (playerPoison > 0) this.player.takeDamage(playerPoison);
    this.player.tickEffects();

    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;
      const enemyPoison = enemy.applyStatusDamage();
      if (enemyPoison > 0) enemy.takeDamage(enemyPoison);
      enemy.tickEffects();
    }
    this.checkEnemyDeath();
  }

  private endEnemyTurn(): void {
    if (!this.player) return;
    if (this.phase === 'defeat' || this.phase === 'victory') return;
    this.player.resetBlock();
    for (const enemy of this.enemies) {
      if (enemy.isAlive) enemy.resetBlock();
    }
    this.startPlayerTurn();
  }

  private checkEnemyDeath(): void {
    this.enemies = this.enemies.filter((e) => e.isAlive);
    if (this.enemies.length === 0 && this.phase !== 'victory') {
      this.phase = 'victory';
      this.awardCryptoBytes(this.currentNodeType);
      this.emit('game_over', { result: 'victory' });
      this.emit('state_changed');
    }
    if (this.player && !this.player.isAlive && this.phase !== 'defeat') {
      this.phase = 'defeat';
      this.emit('game_over', { result: 'defeat' });
      this.emit('state_changed');
    }
  }

  canPlayCard(handIndex: number): boolean {
    if (!this.player || this.phase !== 'player_turn') return false;
    if (handIndex < 0 || handIndex >= this.player.hand.length) return false;
    return this.player.energy >= this.player.hand[handIndex].cost;
  }

  setTarget(index: number): void {
    if (index >= 0 && index < this.enemies.length && this.enemies[index].isAlive) {
      this.selectedTargetIndex = index;
      this.emit('state_changed');
    }
  }

  getSelectedEnemy(): Enemy | null {
    if (this.enemies.length === 0) return null;
    if (this.selectedTargetIndex >= this.enemies.length) {
      this.selectedTargetIndex = 0;
    }
    const enemy = this.enemies[this.selectedTargetIndex];
    return enemy.isAlive ? enemy : null;
  }
}

export const Game = new GameState();
