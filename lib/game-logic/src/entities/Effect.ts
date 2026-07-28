export interface ActiveEffect {
  id: string;
  name: string;
  type: 'buff' | 'debuff';
  stacks: number;
  turnsRemaining: number;
  maxDuration: number;
}

export function createEffect(name: string, type: 'buff' | 'debuff', stacks: number, duration: number): ActiveEffect {
  return {
    id: `${name}_${Math.random().toString(36).substr(2, 5)}`,
    name,
    type,
    stacks,
    turnsRemaining: duration,
    maxDuration: duration,
  };
}
