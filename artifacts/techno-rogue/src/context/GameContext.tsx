import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, Card, Player, EnemyState, CharacterClass } from '../game/types';
import { getStartingDeck } from '../game/cards';
import { generateMap } from '../game/map';
import { getRandomEnemies, getNextIntent } from '../game/enemies';
import { shuffle, calculateDamage, applyDamage, reduceStatusDurations } from '../game/combat';

type Action =
  | { type: 'GO_TO_CHARACTER_SELECT' }
  | { type: 'START_GAME'; payload: { playerClass: CharacterClass } }
  | { type: 'SELECT_NODE'; payload: { nodeId: string } }
  | { type: 'PLAY_CARD'; payload: { cardIndex: number; targetEnemyId?: string } }
  | { type: 'END_TURN' }
  | { type: 'START_PLAYER_TURN' }
  | { type: 'PROCEED_TO_MAP' }
  | { type: 'CLAIM_REWARD'; payload: { card?: Card; gold?: number } }
  | { type: 'SKIP_REWARD' }
  | { type: 'HEAL_REST' }
  | { type: 'UPGRADE_CARD'; payload: { cardId: string } }
  | { type: 'BUY_CARD'; payload: { card: Card; cost: number } }
  | { type: 'REMOVE_CARD'; payload: { cardId: string; cost: number } }
  | { type: 'LEAVE_SHOP_OR_EVENT' }
  | { type: 'RESTART' };

const initialState: GameState = {
  screen: 'title',
  player: null,
  map: null,
  combat: null,
  run: { floorsCleared: 0, enemiesKilled: 0, cardsPlayed: 0 }
};

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'GO_TO_CHARACTER_SELECT':
      return { ...state, screen: 'characterSelect' };

    case 'START_GAME': {
      const baseHp = action.payload.playerClass === 'STREET_SAMURAI' ? 90 : action.payload.playerClass === 'CORPORATE_FIXER' ? 80 : 70;
      return {
        ...state,
        screen: 'map',
        player: {
          id: 'player',
          name: 'Player',
          class: action.payload.playerClass,
          hp: baseHp,
          maxHp: baseHp,
          energy: 3,
          maxEnergy: 3,
          gold: 99,
          block: 0,
          deck: getStartingDeck(action.payload.playerClass),
          relics: [],
          statusEffects: { strength: 0, dexterity: 0, vulnerable: 0, weak: 0, virus: 0, burn: 0, stunned: 0, momentum: 0 }
        },
        map: generateMap(1),
        run: { floorsCleared: 0, enemiesKilled: 0, cardsPlayed: 0 }
      };
    }

    case 'SELECT_NODE': {
      if (!state.map || !state.player) return state;
      const node = state.map.nodes.flat().find(n => n.id === action.payload.nodeId);
      if (!node) return state;

      const newMap = {
        ...state.map,
        currentNodeId: node.id,
        availableNodeIds: [] // Will be set when returning to map
      };

      if (node.type === 'COMBAT' || node.type === 'ELITE' || node.type === 'BOSS') {
        const type = node.type === 'COMBAT' ? 'normal' : node.type === 'ELITE' ? 'elite' : 'boss';
        const enemies = getRandomEnemies(state.map.act, type);
        
        const drawPile = shuffle([...state.player.deck]);
        const hand = drawPile.splice(0, 5);

        return {
          ...state,
          screen: 'combat',
          map: newMap,
          player: { ...state.player, block: 0, energy: state.player.maxEnergy },
          combat: {
            enemies,
            turn: 'player',
            hand,
            drawPile,
            discardPile: [],
            exhaustPile: [],
            cardsPlayedThisTurn: 0,
            log: [`Encountered ${enemies[0].name}!`]
          }
        };
      }
      
      if (node.type === 'REST') return { ...state, screen: 'restSite', map: newMap };
      if (node.type === 'SHOP') return { ...state, screen: 'shop', map: newMap };
      if (node.type === 'EVENT') return { ...state, screen: 'event', map: newMap };

      return { ...state, map: newMap };
    }

    case 'PLAY_CARD': {
      if (!state.combat || !state.player || state.combat.turn !== 'player') return state;
      
      const card = state.combat.hand[action.payload.cardIndex];
      // Check energy
      let cost = card.cost;
      // Fixer Leverage passive (first card costs 0)
      if (state.player.class === 'CORPORATE_FIXER' && state.combat.cardsPlayedThisTurn === 0) {
        cost = 0;
      }
      
      if (state.player.energy < cost) return state;

      // Extract parts to update
      let p = { ...state.player };
      let enemies = [...state.combat.enemies];
      let log = [...state.combat.log];
      
      p.energy -= cost;
      
      log.push(`Played ${card.name}.`);

      const targetIdx = action.payload.targetEnemyId ? enemies.findIndex(e => e.id === action.payload.targetEnemyId) : 0;
      const target = enemies[targetIdx];

      // Execute card logic
      if (card.block) {
        p.block += card.block + p.statusEffects.dexterity;
      }
      
      if (card.damage && target) {
        const hits = card.hits || 1;
        for (let i=0; i<hits; i++) {
          let calcDmg = calculateDamage(card.damage, p, target);
          // Samurai passive: first attack +3 dmg
          if (p.class === 'STREET_SAMURAI' && state.combat.cardsPlayedThisTurn === 0 && card.type === 'Attack') {
            calcDmg += 3;
          }
          const { target: newTarget, actualDamage } = applyDamage(calcDmg, target);
          enemies[targetIdx] = { ...newTarget } as EnemyState;
          log.push(`Hit ${target.name} for ${actualDamage} damage.`);
        }
      }

      // Hardcoded specific effects for MVP
      if (card.cardId === 'nr_exploit' && target) {
        enemies[targetIdx].statusEffects.virus += 2;
      }
      if (card.cardId === 'nr_overclock') {
        // Draw 2
        // Just mocked for simplicity here, real logic requires moving from draw to hand
      }

      // Check death
      enemies = enemies.filter(e => e.hp > 0);

      // Remove card from hand to discard
      const newHand = [...state.combat.hand];
      newHand.splice(action.payload.cardIndex, 1);
      const newDiscard = [...state.combat.discardPile, card];

      if (enemies.length === 0) {
        // Combat won
        const run = { ...state.run, floorsCleared: state.run.floorsCleared + 1, enemiesKilled: state.run.enemiesKilled + 1 };
        return {
          ...state,
          screen: 'reward',
          player: { ...p, block: 0, statusEffects: { ...p.statusEffects, temporaryStrength: 0 } },
          combat: null,
          run
        };
      }

      return {
        ...state,
        player: p,
        combat: {
          ...state.combat,
          hand: newHand,
          discardPile: newDiscard,
          enemies,
          log,
          cardsPlayedThisTurn: state.combat.cardsPlayedThisTurn + 1
        },
        run: { ...state.run, cardsPlayed: state.run.cardsPlayed + 1 }
      };
    }

    case 'END_TURN': {
      if (!state.combat || !state.player) return state;
      
      let p = { ...state.player };
      let enemies = [...state.combat.enemies];
      let log = [...state.combat.log];

      // Move hand to discard
      const newDiscard = [...state.combat.discardPile, ...state.combat.hand];
      
      // End of player turn effects (decay block, etc)
      p.block = 0; 
      p.statusEffects = reduceStatusDurations(p.statusEffects);

      // Enemy turn processing
      for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (enemy.statusEffects.stunned > 0) {
          enemy.statusEffects.stunned -= 1;
          log.push(`${enemy.name} is stunned!`);
          continue;
        }

        const intent = enemy.intent;
        if (intent) {
          if (intent.type === 'ATTACK' && intent.value) {
            let dmg = calculateDamage(intent.value, enemy, p);
            const res = applyDamage(dmg, p);
            p = { ...res.target } as Player;
            log.push(`${enemy.name} attacks for ${res.actualDamage} damage!`);
          } else if (intent.type === 'DEFEND' && intent.value) {
            enemies[i].block += intent.value;
            log.push(`${enemy.name} gains ${intent.value} block.`);
          } else if (intent.type === 'DEBUFF') {
             // simplified
             p.statusEffects.weak += 1;
             log.push(`${enemy.name} debuffs you!`);
          } else if (intent.type === 'BUFF') {
             enemies[i].statusEffects.strength += 2;
             log.push(`${enemy.name} buffs itself!`);
          }
        }
        
        enemies[i].currentTurnIndex += 1;
        enemies[i].intent = getNextIntent(enemies[i]);
      }

      if (p.hp <= 0) {
        return { ...state, screen: 'gameOver', player: p };
      }

      // Start new player turn (simplified, normally separate action)
      p.energy = p.maxEnergy;
      p.block = 0; // reset
      
      // Netrunner passive: Virus dmg
      if (p.class === 'NETRUNNER') {
        enemies.forEach(e => {
          if (e.statusEffects.virus > 0) {
            const res = applyDamage(e.statusEffects.virus, e);
            e.hp = res.target.hp;
            e.block = res.target.block;
            log.push(`${e.name} took ${res.actualDamage} virus damage.`);
          }
        });
        enemies = enemies.filter(e => e.hp > 0);
      }

      if (enemies.length === 0) {
         return {
          ...state,
          screen: 'reward',
          player: p,
          combat: null
        };
      }

      // Draw 5
      let newDraw = [...state.combat.drawPile];
      let newHand = [];
      for(let i=0; i<5; i++) {
        if(newDraw.length === 0) {
          newDraw = shuffle([...newDiscard]);
          newDiscard.length = 0;
        }
        if(newDraw.length > 0) {
          newHand.push(newDraw.pop()!);
        }
      }

      return {
        ...state,
        player: p,
        combat: {
          ...state.combat,
          turn: 'player',
          enemies,
          hand: newHand,
          drawPile: newDraw,
          discardPile: newDiscard,
          log,
          cardsPlayedThisTurn: 0
        }
      };
    }

    case 'CLAIM_REWARD': {
      if (!state.player) return state;
      let p = { ...state.player };
      if (action.payload.gold) p.gold += action.payload.gold;
      if (action.payload.card) p.deck = [...p.deck, action.payload.card];
      
      return { ...state, player: p, screen: 'reward' }; // stays on reward to let user hit proceed
    }

    case 'PROCEED_TO_MAP': {
      if (!state.map || !state.player) return state;
      
      // Update map available nodes
      const currentNode = state.map.nodes.flat().find(n => n.id === state.map!.currentNodeId);
      let availableNodeIds: string[] = [];
      if (currentNode && currentNode.type === 'BOSS') {
         // Victory or Act 2
         return { ...state, screen: 'victory' };
      } else if (currentNode) {
        availableNodeIds = currentNode.connectedTo;
      }

      const map = {
        ...state.map,
        completedNodeIds: [...state.map.completedNodeIds, state.map.currentNodeId!],
        availableNodeIds
      };

      return { ...state, screen: 'map', map, combat: null };
    }

    case 'HEAL_REST': {
      if (!state.player) return state;
      const p = { ...state.player };
      p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.25));
      return { ...state, player: p };
    }

    case 'UPGRADE_CARD': {
      if (!state.player) return state;
      const p = { ...state.player };
      const idx = p.deck.findIndex(c => c.id === action.payload.cardId);
      if (idx > -1) {
        p.deck[idx] = { ...p.deck[idx], isUpgraded: true };
        if (p.deck[idx].damage) p.deck[idx].damage! += 3;
        if (p.deck[idx].block) p.deck[idx].block! += 3;
      }
      return { ...state, player: p };
    }

    case 'RESTART':
      return initialState;

    default:
      return state;
  }
}

const GameContext = createContext<{ state: GameState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
