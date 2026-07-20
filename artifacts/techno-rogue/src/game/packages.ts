export interface PackageDef {
  id: string;
  name: string;
  description: string;
  price: number;
}

export const PACKAGES: PackageDef[] = [
  { id: 'quantum_cache', name: 'Quantum Cache', description: 'Start each combat with 1 extra card drawn.', price: 200 },
  { id: 'neural_splitter', name: 'Neural Splitter', description: 'First Skill each combat plays twice.', price: 250 },
  { id: 'blood_battery', name: 'Blood Battery', description: 'Heal 3 HP after each combat.', price: 150 },
  { id: 'zero_day_cartridge', name: 'Zero-Day Cartridge', description: 'Enemies start combat with 1 Virus.', price: 150 },
  { id: 'chrome_knuckles', name: 'Chrome Knuckles', description: '+2 damage on all attacks.', price: 200 },
  { id: 'firmware_patch', name: 'Firmware Patch', description: '+1 energy on turn 1 of each combat.', price: 250 },
  { id: 'overseer_fragment', name: 'Overseer Fragment', description: 'See boss intents 1 extra turn ahead.', price: 200 },
  { id: 'ghost_sim', name: 'Ghost SIM', description: 'First time you would die each run, survive at 1 HP.', price: 250 },
  { id: 'data_siphon', name: 'Data Siphon', description: '+5 CB after each combat.', price: 150 },
  { id: 'bribe_chip', name: 'Bribe Chip', description: 'Shops are 20% cheaper.', price: 150 },
  { id: 'shock_absorber', name: 'Shock Absorber', description: 'Start each combat with 5 block.', price: 150 },
  { id: 'reactive_plating', name: 'Reactive Plating', description: 'Whenever you take unblocked damage, gain 3 Block.', price: 200 },
  { id: 'adrenaline_injector', name: 'Adrenaline Injector', description: 'Start each combat with 1 Strength.', price: 250 },
  { id: 'virus_multiplier', name: 'Virus Multiplier', description: 'Virus deals 2 damage per stack instead of 1.', price: 250 },
  { id: 'combo_capacitor', name: 'Combo Capacitor', description: 'Playing 3 attacks in a turn gives 1 Energy.', price: 200 }
];

export const getRandomPackage = (exclude: string[]): PackageDef | null => {
  const available = PACKAGES.filter(p => !exclude.includes(p.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
};
