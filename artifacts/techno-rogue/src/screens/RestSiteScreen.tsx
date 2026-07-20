import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export const RestSiteScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const [upgrading, setUpgrading] = useState(false);

  if (!state.player) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center bg-black font-mono crt-flicker relative">
      <div className="absolute inset-0 scanlines z-50 pointer-events-none opacity-50" />
      
      {!upgrading ? (
        <div className="max-w-md w-full z-10">
          <h2 className="text-4xl font-display text-green-500 mb-2">ERROR 429</h2>
          <h3 className="text-xl text-green-400 mb-8">TOO MANY REQUESTS. COOLING DOWN.</h3>
          
          <p className="mb-12 text-muted-foreground text-sm">
            Safe zone established. You can rest to restore 30% HP, or optimize a piece of code (Upgrade Card).
          </p>

          <div className="flex flex-col gap-4">
            <button 
              className="border border-green-500 p-4 text-green-500 hover:bg-green-900/40 transition-colors flex justify-between items-center"
              onClick={() => {
                dispatch({ type: 'HEAL_REST' });
                dispatch({ type: 'PROCEED_TO_MAP' });
              }}
            >
              <span>RESTORE CACHE</span>
              <span className="text-xs">Heal 30% HP</span>
            </button>

            <button 
              className="border border-primary p-4 text-primary hover:bg-primary/20 transition-colors flex justify-between items-center"
              onClick={() => setUpgrading(true)}
            >
              <span>OPTIMIZE CODE</span>
              <span className="text-xs">Upgrade 1 Card</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-md w-full z-10 flex flex-col h-[80vh]">
          <h2 className="text-2xl font-display text-primary mb-6">SELECT CARD TO UPGRADE</h2>
          
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-4">
            {state.player.deck.filter(c => !c.isUpgraded).map(card => (
              <div 
                key={card.id} 
                className="border border-primary/30 p-3 bg-card hover:bg-primary/20 cursor-pointer text-left transition-colors"
                onClick={() => {
                  dispatch({ type: 'UPGRADE_CARD', payload: { cardId: card.id } });
                  dispatch({ type: 'PROCEED_TO_MAP' });
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-primary">{card.name}</span>
                  <span className="text-[10px] uppercase text-muted-foreground">{card.type}</span>
                </div>
                <div className="text-xs text-muted-foreground">{card.description}</div>
                {(card.damage || card.block) && (
                   <div className="text-[10px] text-green-400 mt-1">Upgrades: +3 Base Stat</div>
                )}
              </div>
            ))}
            {state.player.deck.filter(c => !c.isUpgraded).length === 0 && (
              <div className="text-muted-foreground text-sm py-8">All cards upgraded.</div>
            )}
          </div>
          
          <button 
            className="border border-muted p-4 text-muted-foreground hover:bg-muted/20 transition-colors mt-4"
            onClick={() => setUpgrading(false)}
          >
            CANCEL
          </button>
        </div>
      )}
    </div>
  );
};
