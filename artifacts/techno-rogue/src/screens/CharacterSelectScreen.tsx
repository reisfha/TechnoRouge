import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CharacterClass } from '../game/types';
import { Button } from '@/components/ui/button';

export const CharacterSelectScreen: React.FC = () => {
  const { dispatch } = useGame();
  const [selected, setSelected] = useState<CharacterClass>('NETRUNNER');

  const classes: { id: CharacterClass; name: string; desc: string; color: string; hp: number }[] = [
    { id: 'NETRUNNER', name: 'NETRUNNER', desc: 'Hacker. Applies Virus stacks, draws cards rapidly.', color: 'text-cyan-400', hp: 70 },
    { id: 'STREET_SAMURAI', name: 'STREET SAMURAI', desc: 'Aggressive melee. High damage, momentum based.', color: 'text-orange-500', hp: 90 },
    { id: 'CORPORATE_FIXER', name: 'CORPORATE FIXER', desc: 'Manipulator. Gold mechanics, card copying.', color: 'text-yellow-400', hp: 80 },
  ];

  const handleStart = () => {
    dispatch({ type: 'START_GAME', payload: { playerClass: selected } });
  };

  return (
    <div className="min-h-[100dvh] p-6 flex flex-col relative z-20">
      <h2 className="text-3xl font-display text-center mb-8 text-primary">SELECT OPERATIVE</h2>
      
      <div className="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full">
        {classes.map(cls => (
          <div 
            key={cls.id}
            onClick={() => setSelected(cls.id)}
            className={`p-4 border bg-card/50 cursor-pointer transition-all ${
              selected === cls.id ? 'border-primary shadow-[0_0_15px_rgba(0,255,255,0.3)]' : 'border-muted hover:border-muted-foreground'
            }`}
          >
            <div className={`text-xl font-bold font-display ${cls.color}`}>{cls.name}</div>
            <div className="text-sm mt-2 text-muted-foreground font-mono">{cls.desc}</div>
            <div className="text-xs mt-2 text-foreground font-mono">HP: {cls.hp} // EN: 3</div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center pb-8">
        <Button 
          onClick={handleStart}
          size="lg"
          className="w-full max-w-md bg-primary text-black rounded-none font-bold"
        >
          EXECUTE
        </Button>
      </div>
    </div>
  );
};
