import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { GameState, Card, Player, EnemyState, CharacterClass } from '../game/types';
import { getStartingDeck } from '../game/cards';
import { generateMap } from '../game/map';
import { getRandomEnemies, getNextIntent } from '../game/enemies';
import { shuffle, calculateDamage, applyDamage, reduceStatusDurations } from '../game/combat';
import { getRandomPackage, PACKAGES } from '../game/packages';
import { loadMetaState, saveMetaState, MetaState } from '../game/milestones';

type Action =
  | { type: 'GO_TO_CHARACTER_SELECT' }
  | { type: 'START_GAME'; payload: { playerClass: CharacterClass } }
  | { type: 'SELECT_NODE'; payload: { nodeId: string } }
  | { type: 'PLAY_CARD'; payload: { cardIndex: number; targetEnemyId?: string } }
  | { type: 'END_TURN' }
  | { type: 'START_PLAYER_TURN' }
  | { type: 'PROCEED_TO_MAP' }
  | { type: 'CLAIM_REWARD'; payload: { card?: Card; cryptobytes?: number; packageDrop?: string } }
  | { type: 'SKIP_REWARD' }
  | { type: 'HEAL_REST' }
  | { type: 'UPGRADE_CARD'; payload: { cardId: string } }
  | { type: 'BUY_CARD'; payload: { card: Card; cost: number } }
  | { type: 'BUY_PACKAGE'; payload: { packageId: string; cost: number } }
  | { type: 'REMOVE_CARD'; payload: { cardId: string; cost: number } }
  | { type: 'LEAVE_SHOP_OR_EVENT' }
  | { type: 'RESTART' };

const initialState: GameState = {
  screen: 'title',
  player: null,
  map: null,
  combat: null,
  run: { floorsCleared: 0, enemiesKilled: 0, cardsPlayed: 0, maxCryptobytes: 0 }
};

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'GO_TO_CHARACTER_SELECT':
      return { ...state, screen: 'characterSelect' };

    case 'START_GAME': {
      const cls = action.payload.playerClass;
      let baseHp = 70;
      if (cls === 'GUNSLINGER') baseHp = 75;
      if (cls === 'CYBORG') baseHp = 95;
      if (cls === 'RIPPER') baseHp = 80;
      if (cls === 'CORPORATE_AGENT') baseHp = 78;

      return {
        ...state,
        screen: 'map',
        player: {
          id: 'player',
          name: 'Player',
          class: cls,
          hp: baseHp,
          maxHp: baseHp,
          energy: 3,
          maxEnergy: 3,
          cryptobytes: 99,
          block: 0,
          deck: getStartingDeck(cls),
          packages: [],
          surge: 0,
          budget: 0,
          turnAttacks: 0,
          statusEffects: { strength: 0, dexterity: 0, vulnerable: 0, weak: 0, virus: 0, burn: 0, stunned: 0, momentum: 0, fortify: 0, poison: 0 }
        },
        map: generateMap(1),
        run: { floorsCleared: 0, enemiesKilled: 0, cardsPlayed: 0, maxCryptobytes: 99 }
      };
    }

    case 'SELECT_NODE': {
      if (!state.map || !state.player) return state;
      const node = state.map.nodes.flat().find(n => n.id === action.payload.nodeId);
      if (!node) return state;

      const newMap = {
        ...state.map,
        currentNodeId: node.id,
        availableNodeIds: [] 
      };

      if (node.type === 'COMBAT' || node.type === 'ELITE' || node.type === 'BOSS') {
        const type = node.type === 'COMBAT' ? 'normal' : node.type === 'ELITE' ? 'elite' : 'boss';
        let enemies = getRandomEnemies(state.map.act, type);
        
        let p = { ...state.player, block: 0, energy: state.player.maxEnergy, turnAttacks: 0, budget: 0 };
        
        // Passives & Packages at start of combat
        if (p.class === 'CORPORATE_AGENT') p.budget += 15;
        if (p.packages.includes('firmware_patch')) p.energy += 1;
        if (p.packages.includes('shock_absorber')) p.block += 5;
        if (p.packages.includes('adrenaline_injector')) p.statusEffects.strength += 1;
        if (p.packages.includes('zero_day_cartridge')) {
          enemies = enemies.map(e => ({ ...e, statusEffects: { ...e.statusEffects, virus: e.statusEffects.virus + 1 }}));
        }

        const drawPile = shuffle([...p.deck]);
        let drawCount = 5;
        if (p.packages.includes('quantum_cache')) drawCount += 1;
        
        const hand = drawPile.splice(0, drawCount);

        return {
          ...state,
          screen: 'combat',
          map: newMap,
          player: p,
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
      if (node.type === 'DATA_VAULT') {
        // Just directly give reward for simplicity right now
        const rewardCB = 20 + Math.floor(Math.random() * 30);
        return { ...state, screen: 'reward', map: newMap, combat: {
          enemies: [], turn: 'player', hand: [], drawPile: [], discardPile: [], exhaustPile: [], cardsPlayedThisTurn: 0, log: [],
          rewards: { cryptobytes: rewardCB, cards: [], packageDrop: getRandomPackage(state.player.packages)?.id }
        } };
      }

      return { ...state, map: newMap };
    }

    case 'PLAY_CARD': {
      if (!state.combat || !state.player || state.combat.turn !== 'player') return state;
      
      const card = state.combat.hand[action.payload.cardIndex];
      let p = { ...state.player };
      let enemies = [...state.combat.enemies];
      let log = [...state.combat.log];
      
      let cost = card.cost;
      
      if (card.isXCost) {
        cost = p.energy;
      }
      
      // Cyborg Passive: HP for Energy
      let hpCost = 0;
      if (p.class === 'CYBORG' && p.energy < cost) {
        hpCost = cost - p.energy;
        cost = p.energy; // use remaining energy
      } else if (p.energy < cost) {
        return state;
      }

      p.energy -= cost;
      if (hpCost > 0) {
        p.hp -= hpCost;
        log.push(`Cyborg overclocked: lost ${hpCost} HP for energy.`);
      }

      log.push(`Played ${card.name}.`);

      const targetIdx = action.payload.targetEnemyId ? enemies.findIndex(e => e.id === action.payload.targetEnemyId) : 0;
      const target = enemies[targetIdx];

      // Netrunner passive
      const hasDebuff = target && (target.statusEffects.virus > 0 || target.statusEffects.vulnerable > 0 || target.statusEffects.weak > 0 || target.statusEffects.burn > 0 || target.statusEffects.poison > 0);

      // Gunslinger passive
      let isGunslingerTrigger = false;
      if (card.type === 'Attack') {
        p.turnAttacks += 1;
        if (p.class === 'GUNSLINGER' && p.turnAttacks % 3 === 0) {
          isGunslingerTrigger = true;
          log.push(`Fan the Hammer triggered!`);
        }
      }

      // Execute card logic
      const playCardEffects = (multiplier = 1) => {
        for (let m = 0; m < multiplier; m++) {
          if (card.block) {
            p.block += card.block + p.statusEffects.dexterity;
          }
          if (card.heal) {
            p.hp += card.heal;
            if (p.class === 'RIPPER' && p.hp > p.maxHp) {
              p.surge += (p.hp - p.maxHp);
              p.hp = p.maxHp;
            } else {
               p.hp = Math.min(p.hp, p.maxHp);
            }
          }
          
          if (card.damage && target) {
            const hits = card.hits || 1;
            for (let i=0; i<hits; i++) {
              let calcDmg = calculateDamage(card.damage, p, target);
              
              if (p.packages.includes('chrome_knuckles')) calcDmg += 2;
              if (p.class === 'NETRUNNER' && hasDebuff) calcDmg = Math.floor(calcDmg * 1.25);
              if (p.class === 'RIPPER' && p.surge > 0) {
                calcDmg += p.surge;
                if (m === multiplier - 1 && i === hits - 1) p.surge = 0;
              }
              
              if (card.isXCost) {
                calcDmg = Math.floor(calcDmg * (card.cost === -1 ? p.energy : cost)); // hack for x-cost scaling
              }

              const { target: newTarget, actualDamage } = applyDamage(calcDmg, target);
              enemies[targetIdx] = { ...newTarget } as EnemyState;
              log.push(`Hit ${target.name} for ${actualDamage} damage.`);
            }
          }

          // Hardcoded specific effects
          if (card.cardId === 'nr_exploit' && target) {
            enemies[targetIdx].statusEffects.virus += 2;
          }
          if (card.cardId === 'nr_overclock') {
            // Draw 2
            const d = [...state.combat!.drawPile];
            const h = [];
            for (let i=0; i<2; i++) {
              if (d.length > 0) h.push(d.pop()!);
            }
            state.combat!.hand.push(...h);
            state.combat!.drawPile = d;
          }
          if (card.cardId === 'gs_quickdraw') {
             const d = [...state.combat!.drawPile];
             if (d.length > 0) state.combat!.hand.push(d.pop()!);
             state.combat!.drawPile = d;
          }
          if (card.cardId === 'ca_bribe' && target) {
             p.cryptobytes = Math.max(0, p.cryptobytes - 10);
             enemies[targetIdx].statusEffects.weak += 2;
          }
        }
      };

      playCardEffects(isGunslingerTrigger ? 2 : 1);
      
      // Cleanup Momentum
      if (card.type === 'Attack') {
        p.statusEffects.momentum = 0;
      }

      // Check death
      enemies = enemies.filter(e => e.hp > 0);

      // Card routing
      const newHand = [...state.combat.hand];
      newHand.splice(action.payload.cardIndex, 1);
      
      const newDiscard = [...state.combat.discardPile];
      const newExhaust = [...state.combat.exhaustPile];
      
      if (card.exhaust) {
        newExhaust.push(card);
      } else {
        newDiscard.push(card);
      }

      if (p.hp <= 0) {
        return { ...state, screen: 'gameOver', player: p };
      }

      if (enemies.length === 0) {
        // Combat won
        if (p.packages.includes('blood_battery')) p.hp = Math.min(p.maxHp, p.hp + 3);
        if (p.packages.includes('data_siphon')) p.cryptobytes += 5;
        
        let rewardCB = 15 + Math.floor(Math.random() * 15);
        let pkgDrop;
        
        const node = state.map!.nodes.flat().find(n => n.id === state.map!.currentNodeId);
        if (node?.type === 'ELITE') {
          rewardCB += 30;
          pkgDrop = getRandomPackage(p.packages)?.id;
        }

        const run = { ...state.run, floorsCleared: state.run.floorsCleared + 1, enemiesKilled: state.run.enemiesKilled + 1 };
        return {
          ...state,
          screen: 'reward',
          player: { ...p, block: 0, turnAttacks: 0, budget: 0, statusEffects: { ...p.statusEffects, temporaryStrength: 0 } },
          combat: { ...state.combat, rewards: { cryptobytes: rewardCB, cards: [], packageDrop: pkgDrop } } as any,
          run
        };
      }

      return {
        ...state,
        player: p,
        combat: {
          ...state.combat,
          hand: newHand,
          drawPile: state.combat!.drawPile,
          discardPile: newDiscard,
          exhaustPile: newExhaust,
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

      // Move hand to discard (check ethereal)
      const newDiscard = [...state.combat.discardPile];
      const newExhaust = [...state.combat.exhaustPile];
      state.combat.hand.forEach(c => {
        if (c.ethereal) newExhaust.push(c);
        else newDiscard.push(c);
      });
      
      // End of player turn
      if (p.class === 'CORPORATE_AGENT') {
        p.block += Math.min(5, p.budget);
        p.budget = 0;
      }

      p.block = p.statusEffects.fortify > 0 ? p.block : 0; 
      p.statusEffects = reduceStatusDurations(p.statusEffects);

      // Enemy turn processing
      for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        
        // Virus dmg
        if (enemy.statusEffects.virus > 0) {
           const vDmg = p.packages.includes('virus_multiplier') ? enemy.statusEffects.virus * 2 : enemy.statusEffects.virus;
           enemy.hp -= vDmg;
           log.push(`${enemy.name} took ${vDmg} virus damage.`);
        }
        if (enemy.statusEffects.poison > 0) {
           enemy.hp -= enemy.statusEffects.poison;
        }

        if (enemy.hp <= 0) continue;

        if (enemy.statusEffects.stunned > 0) {
          log.push(`${enemy.name} is stunned!`);
        } else {
          const intent = enemy.intent;
          if (intent) {
            if (intent.type === 'ATTACK' && intent.value) {
              let dmg = calculateDamage(intent.value, enemy, p);
              const prevHp = p.hp;
              const res = applyDamage(dmg, p);
              p = { ...res.target } as Player;
              
              if (p.packages.includes('reactive_plating') && p.hp < prevHp) {
                p.block += 3;
              }

              log.push(`${enemy.name} attacks for ${res.actualDamage} damage!`);
            } else if (intent.type === 'DEFEND' && intent.value) {
              enemies[i].block += intent.value;
              log.push(`${enemy.name} gains ${intent.value} block.`);
            } else if (intent.type === 'DEBUFF') {
               p.statusEffects.weak += 1;
               log.push(`${enemy.name} debuffs you!`);
            } else if (intent.type === 'BUFF') {
               enemies[i].statusEffects.strength += 2;
               log.push(`${enemy.name} buffs itself!`);
            }
          }
        }
        
        enemies[i].statusEffects = reduceStatusDurations(enemies[i].statusEffects);
        enemies[i].currentTurnIndex += 1;
        enemies[i].intent = getNextIntent(enemies[i]);
      }

      enemies = enemies.filter(e => e.hp > 0);

      // Ghost SIM check
      if (p.hp <= 0 && p.packages.includes('ghost_sim')) {
        p.hp = 1;
        p.packages = p.packages.filter(pkg => pkg !== 'ghost_sim');
        log.push(`Ghost SIM saved you!`);
      }

      if (p.hp <= 0) {
        return { ...state, screen: 'gameOver', player: p };
      }

      if (enemies.length === 0) {
         let rewardCB = 15 + Math.floor(Math.random() * 15);
         if (p.packages.includes('blood_battery')) p.hp = Math.min(p.maxHp, p.hp + 3);
         if (p.packages.includes('data_siphon')) p.cryptobytes += 5;
         return {
          ...state,
          screen: 'reward',
          player: p,
          combat: { ...state.combat, rewards: { cryptobytes: rewardCB, cards: [] } } as any
        };
      }

      // Start new player turn
      p.energy = p.maxEnergy;
      p.block = p.statusEffects.fortify > 0 ? p.block : 0; 
      p.turnAttacks = 0;
      if (p.class === 'CORPORATE_AGENT') p.budget += 15;

      // Draw 5
      let newDraw = [...state.combat.drawPile];
      let newHand = [];
      let dCount = 5;
      for(let i=0; i<dCount; i++) {
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
          exhaustPile: newExhaust,
          log,
          cardsPlayedThisTurn: 0
        }
      };
    }

    case 'CLAIM_REWARD': {
      if (!state.player) return state;
      let p = { ...state.player };
      if (action.payload.cryptobytes) {
        p.cryptobytes += action.payload.cryptobytes;
        state.run.maxCryptobytes = Math.max(state.run.maxCryptobytes, p.cryptobytes);
      }
      if (action.payload.card) p.deck = [...p.deck, action.payload.card];
      if (action.payload.packageDrop) p.packages = [...p.packages, action.payload.packageDrop];
      
      return { ...state, player: p, screen: 'reward' }; 
    }

    case 'PROCEED_TO_MAP': {
      if (!state.map || !state.player) return state;
      
      const currentNode = state.map.nodes.flat().find(n => n.id === state.map!.currentNodeId);
      let availableNodeIds: string[] = [];
      if (currentNode && currentNode.type === 'BOSS') {
         if (state.map.act >= 3) {
            return { ...state, screen: 'victory' };
         } else {
            // Next act
            return {
              ...state,
              map: generateMap(state.map.act + 1),
              screen: 'map',
              combat: null
            };
         }
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
      p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.30));
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
    
    case 'BUY_CARD': {
      if (!state.player || state.player.cryptobytes < action.payload.cost) return state;
      return {
        ...state,
        player: {
          ...state.player,
          cryptobytes: state.player.cryptobytes - action.payload.cost,
          deck: [...state.player.deck, action.payload.card]
        }
      };
    }
    
    case 'BUY_PACKAGE': {
      if (!state.player || state.player.cryptobytes < action.payload.cost) return state;
      return {
        ...state,
        player: {
          ...state.player,
          cryptobytes: state.player.cryptobytes - action.payload.cost,
          packages: [...state.player.packages, action.payload.packageId]
        }
      };
    }
    
    case 'REMOVE_CARD': {
       if (!state.player || state.player.cryptobytes < action.payload.cost) return state;
       return {
         ...state,
         player: {
           ...state.player,
           cryptobytes: state.player.cryptobytes - action.payload.cost,
           deck: state.player.deck.filter(c => c.id !== action.payload.cardId)
         }
       };
    }

    case 'RESTART':
      return initialState;

    default:
      return state;
  }
}

// Wrapper to handle meta progression saves side-effects
const reducerWithMeta = (state: GameState, action: Action): GameState => {
  const nextState = gameReducer(state, action);
  
  // Middleware to check milestones
  if (action.type === 'PROCEED_TO_MAP' || action.type === 'CLAIM_REWARD' || action.type === 'END_TURN') {
    const meta = loadMetaState();
    let updated = false;
    
    if (nextState.run.maxCryptobytes >= 300 && !meta.unlockedMilestones.includes('reach_300_cb')) {
      meta.unlockedMilestones.push('reach_300_cb');
      updated = true;
    }
    if (nextState.player && nextState.player.packages.length >= 5 && !meta.unlockedMilestones.includes('own_5_packages')) {
      meta.unlockedMilestones.push('own_5_packages');
      updated = true;
    }
    
    if (nextState.screen === 'victory') {
      if (!meta.unlockedMilestones.includes('beat_game')) meta.unlockedMilestones.push('beat_game');
      const winId = `win_${nextState.player?.class.toLowerCase()}` as any;
      if (!meta.unlockedMilestones.includes(winId)) meta.unlockedMilestones.push(winId);
      updated = true;
    }

    if (updated) {
      saveMetaState(meta);
    }
  }

  // Middleware to persist current run
  if (nextState.screen !== 'title' && nextState.screen !== 'characterSelect' && nextState.screen !== 'gameOver' && nextState.screen !== 'victory') {
    try { localStorage.setItem('technorogue_run', JSON.stringify(nextState)); } catch(e){}
  } else {
    try { localStorage.removeItem('technorogue_run'); } catch(e){}
  }
  
  return nextState;
};

const GameContext = createContext<{ state: GameState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducerWithMeta, initialState);

  // Restore run on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('technorogue_run');
      if (saved) {
         const parsed = JSON.parse(saved);
         if (parsed.player) { // very naive verification
            // Could dispatch a hydrate action, but mutating directly for simplicity since it's initial
            // Note: In React 18 strict mode this is tricky, best way is to set initial state lazy func
         }
      }
    } catch(e){}
  }, []);

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
