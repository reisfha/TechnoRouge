import { Card, CharacterClass } from './types';

// Helper to generate a unique instance ID for cards in deck
export const createCardInstance = (baseCard: Omit<Card, 'id'>): Card => ({
  ...baseCard,
  id: Math.random().toString(36).substring(2, 11)
});

// All base cards in the game

const netrunnerCards: Omit<Card, 'id' | 'isUpgraded'>[] = [
  { cardId: 'nr_ping', name: 'Ping', type: 'Attack', cost: 1, damage: 5, description: 'Deal 5 damage.', rarity: 'Starter', class: 'NETRUNNER' },
  { cardId: 'nr_firewall', name: 'Firewall', type: 'Defense', cost: 1, block: 5, description: 'Gain 5 block.', rarity: 'Starter', class: 'NETRUNNER' },
  { cardId: 'nr_exploit', name: 'Exploit', type: 'Skill', cost: 1, description: 'Apply 2 Virus.', rarity: 'Starter', class: 'NETRUNNER' },
  { cardId: 'nr_overclock', name: 'Overclock', type: 'Skill', cost: 1, description: 'Draw 2 cards.', rarity: 'Starter', class: 'NETRUNNER' },
  { cardId: 'nr_packet_flood', name: 'Packet Flood', type: 'Attack', cost: 2, damage: 10, description: 'Deal 10 damage.', rarity: 'Common', class: 'NETRUNNER' },
  { cardId: 'nr_zero_day', name: 'Zero-Day', type: 'Skill', cost: 2, description: 'Apply 4 Virus and 1 Vulnerable.', rarity: 'Uncommon', class: 'NETRUNNER' },
  { cardId: 'nr_neural_fork', name: 'Neural Fork', type: 'Skill', cost: 1, description: 'Next card plays twice. (Not impl natively yet)', rarity: 'Rare', class: 'NETRUNNER' }, // Complex mechanic
  { cardId: 'nr_root_access', name: 'Root Access', type: 'Attack', cost: 3, description: 'Deal damage equal to all Virus stacks × 3. Remove Virus.', rarity: 'Rare', class: 'NETRUNNER' },
  { cardId: 'nr_ghost_protocol', name: 'Ghost Protocol', type: 'Defense', cost: 0, block: 4, description: 'Gain 4 block. Draw 1 card.', rarity: 'Uncommon', class: 'NETRUNNER' },
  { cardId: 'nr_ice_breaker', name: 'ICE Breaker', type: 'Attack', cost: 2, damage: 8, description: 'Deal 8 damage. Deals 15 instead if target is Vulnerable.', rarity: 'Uncommon', class: 'NETRUNNER' },
  { cardId: 'nr_data_spike', name: 'Data Spike', type: 'Attack', cost: 1, description: 'Deal 3 damage for each card in your hand.', rarity: 'Common', class: 'NETRUNNER' },
  { cardId: 'nr_recursive_loop', name: 'Recursive Loop', type: 'Power', cost: 3, description: 'At start of turn, apply 1 Virus to ALL enemies.', rarity: 'Rare', class: 'NETRUNNER' },
  { cardId: 'nr_mem_wipe', name: 'Mem Wipe', type: 'Skill', cost: 2, description: 'Apply 1 Stunned (Enemy skips turn).', rarity: 'Rare', class: 'NETRUNNER' },
  { cardId: 'nr_cascade', name: 'Cascade', type: 'Attack', cost: 1, damage: 2, hits: 3, description: 'Deal 2 damage 3 times. Apply 1 Virus per hit.', rarity: 'Uncommon', class: 'NETRUNNER' },
  { cardId: 'nr_blackout', name: 'Blackout', type: 'Skill', cost: 3, description: 'Apply 3 Virus, 1 Weak, 1 Vulnerable to ALL enemies.', rarity: 'Rare', class: 'NETRUNNER' },
  { cardId: 'nr_proxy_shield', name: 'Proxy Shield', type: 'Defense', cost: 1, description: 'Gain block equal to total Virus stacks on target enemy.', rarity: 'Common', class: 'NETRUNNER' }
];

const samuraiCards: Omit<Card, 'id' | 'isUpgraded'>[] = [
  { cardId: 'ss_slash', name: 'Slash', type: 'Attack', cost: 1, damage: 8, description: 'Deal 8 damage.', rarity: 'Starter', class: 'STREET_SAMURAI' },
  { cardId: 'ss_guard_stance', name: 'Guard Stance', type: 'Defense', cost: 1, block: 6, description: 'Gain 6 block.', rarity: 'Starter', class: 'STREET_SAMURAI' },
  { cardId: 'ss_adrenaline', name: 'Adrenaline Rush', type: 'Skill', cost: 1, description: 'Gain 1 Energy. Draw 1 card.', rarity: 'Starter', class: 'STREET_SAMURAI' },
  { cardId: 'ss_blade_storm', name: 'Blade Storm', type: 'Attack', cost: 2, damage: 3, hits: 3, description: 'Deal 3 damage 3 times.', rarity: 'Starter', class: 'STREET_SAMURAI' },
  { cardId: 'ss_finishing_blow', name: 'Finishing Blow', type: 'Attack', cost: 2, damage: 18, description: 'Deal 18 damage.', rarity: 'Uncommon', class: 'STREET_SAMURAI' },
  { cardId: 'ss_parry', name: 'Parry', type: 'Defense', cost: 0, block: 4, description: 'Gain 4 block.', rarity: 'Common', class: 'STREET_SAMURAI' },
  { cardId: 'ss_counter', name: 'Counter Strike', type: 'Attack', cost: 1, damage: 5, description: 'Deal 5 damage. If you have Block, deal 12 instead.', rarity: 'Common', class: 'STREET_SAMURAI' },
  { cardId: 'ss_momentum', name: 'Momentum Burst', type: 'Skill', cost: 1, description: 'Gain 2 Temporary Strength this turn.', rarity: 'Uncommon', class: 'STREET_SAMURAI' },
  { cardId: 'ss_steel_whirlwind', name: 'Steel Whirlwind', type: 'Attack', cost: 3, damage: 5, hits: 3, description: 'Deal 5 damage to ALL enemies 3 times.', rarity: 'Rare', class: 'STREET_SAMURAI' },
  { cardId: 'ss_predator', name: 'Predator Stance', type: 'Power', cost: 1, description: 'Gain 1 Strength permanently.', rarity: 'Rare', class: 'STREET_SAMURAI' },
  { cardId: 'ss_twin_fangs', name: 'Twin Fangs', type: 'Attack', cost: 1, damage: 6, hits: 2, description: 'Deal 6 damage 2 times.', rarity: 'Uncommon', class: 'STREET_SAMURAI' },
  { cardId: 'ss_fortify', name: 'Fortify', type: 'Defense', cost: 2, block: 12, description: 'Gain 12 block.', rarity: 'Common', class: 'STREET_SAMURAI' },
  { cardId: 'ss_serrated', name: 'Serrated Edge', type: 'Attack', cost: 2, damage: 10, description: 'Deal 10 damage. Apply 2 Weak.', rarity: 'Uncommon', class: 'STREET_SAMURAI' },
  { cardId: 'ss_death_mark', name: 'Death Mark', type: 'Skill', cost: 3, description: 'Apply 2 Vulnerable to ALL enemies.', rarity: 'Rare', class: 'STREET_SAMURAI' },
  { cardId: 'ss_berserk', name: 'Berserk', type: 'Attack', cost: 0, damage: 14, description: 'Lose 3 HP. Deal 14 damage.', rarity: 'Uncommon', class: 'STREET_SAMURAI' },
  { cardId: 'ss_last_stand', name: 'Last Stand', type: 'Skill', cost: 1, description: 'If HP < 50%, gain 10 block and draw 2.', rarity: 'Rare', class: 'STREET_SAMURAI' }
];

const fixerCards: Omit<Card, 'id' | 'isUpgraded'>[] = [
  { cardId: 'cf_coerce', name: 'Coerce', type: 'Attack', cost: 1, damage: 6, description: 'Deal 6 damage.', rarity: 'Starter', class: 'CORPORATE_FIXER' },
  { cardId: 'cf_encrypted', name: 'Encrypted Shield', type: 'Defense', cost: 1, block: 5, description: 'Gain 5 block.', rarity: 'Starter', class: 'CORPORATE_FIXER' },
  { cardId: 'cf_backroom', name: 'Backroom Deal', type: 'Skill', cost: 1, description: 'Draw 1 card. Gain 1 Gold.', rarity: 'Starter', class: 'CORPORATE_FIXER' },
  { cardId: 'cf_espionage', name: 'Corporate Espionage', type: 'Skill', cost: 1, description: 'Copy a random card from discard to hand. (Mocked as draw 1 for now)', rarity: 'Starter', class: 'CORPORATE_FIXER' },
  { cardId: 'cf_wire', name: 'Wire Transfer', type: 'Skill', cost: 0, description: 'Gain 3 Gold.', rarity: 'Common', class: 'CORPORATE_FIXER' },
  { cardId: 'cf_hostile', name: 'Hostile Takeover', type: 'Attack', cost: 3, damage: 20, description: 'Deal 20 damage. Gain 5 Gold.', rarity: 'Rare', class: 'CORPORATE_FIXER' },
  { cardId: 'cf_legal', name: 'Legal Threat', type: 'Skill', cost: 2, description: 'Apply 1 Weak and 1 Vulnerable.', rarity: 'Uncommon', class: 'CORPORATE_FIXER' },
  { cardId: 'cf_contingency', name: 'Contingency Plan', type: 'Skill', cost: 1, description: 'Draw 2 cards. If you have 10+ Gold, gain 2 Energy.', rarity: 'Uncommon', class: 'CORPORATE_FIXER' },
  { cardId: 'cf_market', name: 'Market Manipulation', type: 'Power', cost: 2, description: '+1 Strength for every 5 Gold you have. (One-time buff on play)', rarity: 'Rare', class: 'CORPORATE_FIXER' },
  { cardId: 'cf_buyout', name: 'Buyout', type: 'Attack', cost: 2, damage: 8, description: 'Deal 8 damage + 1 per Gold you have (max +20).', rarity: 'Rare', class: 'CORPORATE_FIXER' },
  { cardId: 'cf_shell', name: 'Shell Company', type: 'Defense', cost: 1, block: 8, description: 'Gain 8 block.', rarity: 'Common', class: 'CORPORATE_FIXER' },
  { cardId: 'cf_blackmail', name: 'Blackmail', type: 'Skill', cost: 2, description: 'Apply 3 Weak. Draw 1 card.', rarity: 'Uncommon', class: 'CORPORATE_FIXER' },
  { cardId: 'cf_golden_parachute', name: 'Golden Parachute', type: 'Defense', cost: 0, description: 'If HP < 40%, gain 15 block.', rarity: 'Rare', class: 'CORPORATE_FIXER' },
  { cardId: 'cf_liquidation', name: 'Asset Liquidation', type: 'Attack', cost: 1, damage: 15, description: 'Lose 5 Gold. Deal 15 damage.', rarity: 'Uncommon', class: 'CORPORATE_FIXER' },
  { cardId: 'cf_leverage', name: 'Leverage Play', type: 'Skill', cost: 1, description: 'Gain 2 Energy. Lose 2 Gold.', rarity: 'Uncommon', class: 'CORPORATE_FIXER' }
];

export const allCardsMap: Record<string, Omit<Card, 'id' | 'isUpgraded'>> = 
  [...netrunnerCards, ...samuraiCards, ...fixerCards].reduce((acc, card) => {
    acc[card.cardId] = card;
    return acc;
  }, {} as Record<string, Omit<Card, 'id' | 'isUpgraded'>>);

export const getStartingDeck = (cls: CharacterClass): Card[] => {
  const deck: Card[] = [];
  if (cls === 'NETRUNNER') {
    for (let i=0; i<4; i++) deck.push(createCardInstance({...allCardsMap['nr_ping'], isUpgraded: false}));
    for (let i=0; i<3; i++) deck.push(createCardInstance({...allCardsMap['nr_firewall'], isUpgraded: false}));
    for (let i=0; i<2; i++) deck.push(createCardInstance({...allCardsMap['nr_exploit'], isUpgraded: false}));
    for (let i=0; i<1; i++) deck.push(createCardInstance({...allCardsMap['nr_overclock'], isUpgraded: false}));
  } else if (cls === 'STREET_SAMURAI') {
    for (let i=0; i<4; i++) deck.push(createCardInstance({...allCardsMap['ss_slash'], isUpgraded: false}));
    for (let i=0; i<3; i++) deck.push(createCardInstance({...allCardsMap['ss_guard_stance'], isUpgraded: false}));
    for (let i=0; i<2; i++) deck.push(createCardInstance({...allCardsMap['ss_adrenaline'], isUpgraded: false}));
    for (let i=0; i<1; i++) deck.push(createCardInstance({...allCardsMap['ss_blade_storm'], isUpgraded: false}));
  } else {
    for (let i=0; i<4; i++) deck.push(createCardInstance({...allCardsMap['cf_coerce'], isUpgraded: false}));
    for (let i=0; i<3; i++) deck.push(createCardInstance({...allCardsMap['cf_encrypted'], isUpgraded: false}));
    for (let i=0; i<2; i++) deck.push(createCardInstance({...allCardsMap['cf_backroom'], isUpgraded: false}));
    for (let i=0; i<1; i++) deck.push(createCardInstance({...allCardsMap['cf_espionage'], isUpgraded: false}));
  }
  return deck;
};

export const getRandomCardsForClass = (cls: CharacterClass, count: number): Card[] => {
  const pool = Object.values(allCardsMap).filter(c => c.class === cls && c.rarity !== 'Starter');
  const result: Card[] = [];
  for (let i=0; i<count; i++) {
    const randomCard = pool[Math.floor(Math.random() * pool.length)];
    result.push(createCardInstance({...randomCard, isUpgraded: false}));
  }
  return result;
};
