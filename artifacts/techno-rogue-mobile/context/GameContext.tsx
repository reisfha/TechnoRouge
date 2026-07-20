import React, { createContext, useContext, useEffect, useState } from 'react';
import { Game, GameEventType } from '../game/Game';

interface GameContextValue {
  tick: number;
}

const GameContext = createContext<GameContextValue>({ tick: 0 });

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    const events: GameEventType[] = ['state_changed', 'card_played', 'turn_changed', 'game_over'];
    events.forEach((e) => Game.on(e, bump));
    return () => events.forEach((e) => Game.off(e, bump));
  }, []);

  return <GameContext.Provider value={{ tick }}>{children}</GameContext.Provider>;
}

export function useGame() {
  useContext(GameContext); // subscribe to ticks
  return Game;
}
