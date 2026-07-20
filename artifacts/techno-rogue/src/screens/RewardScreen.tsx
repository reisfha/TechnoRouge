import React from 'react';
import { useGame } from '../context/GameContext';
import { getRandomCardsForClass } from '../game/cards';
import { PACKAGES } from '../game/packages';

export const RewardScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const [cardsPicked, setCardsPicked] = React.useState(false);
  const [cards] = React.useState(() => state.player ? getRandomCardsForClass(state.player.class, 3) : []);

  if (!state.combat?.rewards) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-black font-mono">
        <button className="border p-4 text-primary" onClick={() => dispatch({ type: 'PROCEED_TO_MAP' })}>PROCEED</button>
      </div>
    );
  }

  const { cryptobytes, packageDrop } = state.combat.rewards;
  const pkgDef = packageDrop ? PACKAGES.find(p => p.id === packageDrop) : null;

  return (
    <div className="min-h-[100dvh] flex flex-col p-6 bg-black text-foreground font-mono crt-flicker">
      <div className="absolute inset-0 scanlines z-50 pointer-events-none opacity-50" />
      
      <h2 className="text-3xl font-display text-primary mb-8 text-center mt-8 glitch-text" data-text="COMBAT RESOLVED">COMBAT RESOLVED</h2>
      
      <div className="flex-1 max-w-md mx-auto w-full z-10">
        <div className="border border-yellow-500/50 p-4 mb-4 flex justify-between items-center bg-yellow-900/10">
           <span className="text-yellow-400">DATA EXTRACTED:</span>
           <span className="text-yellow-400 font-bold">+{cryptobytes} CB</span>
        </div>

        {pkgDef && (
          <div className="border border-secondary/50 p-4 mb-4 bg-secondary/10">
            <div className="text-secondary font-bold text-sm mb-1">PACKAGE SECURED: {pkgDef.name}</div>
            <div className="text-xs text-muted-foreground">{pkgDef.description}</div>
          </div>
        )}

        {!cardsPicked && (
          <div className="mt-8">
            <h3 className="text-xl mb-4 text-center text-primary">SELECT CARD REWARD</h3>
            <div className="flex flex-col gap-3">
              {cards.map(card => (
                <div 
                  key={card.id} 
                  className="border border-primary/50 p-3 bg-card hover:bg-primary/20 cursor-pointer transition-colors"
                  onClick={() => {
                    dispatch({ type: 'CLAIM_REWARD', payload: { card } });
                    setCardsPicked(true);
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-primary">{card.name} <span className="text-xs text-muted-foreground ml-2">[{card.cost} EN]</span></span>
                    <span className="text-[10px] uppercase text-muted-foreground">{card.type}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{card.description}</div>
                </div>
              ))}
              <div 
                  className="border border-muted p-3 bg-card hover:bg-muted/50 cursor-pointer text-center text-sm text-muted-foreground transition-colors"
                  onClick={() => setCardsPicked(true)}
                >
                  SKIP CARDS
              </div>
            </div>
          </div>
        )}

        {cardsPicked && (
           <div className="mt-12">
             <button 
                onClick={() => dispatch({ type: 'PROCEED_TO_MAP' })}
                className="w-full border border-primary py-4 font-display font-bold text-primary hover:bg-primary hover:text-black transition-colors"
              >
                PROCEED
              </button>
           </div>
        )}
      </div>
    </div>
  );
};
