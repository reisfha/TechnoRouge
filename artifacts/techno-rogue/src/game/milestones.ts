export const MILESTONES = [
  { id: 'beat_act_1', name: 'Defeat Act 1 Boss' },
  { id: 'beat_act_2', name: 'Defeat Act 2 Boss' },
  { id: 'beat_game', name: 'Beat the game' },
  { id: 'win_netrunner', name: 'Win as Netrunner' },
  { id: 'win_gunslinger', name: 'Win as Gunslinger' },
  { id: 'win_cyborg', name: 'Win as Cyborg' },
  { id: 'win_ripper', name: 'Win as Ripper' },
  { id: 'win_corporate', name: 'Win as Corporate Agent' },
  { id: 'open_10_vaults', name: 'Open 10 Data Vaults' },
  { id: 'own_5_packages', name: 'Own 5 Packages in one run' },
  { id: 'reach_300_cb', name: 'Reach 300 CB in one run' }
] as const;

export type MilestoneId = typeof MILESTONES[number]['id'];

export interface MetaState {
  unlockedMilestones: MilestoneId[];
  vaultsOpened: number;
}

export const loadMetaState = (): MetaState => {
  try {
    const data = localStorage.getItem('technorogue_meta');
    if (data) return JSON.parse(data);
  } catch (e) {}
  return { unlockedMilestones: [], vaultsOpened: 0 };
};

export const saveMetaState = (state: MetaState) => {
  localStorage.setItem('technorogue_meta', JSON.stringify(state));
};
