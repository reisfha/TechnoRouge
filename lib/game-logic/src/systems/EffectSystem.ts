import { ActiveEffect } from '../entities/Effect';

export class EffectSystem {
  static getStacks(effects: ActiveEffect[], name: string): number {
    return effects
      .filter((e) => e.name === name)
      .reduce((sum, e) => sum + e.stacks, 0);
  }

  static addEffect(
    effects: ActiveEffect[],
    name: string,
    type: 'buff' | 'debuff',
    stacks: number,
    duration: number
  ): ActiveEffect[] {
    const existing = effects.find((e) => e.name === name);
    if (existing) {
      existing.stacks += stacks;
      if (duration > existing.turnsRemaining) {
        existing.turnsRemaining = duration;
      }
      return effects;
    }
    return [
      ...effects,
      {
        id: `${name}_${Math.random().toString(36).substr(2, 5)}`,
        name,
        type,
        stacks,
        turnsRemaining: duration,
        maxDuration: duration,
      },
    ];
  }

  static tickEffects(effects: ActiveEffect[]): ActiveEffect[] {
    return effects.filter((e) => {
      e.turnsRemaining--;
      return e.turnsRemaining > 0 && e.stacks > 0;
    });
  }

  static removeEffect(effects: ActiveEffect[], name: string): ActiveEffect[] {
    return effects.filter((e) => e.name !== name);
  }
}
