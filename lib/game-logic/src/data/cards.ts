export type CardType = 'code' | 'firewall' | 'daemon' | 'virus' | 'ice' | 'protocol';
export type TargetType = 'enemy' | 'self' | 'all_enemies' | 'all';
export type Rarity = 'basic' | 'common' | 'uncommon' | 'rare';

export interface CardEffect {
  type: 'damage' | 'block' | 'apply_effect' | 'gain_energy' | 'heal' | 'draw' | 'aoe_damage' | 'draw_from_discard';
  value?: number;
  effectType?: string;
  duration?: number;
  target?: TargetType;
}

export interface CardDefinition {
  id: string;
  name: string;
  cost: number;
  type: CardType;
  target: TargetType;
  description: string;
  rarity: Rarity;
  effects: CardEffect[];
  exhaust?: boolean;
}

export const CARD_DEFINITIONS: CardDefinition[] = [
  { id: 'strike', name: 'Strike', cost: 1, type: 'code', target: 'enemy', description: 'Deal 6 damage.', rarity: 'basic', effects: [{ type: 'damage', value: 6 }] },
  { id: 'defend', name: 'Defend', cost: 1, type: 'firewall', target: 'self', description: 'Gain 5 block.', rarity: 'basic', effects: [{ type: 'block', value: 5 }] },
  { id: 'inject', name: 'Inject', cost: 2, type: 'code', target: 'enemy', description: 'Deal 12 damage.', rarity: 'common', effects: [{ type: 'damage', value: 12 }] },
  { id: 'barrier', name: 'Barrier', cost: 2, type: 'firewall', target: 'self', description: 'Gain 10 block.', rarity: 'common', effects: [{ type: 'block', value: 10 }] },
  { id: 'overclock', name: 'Overclock', cost: 0, type: 'daemon', target: 'self', description: 'Gain 1 energy.', rarity: 'common', effects: [{ type: 'gain_energy', value: 1 }] },
  { id: 'worm', name: 'Worm', cost: 1, type: 'virus', target: 'enemy', description: 'Apply 3 poison.', rarity: 'common', effects: [{ type: 'apply_effect', effectType: 'poison', value: 3, duration: 3 }] },
  { id: 'turbo', name: 'Turbo', cost: 1, type: 'daemon', target: 'self', description: 'Draw 2 cards.', rarity: 'common', effects: [{ type: 'draw', value: 2 }] },
  { id: 'overload', name: 'Overload', cost: 1, type: 'code', target: 'enemy', description: 'Deal 4 damage. Apply 2 vulnerable.', rarity: 'uncommon', effects: [{ type: 'damage', value: 4 }, { type: 'apply_effect', effectType: 'vulnerable', value: 1, duration: 2 }] },
  { id: 'fortify', name: 'Fortify', cost: 1, type: 'firewall', target: 'self', description: 'Gain 6 block. Gain 1 strength.', rarity: 'uncommon', effects: [{ type: 'block', value: 6 }, { type: 'apply_effect', effectType: 'strength', value: 1, duration: 99 }] },
  { id: 'data_leak', name: 'Data Leak', cost: 2, type: 'virus', target: 'enemy', description: 'Apply 5 poison. Deal 3 damage.', rarity: 'uncommon', effects: [{ type: 'apply_effect', effectType: 'poison', value: 5, duration: 3 }, { type: 'damage', value: 3 }] },
  { id: 'recompile', name: 'Recompile', cost: 0, type: 'ice', target: 'self', description: 'Shuffle 2 random cards from discard into your hand.', rarity: 'uncommon', effects: [{ type: 'draw_from_discard', value: 2 }] },
  { id: 'neural_blitz', name: 'Neural Blitz', cost: 3, type: 'code', target: 'all_enemies', description: 'Deal 8 damage to all enemies.', rarity: 'rare', effects: [{ type: 'aoe_damage', value: 8 }] },
  { id: 'netrunner_ping', name: 'Ping', cost: 0, type: 'code', target: 'enemy', description: 'Deal 3 damage. Draw 1 card.', rarity: 'common', effects: [{ type: 'damage', value: 3 }, { type: 'draw', value: 1 }] },
  { id: 'netrunner_proxy_shield', name: 'Proxy Shield', cost: 1, type: 'firewall', target: 'self', description: 'Gain 5 block. Retain.', rarity: 'common', effects: [{ type: 'block', value: 5 }] },
  { id: 'netrunner_hardened_protocol', name: 'Hardened Protocol', cost: 1, type: 'firewall', target: 'self', description: 'Gain 6 block.', rarity: 'common', effects: [{ type: 'block', value: 6 }] },
  { id: 'netrunner_brute_force', name: 'Brute Force', cost: 2, type: 'code', target: 'enemy', description: 'Deal 12 damage. Exhaust.', rarity: 'uncommon', effects: [{ type: 'damage', value: 12 }], exhaust: true },
  { id: 'netrunner_data_siphon', name: 'Data Siphon', cost: 1, type: 'code', target: 'enemy', description: 'Deal 4 damage. Heal 2 HP.', rarity: 'uncommon', effects: [{ type: 'damage', value: 4 }, { type: 'heal', value: 2 }] },
  { id: 'netrunner_encrypted_channel', name: 'Encrypted Channel', cost: 1, type: 'daemon', target: 'self', description: 'Gain 2 strength for 1 turn.', rarity: 'uncommon', effects: [{ type: 'apply_effect', effectType: 'strength', value: 1, duration: 1 }] },
  { id: 'netrunner_exploit', name: 'Exploit', cost: 2, type: 'code', target: 'enemy', description: 'Deal 8 damage. Apply 1 vulnerable.', rarity: 'uncommon', effects: [{ type: 'damage', value: 8 }, { type: 'apply_effect', effectType: 'vulnerable', value: 1, duration: 2 }] },
  { id: 'netrunner_deep_scan', name: 'Deep Scan', cost: 1, type: 'daemon', target: 'self', description: 'Draw 2 cards.', rarity: 'uncommon', effects: [{ type: 'draw', value: 2 }] },
  { id: 'netrunner_countermeasure', name: 'Countermeasure', cost: 1, type: 'firewall', target: 'self', description: 'Gain 8 block.', rarity: 'uncommon', effects: [{ type: 'block', value: 8 }] },
  { id: 'netrunner_system_scan', name: 'System Scan', cost: 0, type: 'ice', target: 'self', description: 'Draw 2 cards.', rarity: 'uncommon', effects: [{ type: 'draw', value: 2 }] },
  { id: 'netrunner_firewall', name: 'Firewall', cost: 2, type: 'firewall', target: 'self', description: 'Gain 12 block. Gain 1 strength.', rarity: 'rare', effects: [{ type: 'block', value: 12 }, { type: 'apply_effect', effectType: 'strength', value: 1, duration: 99 }] },
  { id: 'netrunner_root_access', name: 'Root Access', cost: 3, type: 'code', target: 'all_enemies', description: 'Deal 10 damage to all enemies.', rarity: 'rare', effects: [{ type: 'aoe_damage', value: 10 }] },
  { id: 'netrunner_node_crash', name: 'Node Crash', cost: 2, type: 'code', target: 'enemy', description: 'Deal 16 damage. Exhaust.', rarity: 'rare', effects: [{ type: 'damage', value: 16 }], exhaust: true },
  { id: 'netrunner_backup_plan', name: 'Backup Plan', cost: 0, type: 'ice', target: 'self', description: 'Heal 8 HP. Exhaust.', rarity: 'rare', effects: [{ type: 'heal', value: 8 }], exhaust: true },
  { id: 'netrunner_network_boost', name: 'Network Boost', cost: 1, type: 'daemon', target: 'self', description: 'Gain 2 energy. Draw 1 card.', rarity: 'rare', effects: [{ type: 'gain_energy', value: 2 }, { type: 'draw', value: 1 }] },
  { id: 'cracker_brute_strike', name: 'Brute Strike', cost: 1, type: 'code', target: 'enemy', description: 'Deal 9 damage.', rarity: 'common', effects: [{ type: 'damage', value: 9 }] },
  { id: 'cracker_double_tap', name: 'Double Tap', cost: 1, type: 'code', target: 'enemy', description: 'Deal 4 damage twice.', rarity: 'common', effects: [{ type: 'damage', value: 4 }, { type: 'damage', value: 4 }] },
  { id: 'cracker_quick_hack', name: 'Quick Hack', cost: 0, type: 'code', target: 'enemy', description: 'Deal 3 damage. Draw 1.', rarity: 'common', effects: [{ type: 'damage', value: 3 }, { type: 'draw', value: 1 }] },
  { id: 'cracker_rampage', name: 'Rampage', cost: 1, type: 'code', target: 'enemy', description: 'Deal 8 damage.', rarity: 'uncommon', effects: [{ type: 'damage', value: 8 }] },
  { id: 'cracker_bloodlust', name: 'Bloodlust', cost: 0, type: 'code', target: 'enemy', description: 'Lose 3 HP. Deal 10 damage.', rarity: 'uncommon', effects: [{ type: 'damage', value: 10 }] },
  { id: 'cracker_adrenaline_rush', name: 'Adrenaline Rush', cost: 0, type: 'daemon', target: 'self', description: 'Gain 2 energy.', rarity: 'uncommon', effects: [{ type: 'gain_energy', value: 2 }] },
  { id: 'cracker_shred', name: 'Shred', cost: 1, type: 'code', target: 'enemy', description: 'Deal 5 damage. Apply 2 weak.', rarity: 'uncommon', effects: [{ type: 'damage', value: 5 }, { type: 'apply_effect', effectType: 'weak', value: 2, duration: 2 }] },
  { id: 'cracker_critical_hit', name: 'Critical Hit', cost: 2, type: 'code', target: 'enemy', description: 'Deal 14 damage.', rarity: 'uncommon', effects: [{ type: 'damage', value: 14 }] },
  { id: 'cracker_chain_attack', name: 'Chain Attack', cost: 1, type: 'code', target: 'all_enemies', description: 'Deal 4 damage to all enemies.', rarity: 'uncommon', effects: [{ type: 'aoe_damage', value: 4 }] },
  { id: 'cracker_viral_strike', name: 'Viral Strike', cost: 1, type: 'virus', target: 'enemy', description: 'Deal 6 damage. Apply 2 poison.', rarity: 'uncommon', effects: [{ type: 'damage', value: 6 }, { type: 'apply_effect', effectType: 'poison', value: 2, duration: 3 }] },
  { id: 'cracker_berserker', name: 'Berserker', cost: 1, type: 'daemon', target: 'self', description: 'Gain 2 strength.', rarity: 'rare', effects: [{ type: 'apply_effect', effectType: 'strength', value: 2, duration: 99 }] },
  { id: 'cracker_glass_cannon', name: 'Glass Cannon', cost: 1, type: 'code', target: 'enemy', description: 'Deal 18 damage.', rarity: 'rare', effects: [{ type: 'damage', value: 18 }] },
  { id: 'cracker_execute', name: 'Execute', cost: 3, type: 'code', target: 'enemy', description: 'Deal 30 damage. Exhaust.', rarity: 'rare', effects: [{ type: 'damage', value: 30 }], exhaust: true },
  { id: 'cracker_overclocked_strike', name: 'Overclocked Strike', cost: 2, type: 'code', target: 'enemy', description: 'Deal 20 damage. Exhaust.', rarity: 'rare', effects: [{ type: 'damage', value: 20 }], exhaust: true },
  { id: 'cracker_last_stand', name: 'Last Stand', cost: 0, type: 'code', target: 'enemy', description: 'Deal 15 damage.', rarity: 'rare', effects: [{ type: 'damage', value: 15 }] },
  { id: 'guardian_iron_wall', name: 'Iron Wall', cost: 2, type: 'firewall', target: 'self', description: 'Gain 15 block.', rarity: 'common', effects: [{ type: 'block', value: 15 }] },
  { id: 'guardian_shield_bash', name: 'Shield Bash', cost: 1, type: 'code', target: 'enemy', description: 'Deal 6 damage. Gain 3 block.', rarity: 'common', effects: [{ type: 'damage', value: 6 }, { type: 'block', value: 3 }] },
  { id: 'guardian_bulwark', name: 'Bulwark', cost: 1, type: 'firewall', target: 'self', description: 'Gain 7 block.', rarity: 'common', effects: [{ type: 'block', value: 7 }] },
  { id: 'guardian_counter_strike', name: 'Counter Strike', cost: 1, type: 'code', target: 'enemy', description: 'Deal 4 damage. Gain 4 block.', rarity: 'common', effects: [{ type: 'damage', value: 4 }, { type: 'block', value: 4 }] },
  { id: 'guardian_thorns', name: 'Thorns', cost: 1, type: 'daemon', target: 'self', description: 'Gain 6 block. Gain 1 strength.', rarity: 'uncommon', effects: [{ type: 'block', value: 6 }, { type: 'apply_effect', effectType: 'strength', value: 1, duration: 99 }] },
  { id: 'guardian_aegis', name: 'Aegis', cost: 2, type: 'firewall', target: 'self', description: 'Gain 12 block.', rarity: 'uncommon', effects: [{ type: 'block', value: 12 }] },
  { id: 'guardian_reinforce', name: 'Reinforce', cost: 0, type: 'daemon', target: 'self', description: 'Gain 1 strength.', rarity: 'uncommon', effects: [{ type: 'apply_effect', effectType: 'strength', value: 1, duration: 99 }] },
  { id: 'guardian_retaliate', name: 'Retaliate', cost: 1, type: 'code', target: 'enemy', description: 'Deal 8 damage.', rarity: 'uncommon', effects: [{ type: 'damage', value: 8 }] },
  { id: 'guardian_fortress', name: 'Fortress', cost: 2, type: 'firewall', target: 'self', description: 'Gain 10 block. Gain 1 strength.', rarity: 'uncommon', effects: [{ type: 'block', value: 10 }, { type: 'apply_effect', effectType: 'strength', value: 1, duration: 99 }] },
  { id: 'guardian_sentinel', name: 'Sentinel', cost: 3, type: 'firewall', target: 'self', description: 'Gain 25 block. Exhaust.', rarity: 'rare', effects: [{ type: 'block', value: 25 }], exhaust: true },
  { id: 'guardian_overcharge', name: 'Overcharge', cost: 1, type: 'daemon', target: 'self', description: 'Gain 2 energy. Draw 2 cards.', rarity: 'rare', effects: [{ type: 'gain_energy', value: 2 }, { type: 'draw', value: 2 }] },
  { id: 'guardian_endure', name: 'Endure', cost: 0, type: 'daemon', target: 'self', description: 'Gain 2 strength.', rarity: 'rare', effects: [{ type: 'apply_effect', effectType: 'strength', value: 2, duration: 99 }] },
  { id: 'guardian_last_bastion', name: 'Last Bastion', cost: 2, type: 'firewall', target: 'self', description: 'Gain 10 block. Heal 5 HP.', rarity: 'rare', effects: [{ type: 'block', value: 10 }, { type: 'heal', value: 5 }] },
  { id: 'guardian_taunt', name: 'Taunt', cost: 1, type: 'firewall', target: 'self', description: 'Gain 10 block.', rarity: 'rare', effects: [{ type: 'block', value: 10 }] },
  { id: 'guardian_absolute_defense', name: 'Absolute Defense', cost: 3, type: 'firewall', target: 'self', description: 'Gain 30 block. Exhaust.', rarity: 'rare', effects: [{ type: 'block', value: 30 }], exhaust: true },
  { id: 'infectant_plague', name: 'Plague', cost: 2, type: 'virus', target: 'all_enemies', description: 'Apply 3 poison to all.', rarity: 'common', effects: [{ type: 'apply_effect', effectType: 'poison', value: 3, duration: 3, target: 'all_enemies' }] },
  { id: 'infectant_corrode', name: 'Corrode', cost: 1, type: 'virus', target: 'enemy', description: 'Deal 4 damage. Apply 2 poison.', rarity: 'common', effects: [{ type: 'damage', value: 4 }, { type: 'apply_effect', effectType: 'poison', value: 2, duration: 3 }] },
  { id: 'infectant_spore_cloud', name: 'Spore Cloud', cost: 1, type: 'virus', target: 'enemy', description: 'Apply 3 poison.', rarity: 'common', effects: [{ type: 'apply_effect', effectType: 'poison', value: 3, duration: 3 }] },
  { id: 'infectant_bacterial_strike', name: 'Bacterial Strike', cost: 1, type: 'code', target: 'enemy', description: 'Deal 3 damage. Apply 1 poison.', rarity: 'common', effects: [{ type: 'damage', value: 3 }, { type: 'apply_effect', effectType: 'poison', value: 1, duration: 3 }] },
  { id: 'infectant_virus_swarm', name: 'Virus Swarm', cost: 1, type: 'virus', target: 'all_enemies', description: 'Apply 2 poison to all.', rarity: 'uncommon', effects: [{ type: 'apply_effect', effectType: 'poison', value: 2, duration: 3, target: 'all_enemies' }] },
  { id: 'infectant_malware', name: 'Malware', cost: 0, type: 'virus', target: 'enemy', description: 'Apply 2 weak. Apply 1 vulnerable.', rarity: 'uncommon', effects: [{ type: 'apply_effect', effectType: 'weak', value: 2, duration: 2 }, { type: 'apply_effect', effectType: 'vulnerable', value: 1, duration: 2 }] },
  { id: 'infectant_decompose', name: 'Decompose', cost: 1, type: 'virus', target: 'enemy', description: 'Deal 8 damage.', rarity: 'uncommon', effects: [{ type: 'damage', value: 8 }] },
  { id: 'infectant_toxic_cloud', name: 'Toxic Cloud', cost: 2, type: 'virus', target: 'all_enemies', description: 'Apply 4 poison to all. Exhaust.', rarity: 'uncommon', effects: [{ type: 'apply_effect', effectType: 'poison', value: 4, duration: 3, target: 'all_enemies' }], exhaust: true },
  { id: 'infectant_antidote', name: 'Antidote', cost: 0, type: 'ice', target: 'self', description: 'Heal 5 HP.', rarity: 'uncommon', effects: [{ type: 'heal', value: 5 }] },
  { id: 'infectant_contagion', name: 'Contagion', cost: 2, type: 'virus', target: 'enemy', description: 'Deal 6 damage. Apply 4 poison.', rarity: 'uncommon', effects: [{ type: 'damage', value: 6 }, { type: 'apply_effect', effectType: 'poison', value: 4, duration: 3 }] },
  { id: 'infectant_neural_toxin', name: 'Neural Toxin', cost: 2, type: 'virus', target: 'enemy', description: 'Apply 4 poison. Apply 2 weak.', rarity: 'rare', effects: [{ type: 'apply_effect', effectType: 'poison', value: 4, duration: 3 }, { type: 'apply_effect', effectType: 'weak', value: 2, duration: 2 }] },
  { id: 'infectant_immune_boost', name: 'Immune Boost', cost: 1, type: 'firewall', target: 'self', description: 'Gain 6 block.', rarity: 'rare', effects: [{ type: 'block', value: 6 }] },
  { id: 'infectant_parasite', name: 'Parasite', cost: 0, type: 'virus', target: 'self', description: 'Draw 3 cards.', rarity: 'rare', effects: [{ type: 'draw', value: 3 }] },
  { id: 'infectant_pandemic', name: 'Pandemic', cost: 2, type: 'virus', target: 'all_enemies', description: 'Deal 6 damage to all. Apply 2 poison.', rarity: 'rare', effects: [{ type: 'aoe_damage', value: 6 }, { type: 'apply_effect', effectType: 'poison', value: 2, duration: 3, target: 'all_enemies' }] },
  { id: 'infectant_biohazard', name: 'Biohazard', cost: 3, type: 'virus', target: 'all_enemies', description: 'Apply 8 poison to all. Exhaust.', rarity: 'rare', effects: [{ type: 'apply_effect', effectType: 'poison', value: 8, duration: 3, target: 'all_enemies' }], exhaust: true },
];

export function getCardDef(id: string): CardDefinition {
  const def = CARD_DEFINITIONS.find((c) => c.id === id);
  if (!def) throw new Error(`Card definition not found: ${id}`);
  return def;
}
