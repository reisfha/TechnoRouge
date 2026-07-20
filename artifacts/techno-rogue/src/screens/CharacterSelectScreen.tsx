import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CharacterClass } from '../game/types';

export const CharacterSelectScreen: React.FC = () => {
  const { dispatch } = useGame();
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);

  const classes: { id: CharacterClass; name: string; color: string; desc: string; passive: string }[] = [
    { id: 'NETRUNNER', name: 'NETRUNNER', color: 'var(--color-netrunner)', desc: 'Hacker, Virus, Control', passive: 'Backdoor: Bonus effects vs debuffed enemies.' },
    { id: 'GUNSLINGER', name: 'GUNSLINGER', color: 'var(--color-gunslinger)', desc: 'Merc, Combo, Multi-hit', passive: 'Fan the Hammer: Every 3rd attack plays twice.' },
    { id: 'CYBORG', name: 'CYBORG', color: 'var(--color-cyborg)', desc: 'Chrome, HP for Power', passive: 'Overclock: Pay HP instead of energy when out.' },
    { id: 'RIPPER', name: 'RIPPER', color: 'var(--color-ripper)', desc: 'Doctor, Healing to Damage', passive: 'Surge: Healing above max HP adds damage.' },
    { id: 'CORPORATE_AGENT', name: 'CORP AGENT', color: 'var(--color-corporate)', desc: 'Budget, Drones', passive: 'Expense Account: Unspent budget becomes block.' },
  ];

  const handleSelect = (cls: CharacterClass) => {
    setSelectedClass(cls);
  };

  const handleStart = () => {
    if (selectedClass) {
      dispatch({ type: 'START_GAME', payload: { playerClass: selectedClass } });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-green-500 font-mono p-4 flex flex-col relative overflow-hidden crt-flicker">
      <div className="absolute inset-0 scanlines z-50 pointer-events-none opacity-50" />
      
      <div className="mb-4">
        <h1 className="text-2xl font-display text-primary glitch-text" data-text="SELECT CLASS">SELECT CLASS</h1>
      </div>

      <div className="flex-1 overflow-y-auto z-10 flex flex-col gap-4 pb-20">
        {classes.map(c => (
          <div 
            key={c.id}
            onClick={() => handleSelect(c.id)}
            className={`border p-3 cursor-pointer transition-all ${selectedClass === c.id ? 'bg-green-900/30 border-green-400' : 'border-green-900/50 hover:border-green-600'}`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-display font-bold" style={{ color: c.color }}>{c.name}</span>
              {selectedClass === c.id && <span className="text-xs animate-pulse">SELECTED</span>}
            </div>
            <div className="text-xs text-green-400/80 mb-2">{c.desc}</div>
            <div className="text-xs border-t border-green-900/50 pt-1 mt-1">
              <span className="text-yellow-500/80">PASSIVE:</span> {c.passive}
            </div>
          </div>
        ))}
      </div>

      {selectedClass && (
        <div className="absolute bottom-4 left-4 right-4 z-20">
           <button 
             onClick={handleStart}
             className="w-full border-2 border-primary bg-primary/20 py-3 font-display font-bold text-primary hover:bg-primary hover:text-black transition-colors"
           >
             INITIALIZE UPLINK
           </button>
        </div>
      )}
    </div>
  );
};
