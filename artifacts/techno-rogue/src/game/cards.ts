import { Card, CharacterClass } from './types';

export const createCardInstance = (baseCard: Omit<Card, 'id'>): Card => ({
  ...baseCard,
  id: Math.random().toString(36).substring(2, 11)
});

// --- NETRUNNER (Hack, Virus, Intent Control) ---
const netrunnerCards: Omit<Card, 'id' | 'isUpgraded'>[] = [
  { cardId: 'nr_ping', name: 'Ping', type: 'Attack', cost: 1, damage: 5, description: 'Deal 5 damage.', rarity: 'Starter', class: 'NETRUNNER' },
  { cardId: 'nr_firewall', name: 'Firewall', type: 'Defense', cost: 1, block: 5, description: 'Gain 5 block.', rarity: 'Starter', class: 'NETRUNNER' },
  { cardId: 'nr_exploit', name: 'Exploit', type: 'Skill', cost: 1, description: 'Apply 2 Virus.', rarity: 'Starter', class: 'NETRUNNER' },
  { cardId: 'nr_overclock', name: 'Overclock', type: 'Skill', cost: 1, description: 'Draw 2 cards.', rarity: 'Starter', class: 'NETRUNNER' },
  
  { cardId: 'nr_packet_flood', name: 'Packet Flood', type: 'Attack', cost: 2, damage: 10, description: 'Deal 10 damage.', rarity: 'Common', class: 'NETRUNNER' },
  { cardId: 'nr_zero_day', name: 'Zero-Day', type: 'Skill', cost: 2, description: 'Apply 4 Virus and 1 Vulnerable.', rarity: 'Uncommon', class: 'NETRUNNER' },
  { cardId: 'nr_neural_fork', name: 'Neural Fork', type: 'Skill', cost: 1, description: 'Next Skill plays twice.', rarity: 'Rare', class: 'NETRUNNER' },
  { cardId: 'nr_root_access', name: 'Root Access', type: 'Attack', cost: 3, description: 'Deal damage equal to all Virus stacks × 3. Remove Virus.', rarity: 'Rare', class: 'NETRUNNER' },
  { cardId: 'nr_ghost_protocol', name: 'Ghost Protocol', type: 'Defense', cost: 0, block: 4, description: 'Gain 4 block. Draw 1 card.', rarity: 'Uncommon', class: 'NETRUNNER' },
  { cardId: 'nr_ice_breaker', name: 'ICE Breaker', type: 'Attack', cost: 2, damage: 8, description: 'Deal 8 damage. Deals 15 instead if target has Virus.', rarity: 'Uncommon', class: 'NETRUNNER' },
  { cardId: 'nr_data_spike', name: 'Data Spike', type: 'Attack', cost: 1, damage: 3, description: 'Deal 3 damage for each card in your hand.', rarity: 'Common', class: 'NETRUNNER' },
  { cardId: 'nr_recursive_loop', name: 'Recursive Loop', type: 'Power', cost: 3, description: 'At start of turn, apply 1 Virus to ALL enemies.', rarity: 'Rare', class: 'NETRUNNER' },
  { cardId: 'nr_mem_wipe', name: 'Mem Wipe', type: 'Skill', cost: 2, description: 'Apply 1 Stunned (Enemy skips turn). Exhaust.', exhaust: true, rarity: 'Rare', class: 'NETRUNNER' },
  { cardId: 'nr_cascade', name: 'Cascade', type: 'Attack', cost: 1, damage: 2, hits: 3, description: 'Deal 2 damage 3 times. Apply 1 Virus per hit.', rarity: 'Uncommon', class: 'NETRUNNER' },
  { cardId: 'nr_blackout', name: 'Blackout', type: 'Skill', cost: 3, description: 'Apply 3 Virus, 1 Weak, 1 Vulnerable to ALL enemies. Exhaust.', exhaust: true, rarity: 'Rare', class: 'NETRUNNER' },
  { cardId: 'nr_proxy_shield', name: 'Proxy Shield', type: 'Defense', cost: 1, description: 'Gain block equal to total Virus stacks on target enemy.', rarity: 'Common', class: 'NETRUNNER' },
  { cardId: 'nr_ddos', name: 'DDOS', type: 'Attack', cost: -1, isXCost: true, description: 'Deal X * 5 damage to ALL enemies. Exhaust.', exhaust: true, rarity: 'Rare', class: 'NETRUNNER' },
  { cardId: 'nr_spoof', name: 'Spoof Intent', type: 'Skill', cost: 1, description: 'Gain Block equal to intended Attack damage of target.', rarity: 'Uncommon', class: 'NETRUNNER' }
];

// --- GUNSLINGER (Combo, Double Hits, Attachments) ---
const gunslingerCards: Omit<Card, 'id' | 'isUpgraded'>[] = [
  { cardId: 'gs_shoot', name: 'Shoot', type: 'Attack', cost: 1, damage: 6, description: 'Deal 6 damage.', rarity: 'Starter', class: 'GUNSLINGER' },
  { cardId: 'gs_dodge', name: 'Dodge', type: 'Defense', cost: 1, block: 5, description: 'Gain 5 block.', rarity: 'Starter', class: 'GUNSLINGER' },
  { cardId: 'gs_quickdraw', name: 'Quickdraw', type: 'Attack', cost: 0, damage: 3, description: 'Deal 3 damage. Draw 1 card.', rarity: 'Starter', class: 'GUNSLINGER' },
  { cardId: 'gs_reload', name: 'Reload', type: 'Skill', cost: 1, description: 'Gain 1 Energy. Draw 2 cards.', rarity: 'Starter', class: 'GUNSLINGER' },
  
  { cardId: 'gs_double_tap', name: 'Double Tap', type: 'Attack', cost: 1, damage: 4, hits: 2, description: 'Deal 4 damage 2 times.', rarity: 'Common', class: 'GUNSLINGER' },
  { cardId: 'gs_hollow_point', name: 'Hollow Point', type: 'Power', cost: 2, description: 'Your Attacks deal +2 Damage.', rarity: 'Uncommon', class: 'GUNSLINGER' },
  { cardId: 'gs_incendiary', name: 'Incendiary Rounds', type: 'Power', cost: 2, description: 'Your Attacks apply 1 Burn.', rarity: 'Rare', class: 'GUNSLINGER' },
  { cardId: 'gs_fan_hammer', name: 'Fan the Hammer', type: 'Attack', cost: -1, isXCost: true, description: 'Deal 4 damage X times.', rarity: 'Rare', class: 'GUNSLINGER' },
  { cardId: 'gs_ricochet', name: 'Ricochet', type: 'Attack', cost: 1, damage: 5, description: 'Deal 5 damage. Gain 5 Block.', rarity: 'Common', class: 'GUNSLINGER' },
  { cardId: 'gs_chain_reaction', name: 'Chain Reaction', type: 'Attack', cost: 2, damage: 8, description: 'Deal 8 damage. Costs 1 less if you played an Attack this turn.', rarity: 'Uncommon', class: 'GUNSLINGER' },
  { cardId: 'gs_flashbang', name: 'Flashbang', type: 'Skill', cost: 1, description: 'Apply 2 Weak to ALL enemies.', rarity: 'Common', class: 'GUNSLINGER' },
  { cardId: 'gs_deadeye', name: 'Deadeye', type: 'Power', cost: 3, description: 'At start of turn, gain 2 Momentum (+2 next attack).', rarity: 'Rare', class: 'GUNSLINGER' },
  { cardId: 'gs_cover_fire', name: 'Cover Fire', type: 'Defense', cost: 1, block: 8, description: 'Gain 8 block. If you played an Attack, draw 1.', rarity: 'Uncommon', class: 'GUNSLINGER' },
  { cardId: 'gs_execution', name: 'Execution', type: 'Attack', cost: 3, damage: 20, description: 'Deal 20 damage. If target has Burn, deal 30 instead.', rarity: 'Rare', class: 'GUNSLINGER' },
  { cardId: 'gs_slide', name: 'Slide', type: 'Defense', cost: 0, block: 4, description: 'Gain 4 block. Next Attack deals +2 dmg.', rarity: 'Common', class: 'GUNSLINGER' }
];

// --- CYBORG (HP as Resource, Body Mods) ---
const cyborgCards: Omit<Card, 'id' | 'isUpgraded'>[] = [
  { cardId: 'cb_strike', name: 'Strike', type: 'Attack', cost: 1, damage: 7, description: 'Deal 7 damage.', rarity: 'Starter', class: 'CYBORG' },
  { cardId: 'cb_brace', name: 'Brace', type: 'Defense', cost: 1, block: 5, description: 'Gain 5 block.', rarity: 'Starter', class: 'CYBORG' },
  { cardId: 'cb_overdrive', name: 'Overdrive', type: 'Skill', cost: 0, description: 'Lose 2 HP. Gain 2 Energy.', rarity: 'Starter', class: 'CYBORG' },
  { cardId: 'cb_slam', name: 'Slam', type: 'Attack', cost: 2, damage: 12, description: 'Deal 12 damage. Lose 2 HP.', rarity: 'Starter', class: 'CYBORG' },
  
  { cardId: 'cb_titanium_plating', name: 'Titanium Plating', type: 'Power', cost: 2, description: 'Gain 2 Dexterity.', rarity: 'Uncommon', class: 'CYBORG' },
  { cardId: 'cb_hydraulic_punch', name: 'Hydraulic Punch', type: 'Attack', cost: 2, damage: 15, description: 'Deal 15 damage.', rarity: 'Common', class: 'CYBORG' },
  { cardId: 'cb_flesh_to_steel', name: 'Flesh to Steel', type: 'Skill', cost: 1, description: 'Lose 5 HP. Gain 15 Block.', rarity: 'Uncommon', class: 'CYBORG' },
  { cardId: 'cb_core_vent', name: 'Core Vent', type: 'Attack', cost: 1, damage: 5, description: 'Deal 5 damage to ALL enemies. You take 3 damage.', rarity: 'Common', class: 'CYBORG' },
  { cardId: 'cb_limit_break', name: 'Limit Break', type: 'Power', cost: 3, description: 'Gain 3 Strength. Lose 10 HP.', rarity: 'Rare', class: 'CYBORG' },
  { cardId: 'cb_self_repair', name: 'Self Repair', type: 'Skill', cost: 1, description: 'Heal 5 HP. Exhaust.', exhaust: true, rarity: 'Uncommon', class: 'CYBORG' },
  { cardId: 'cb_reckless_charge', name: 'Reckless Charge', type: 'Attack', cost: 0, damage: 8, description: 'Deal 8 damage. Take 2 damage.', rarity: 'Common', class: 'CYBORG' },
  { cardId: 'cb_pain_inhibitor', name: 'Pain Inhibitor', type: 'Power', cost: 1, description: 'Whenever you take damage from a card, draw 1.', rarity: 'Rare', class: 'CYBORG' },
  { cardId: 'cb_juggernaut', name: 'Juggernaut', type: 'Attack', cost: 3, damage: 25, description: 'Deal 25 damage.', rarity: 'Rare', class: 'CYBORG' },
  { cardId: 'cb_plasma_shield', name: 'Plasma Shield', type: 'Defense', cost: 2, block: 12, description: 'Gain 12 block.', rarity: 'Common', class: 'CYBORG' },
  { cardId: 'cb_blood_fuel', name: 'Blood Fuel', type: 'Skill', cost: 0, description: 'Lose 3 HP. Draw 3 cards. Exhaust.', exhaust: true, rarity: 'Rare', class: 'CYBORG' }
];

// --- RIPPER (Healing, Surge, Organic Mods) ---
const ripperCards: Omit<Card, 'id' | 'isUpgraded'>[] = [
  { cardId: 'rp_scalpel', name: 'Scalpel', type: 'Attack', cost: 1, damage: 5, description: 'Deal 5 damage. Apply 1 Poison.', rarity: 'Starter', class: 'RIPPER' },
  { cardId: 'rp_suture', name: 'Suture', type: 'Defense', cost: 1, block: 4, description: 'Gain 4 block. Heal 1 HP.', rarity: 'Starter', class: 'RIPPER' },
  { cardId: 'rp_transfusion', name: 'Transfusion', type: 'Skill', cost: 1, description: 'Heal 4 HP.', rarity: 'Starter', class: 'RIPPER' },
  { cardId: 'rp_extract', name: 'Extract', type: 'Attack', cost: 1, damage: 6, description: 'Deal 6 damage. Heal 2 HP.', rarity: 'Starter', class: 'RIPPER' },

  { cardId: 'rp_vital_strike', name: 'Vital Strike', type: 'Attack', cost: 2, damage: 10, description: 'Deal 10 damage. Deal +Damage equal to your Surge.', rarity: 'Uncommon', class: 'RIPPER' },
  { cardId: 'rp_adrenal_gland', name: 'Adrenal Gland', type: 'Power', cost: 2, description: 'At start of turn, Heal 2 HP.', rarity: 'Rare', class: 'RIPPER' },
  { cardId: 'rp_toxic_blood', name: 'Toxic Blood', type: 'Power', cost: 1, description: 'When attacked, apply 2 Poison to attacker.', rarity: 'Uncommon', class: 'RIPPER' },
  { cardId: 'rp_flesh_mend', name: 'Flesh Mend', type: 'Defense', cost: 2, block: 10, description: 'Gain 10 block. Heal 3 HP.', rarity: 'Common', class: 'RIPPER' },
  { cardId: 'rp_hemorrhage', name: 'Hemorrhage', type: 'Skill', cost: 1, description: 'Target loses HP equal to its Poison stack. Exhaust.', exhaust: true, rarity: 'Rare', class: 'RIPPER' },
  { cardId: 'rp_neurotoxin', name: 'Neurotoxin', type: 'Skill', cost: 2, description: 'Apply 4 Poison and 1 Weak.', rarity: 'Common', class: 'RIPPER' },
  { cardId: 'rp_organ_harvest', name: 'Organ Harvest', type: 'Attack', cost: 1, damage: 8, description: 'Deal 8 damage. If fatal, Heal 10 HP. Exhaust.', exhaust: true, rarity: 'Rare', class: 'RIPPER' },
  { cardId: 'rp_mutagen', name: 'Mutagen', type: 'Power', cost: 2, description: 'Gain 1 Strength. Grows by +1 each turn.', rarity: 'Rare', class: 'RIPPER' }, // Needs special logic for 'grows' or we just do it via start of turn
  { cardId: 'rp_anesthetic', name: 'Anesthetic', type: 'Defense', cost: 1, block: 7, description: 'Gain 7 block.', rarity: 'Common', class: 'RIPPER' },
  { cardId: 'rp_leech_seed', name: 'Leech Seed', type: 'Attack', cost: 1, damage: 4, hits: 2, description: 'Deal 4 damage 2 times. Heal 1 HP per hit.', rarity: 'Uncommon', class: 'RIPPER' },
  { cardId: 'rp_biomass', name: 'Biomass Shield', type: 'Skill', cost: -1, isXCost: true, description: 'Gain X * 4 Block and Heal X * 2 HP.', rarity: 'Rare', class: 'RIPPER' }
];

// --- CORPORATE AGENT (Cryptobytes, Allies) ---
const corporateCards: Omit<Card, 'id' | 'isUpgraded'>[] = [
  { cardId: 'ca_strike', name: 'Strike', type: 'Attack', cost: 1, damage: 6, description: 'Deal 6 damage.', rarity: 'Starter', class: 'CORPORATE_AGENT' },
  { cardId: 'ca_defend', name: 'Defend', type: 'Defense', cost: 1, block: 5, description: 'Gain 5 block.', rarity: 'Starter', class: 'CORPORATE_AGENT' },
  { cardId: 'ca_bribe', name: 'Bribe', type: 'Skill', cost: 1, description: 'Spend 10 CB. Apply 2 Weak.', rarity: 'Starter', class: 'CORPORATE_AGENT' },
  { cardId: 'ca_liquidate', name: 'Liquidation', type: 'Attack', cost: 1, damage: 5, description: 'Deal 5 damage. Gain 5 CB.', rarity: 'Starter', class: 'CORPORATE_AGENT' },

  { cardId: 'ca_hire_turret', name: 'Hire Turret', type: 'Power', cost: 2, description: 'Spend 20 CB. At end of turn, deal 4 damage to a random enemy.', rarity: 'Rare', class: 'CORPORATE_AGENT' },
  { cardId: 'ca_hire_drone', name: 'Hire Drone', type: 'Power', cost: 2, description: 'Spend 20 CB. At end of turn, gain 4 Block.', rarity: 'Rare', class: 'CORPORATE_AGENT' },
  { cardId: 'ca_mercenary', name: 'Mercenary', type: 'Attack', cost: 1, damage: 12, description: 'Spend 5 CB. Deal 12 damage.', rarity: 'Common', class: 'CORPORATE_AGENT' },
  { cardId: 'ca_emergency_funds', name: 'Emergency Funds', type: 'Skill', cost: 0, description: 'Gain 15 Budget this turn. Exhaust.', exhaust: true, rarity: 'Uncommon', class: 'CORPORATE_AGENT' },
  { cardId: 'ca_hostile_takeover', name: 'Hostile Takeover', type: 'Attack', cost: 3, damage: 15, description: 'Deal 15 damage. Gain CB equal to unblocked damage dealt.', rarity: 'Rare', class: 'CORPORATE_AGENT' },
  { cardId: 'ca_insider_trading', name: 'Insider Trading', type: 'Skill', cost: 1, description: 'Draw 3 cards. Spend 10 CB.', rarity: 'Uncommon', class: 'CORPORATE_AGENT' },
  { cardId: 'ca_payoff', name: 'Payoff', type: 'Defense', cost: 1, block: 10, description: 'Spend 5 CB. Gain 10 Block.', rarity: 'Common', class: 'CORPORATE_AGENT' },
  { cardId: 'ca_monopoly', name: 'Monopoly', type: 'Power', cost: 3, description: 'Whenever you gain CB in combat, gain 1 Strength.', rarity: 'Rare', class: 'CORPORATE_AGENT' },
  { cardId: 'ca_market_crash', name: 'Market Crash', type: 'Attack', cost: 2, damage: 0, description: 'Deal damage equal to your current CB / 5.', rarity: 'Rare', class: 'CORPORATE_AGENT' },
  { cardId: 'ca_dividends', name: 'Dividends', type: 'Skill', cost: 1, description: 'Gain 10 CB. Retain.', rarity: 'Uncommon', class: 'CORPORATE_AGENT' }, // retain not natively implemented yet, could just exhaust for now
  { cardId: 'ca_golden_parachute', name: 'Golden Parachute', type: 'Defense', cost: -1, isXCost: true, description: 'Spend X * 10 CB. Gain X * 8 Block.', rarity: 'Rare', class: 'CORPORATE_AGENT' }
];

export const allCardsMap: Record<string, Omit<Card, 'id' | 'isUpgraded'>> = 
  [...netrunnerCards, ...gunslingerCards, ...cyborgCards, ...ripperCards, ...corporateCards].reduce((acc, card) => {
    acc[card.cardId] = card;
    return acc;
  }, {} as Record<string, Omit<Card, 'id' | 'isUpgraded'>>);

export const getStartingDeck = (cls: CharacterClass): Card[] => {
  const deck: Card[] = [];
  if (cls === 'NETRUNNER') {
    for (let i=0; i<4; i++) deck.push(createCardInstance({...allCardsMap['nr_ping'], isUpgraded: false}));
    for (let i=0; i<4; i++) deck.push(createCardInstance({...allCardsMap['nr_firewall'], isUpgraded: false}));
    for (let i=0; i<1; i++) deck.push(createCardInstance({...allCardsMap['nr_exploit'], isUpgraded: false}));
    for (let i=0; i<1; i++) deck.push(createCardInstance({...allCardsMap['nr_overclock'], isUpgraded: false}));
  } else if (cls === 'GUNSLINGER') {
    for (let i=0; i<4; i++) deck.push(createCardInstance({...allCardsMap['gs_shoot'], isUpgraded: false}));
    for (let i=0; i<4; i++) deck.push(createCardInstance({...allCardsMap['gs_dodge'], isUpgraded: false}));
    for (let i=0; i<1; i++) deck.push(createCardInstance({...allCardsMap['gs_quickdraw'], isUpgraded: false}));
    for (let i=0; i<1; i++) deck.push(createCardInstance({...allCardsMap['gs_reload'], isUpgraded: false}));
  } else if (cls === 'CYBORG') {
    for (let i=0; i<4; i++) deck.push(createCardInstance({...allCardsMap['cb_strike'], isUpgraded: false}));
    for (let i=0; i<4; i++) deck.push(createCardInstance({...allCardsMap['cb_brace'], isUpgraded: false}));
    for (let i=0; i<1; i++) deck.push(createCardInstance({...allCardsMap['cb_overdrive'], isUpgraded: false}));
    for (let i=0; i<1; i++) deck.push(createCardInstance({...allCardsMap['cb_slam'], isUpgraded: false}));
  } else if (cls === 'RIPPER') {
    for (let i=0; i<4; i++) deck.push(createCardInstance({...allCardsMap['rp_scalpel'], isUpgraded: false}));
    for (let i=0; i<4; i++) deck.push(createCardInstance({...allCardsMap['rp_suture'], isUpgraded: false}));
    for (let i=0; i<1; i++) deck.push(createCardInstance({...allCardsMap['rp_transfusion'], isUpgraded: false}));
    for (let i=0; i<1; i++) deck.push(createCardInstance({...allCardsMap['rp_extract'], isUpgraded: false}));
  } else if (cls === 'CORPORATE_AGENT') {
    for (let i=0; i<4; i++) deck.push(createCardInstance({...allCardsMap['ca_strike'], isUpgraded: false}));
    for (let i=0; i<4; i++) deck.push(createCardInstance({...allCardsMap['ca_defend'], isUpgraded: false}));
    for (let i=0; i<1; i++) deck.push(createCardInstance({...allCardsMap['ca_bribe'], isUpgraded: false}));
    for (let i=0; i<1; i++) deck.push(createCardInstance({...allCardsMap['ca_liquidate'], isUpgraded: false}));
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
