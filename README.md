# TechnoRouge

> Slay the Spire meets Cyberpunk — a roguelike deckbuilder with deep class identity, neon-drenched atmosphere, and meaningful run-to-run progression.

Navigate a corrupted megacorp's network, floor by floor, hacking your way through ICE, daemons, and firewalls. Each run feels different because of your class, your deck, and your relics.

## Tech Stack

- **Phaser 3** — canvas background, particles, tweens
- **TypeScript** — full type safety
- **Vite** — fast dev/build
- **DOM overlay** — all UI rendered as HTML/CSS over the canvas

## Classes

| Class | HP | Playstyle |
|-------|----|-----------|
| **Netrunner** | 75 | Balanced — strong fundamentals, versatile |
| **Cracker** | 65 | Aggressive — fast damage, glass cannon |
| **Guardian** | 90 | Defensive — walls of block, outlast |
| **Infectant** | 70 | DoT — poison and debuff, whittle them down |

Each class has a unique 10-card starting deck. Unlock new class-specific cards by clearing acts.

## Currency

**CryptoBytes** — earned from combat, spent at shops. Lost on death.

## Roadmap (Summary)

| Phase | What |
|-------|------|
| **0** ✅ | Foundation cleanup — integrate unused systems, fix targeting, exhaust, hand limits |
| **1** | Roguelike loop — branching map, encounters, post-combat card rewards |
| **2** | Economy & shops — CryptoBytes, card removal, Ram Chip consumables |
| **3** | Relics — passive modifiers that define builds (30-40 total) |
| **4** | Content expansion — 60-80 cards, 15-20 enemies, 3 bosses, events, rest sites |
| **5** | Visual overhaul — parallax backgrounds, card art, enemy sprites, animations |
| **6** | Audio — synthwave soundtrack, combat music, full SFX suite |
| **7** | Meta progression — unlockable cards/relics/classes, difficulty modifiers |
| **8** | Polish & release — tutorial, save/load, mobile, accessibility |

Each class has its own milestone for tracking card and balance work.

**Minimum viable game = Phases 0-3.**

## Getting Started

```bash
npm install
npm run dev
```

## Development

See `.opencode.md` for the full detailed roadmap (gitignored, safe to iterate on).
