# Shared Game Logic + Seeded RNG

## Goal

Eliminate duplicated game logic between web (`techno-rogue`) and mobile (`techno-rogue-mobile`) by extracting it into a shared `lib/game-logic` workspace package. Add seeded RNG so runs are fully reproducible (map + card draws + enemy selection).

## Current State

- 8 files are byte-for-byte identical across both projects
- `Game.ts` diverged: mobile has extra features (`advanceMap`, `currentNodeType`, pre-combat intent selection, auto CryptoByte awarding)
- `Player.ts` now identical (both have `drawFromDiscard`, `exhaustCard`, `discardToHandSize`)
- `map.ts` identical logic, web has comments
- `cards.ts` identical data, different formatting

## Architecture

```
lib/game-logic/
  src/
    rng.ts               ← NEW: Seeded PRNG (mulberry32)
    data/cards.ts
    data/classes.ts
    data/enemies.ts
    data/map.ts           ← updated to use seeded RNG
    entities/Card.ts
    entities/Player.ts
    entities/Enemy.ts
    entities/Effect.ts
    systems/DeckSystem.ts ← updated to use seeded RNG
    systems/EffectSystem.ts
    utils/helpers.ts
    Game.ts               ← canonical GameState, uses seeded RNG
    index.ts              ← barrel exports
  package.json            ← @workspace/game-logic
  tsconfig.json
```

## Seeded RNG Design

**Algorithm:** mulberry32 — fast, simple, 32-bit seed, good distribution.

**Interface:**
```typescript
class SeededRNG {
  constructor(seed: number);
  next(): number;          // returns 0..1
  nextInt(min: number, max: number): number;
  shuffle<T>(array: T[]): T[];
}
```

**Integration points:**
- `Game.startRun(seed?)` — accepts optional seed, generates one if not provided
- `generateMap(act, rng)` — passes rng to map generation
- `DeckSystem.shuffleDeck(deck, rng)` — seeded shuffle
- `shuffleArray(arr, rng)` — helper updated to accept rng
- Enemy intent selection uses rng
- Enemy count selection uses rng

**Seed display:** The seed number is exposed via `Game.seed` so both UIs can show it (for sharing/debugging).

## Source of Truth

Mobile version's `Game.ts` is canonical (has the extra features). Merge the web's `damage_dealt` event emission into it.

## Files to Create

| File | Purpose |
|---|---|
| `lib/game-logic/package.json` | Package manifest, depends on nothing (pure TS) |
| `lib/game-logic/tsconfig.json` | Extends root tsconfig.base.json |
| `lib/game-logic/src/index.ts` | Barrel exports for all public types + Game instance |
| `lib/game-logic/src/rng.ts` | SeededRNG class |

## Files to Move (from mobile/game/)

All files move to `lib/game-logic/src/` with import path updates:
- `data/cards.ts`, `data/classes.ts`, `data/enemies.ts`, `data/map.ts`
- `entities/Card.ts`, `entities/Player.ts`, `entities/Enemy.ts`, `entities/Effect.ts`
- `systems/DeckSystem.ts`, `systems/EffectSystem.ts`
- `utils/helpers.ts`
- `Game.ts`

## Files to Modify

### Web (`artifacts/techno-rogue/`)
- Delete: `src/data/`, `src/entities/`, `src/systems/`, `src/utils/`, `src/Game.ts`
- Update `package.json`: add `"@workspace/game-logic": "workspace:*"`
- Update all scene files + ui files: change imports to `@workspace/game-logic`
- `src/main.ts`: import `Game` from shared package

### Mobile (`artifacts/techno-rogue-mobile/`)
- Delete: entire `game/` directory
- Update `package.json`: add `"@workspace/game-logic": "workspace:*"`
- Update `app/index.tsx`, `app/map.tsx`, `app/combat.tsx`: change imports
- Update `context/GameContext.tsx`: import `Game` from shared package

### Root
- `pnpm-workspace.yaml`: `lib/*` already covered

## Game.ts Changes (merge)

The canonical `Game.ts` will:
1. Accept `seed?: number` in `startRun()` — generates random seed if omitted
2. Store `seed: number` and `rng: SeededRNG` as instance fields
3. Pass `this.rng` to `generateMap`, `spawnEnemies`, `shuffleArray` calls
4. Include `advanceMap()`, `currentNodeType`, pre-combat intent selection (from mobile)
5. Include `damage_dealt` event emission (from web)

## Map.ts Changes

- `generateMap(act, rng)` — accepts SeededRNG parameter
- All `Math.random()` calls replaced with `rng.next()`
- `shuffleArray` calls use `rng.shuffle()`

## DeckSystem.ts Changes

- `shuffleDeck(deck, rng)` — accepts SeededRNG parameter
- Fisher-Yates shuffle using `rng.nextInt()`

## Player.ts Changes

- Player constructor accepts `rng: SeededRNG` parameter (passed from Game)
- `drawCards` passes rng to `DeckSystem.drawCards`
- `drawFromDiscard` uses `rng.nextInt()` instead of `Math.random()`
- `startNewTurn` passes rng to `drawCards` and `discardToHandSize`

## Testing Strategy

- Unit test: create two `SeededRNG` with same seed, verify identical sequences
- Unit test: `generateMap(1, rng1)` and `generateMap(1, rng2)` with same seed produce identical maps
- Integration: run a full combat with fixed seed, verify card draws are deterministic
- Both web and mobile should produce identical game states given the same seed and class choice
