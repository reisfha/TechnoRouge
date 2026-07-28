# Implementation Plan: Shared Game Logic + Seeded RNG

## Overview

Extract duplicated game logic into `lib/game-logic`, add seeded RNG, rewire both projects to import from it.

---

## Step 1: Create `lib/game-logic` package scaffold

Create:
- `lib/game-logic/package.json` — name `@workspace/game-logic`, private, type module, exports `./src/index.ts`
- `lib/game-logic/tsconfig.json` — extends `../../tsconfig.base.json`, paths for self-imports
- `lib/game-logic/src/index.ts` — barrel re-exports

## Step 2: Create `lib/game-logic/src/rng.ts`

Seeded PRNG using mulberry32:
```typescript
export class SeededRNG {
  private state: number;
  constructor(seed: number) { this.state = seed | 0; }
  next(): number { /* mulberry32 step */ }
  nextInt(min: number, max: number): number { /* floor of next() * range + min */ }
  shuffle<T>(array: T[]): T[] { /* Fisher-Yates using nextInt */ }
}
```

## Step 3: Move game logic files from `mobile/game/` to `lib/game-logic/src/`

Copy these files (source of truth = mobile version):
- `data/cards.ts`, `data/classes.ts`, `data/enemies.ts`
- `entities/Card.ts`, `entities/Player.ts`, `entities/Enemy.ts`, `entities/Effect.ts`
- `systems/DeckSystem.ts`, `systems/EffectSystem.ts`
- `utils/helpers.ts`

All internal imports stay as relative paths — they work within the package.

## Step 4: Move + merge `Game.ts`

Copy mobile `game/Game.ts` → `lib/game-logic/src/Game.ts`, then apply:
1. Import `SeededRNG` from `./rng`
2. Add `seed: number` and `rng: SeededRNG` fields
3. `startRun(className, seed?)` — generate seed via `Math.floor(Math.random() * 2**32)` if omitted, create `this.rng = new SeededRNG(seed)`
4. Pass `this.rng` to `generateMap`, `spawnEnemies`, `shuffleArray` calls
5. Add `damage_dealt` event emission in `resolveEffect` (from web version)

## Step 5: Move + update `data/map.ts`

Copy mobile `game/data/map.ts` → `lib/game-logic/src/data/map.ts`, then:
1. Add `rng: SeededRNG` parameter to `generateMap(act, rng?)`
2. Replace all `Math.random()` → `rng.next()`
3. Replace `shuffleArray` calls → `rng.shuffle()`
4. Keep the web version's comments (restore them)

## Step 6: Move + update `systems/DeckSystem.ts`

Copy → `lib/game-logic/src/systems/DeckSystem.ts`, then:
1. Add `rng?: SeededRNG` parameter to `shuffleDeck`
2. If rng provided, use Fisher-Yates with `rng.nextInt()`; otherwise fallback to `Math.random()`

## Step 7: Move + update `entities/Player.ts`

Copy mobile `game/entities/Player.ts` → `lib/game-logic/src/entities/Player.ts`, then:
1. Add `rng?: SeededRNG` field (set by Game after construction)
2. `drawFromDiscard` — use `this.rng.nextInt()` if rng set, else `Math.random()`
3. `startNewTurn` — pass rng to DeckSystem calls

## Step 8: Update `data/enemies.ts` intent selection

Enemy's `chooseIntent()` method — if it uses `Math.random()`, accept rng parameter or store rng reference. Check Enemy.ts for `Math.random()` usage.

## Step 9: Update `utils/helpers.ts`

`shuffleArray` — add optional `rng?: SeededRNG` parameter. If provided, use `rng.shuffle()`. If not, use `Math.random()`.

## Step 10: Wire up `lib/game-logic/src/index.ts`

Export all public types + the `Game` singleton:
```typescript
export { Game, type TurnPhase, type GameEventType, type GameEventCallback } from './Game';
export { SeededRNG } from './rng';
export { CARD_DEFINITIONS, type CardDefinition, type CardEffect, type CardType, type TargetType, type Rarity } from './data/cards';
export { CLASS_DEFINITIONS, type ClassDefinition } from './data/classes';
export { getEnemyDef, type EnemyDefinition, type EnemyIntent } from './data/enemies';
export { generateMap, getReachableNodes, advanceToNode, getNode, isMapComplete, type GameMap, type MapNode, type MapLayer, type NodeType } from './data/map';
export { DeckSystem } from './systems/DeckSystem';
export { EffectSystem } from './systems/EffectSystem';
export { Player } from './entities/Player';
export { Enemy } from './entities/Enemy';
export { CardInstance } from './entities/Card';
export { shuffleArray, generateId } from './utils/helpers';
```

## Step 11: Rewire web project imports

**13 files** in `artifacts/techno-rogue/src/` need import changes.

Pattern: replace relative game-logic imports with `@workspace/game-logic`:
- `import { Game } from '../Game'` → `import { Game } from '@workspace/game-logic'`
- `import { Player } from '../entities/Player'` → `import { Player } from '@workspace/game-logic'`
- `import { CLASS_DEFINITIONS } from '../data/classes'` → `import { CLASS_DEFINITIONS } from '@workspace/game-logic'`
- etc.

**Delete** after rewiring: `src/data/`, `src/entities/`, `src/systems/`, `src/utils/`, `src/Game.ts`

**Update** `package.json`: add `"@workspace/game-logic": "workspace:*"` to dependencies

## Step 12: Rewire mobile project imports

**4 files** outside `game/` need import changes:
- `context/GameContext.tsx`: `import { Game, GameEventType } from '../game/Game'` → `import { Game, GameEventType } from '@workspace/game-logic'`
- `app/index.tsx`: `import { CLASS_DEFINITIONS } from '../game/data/classes'` → `import { CLASS_DEFINITIONS } from '@workspace/game-logic'`
- `app/map.tsx`: `import { getReachableNodes } from '../game/data/map'` → `import { getReachableNodes } from '@workspace/game-logic'`

**Delete** entire `game/` directory.

**Update** `package.json`: add `"@workspace/game-logic": "workspace:*"` to dependencies

## Step 13: Install and verify

```bash
pnpm install
pnpm --filter @workspace/techno-rogue typecheck
pnpm --filter @workspace/techno-rogue-mobile typecheck
```

## Step 14: Test seeded RNG

- Unit: same seed → same shuffle output
- Integration: `Game.startRun('netrunner', 12345)` → identical map, card draws, enemy selection

## Execution Order

Steps 1-10 (create shared package) → Step 11 (rewire web) → Step 12 (rewire mobile) → Step 13 (install + typecheck) → Step 14 (test)
