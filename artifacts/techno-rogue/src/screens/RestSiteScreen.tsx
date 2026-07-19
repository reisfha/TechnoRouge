import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '@/components/ui/button';

export const RestSiteScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const [selectedAction, setSelectedAction] = useState<'HEAL' | 'UPGRADE' | null>(null);

  if (!state.player) return null;

  const handleAction = () => {
    if (selectedAction === 'HEAL') {
      dispatch({ type: 'HEAL_REST' });
      dispatch({ type: 'PROCEED_TO_MAP' });
    } else if (selectedAction === 'UPGRADE') {
      // Simplification: In a full game, this opens deck viewer.
      // Here we just auto upgrade a random card.
      const unupgraded = state.player!.deck.filter(c => !c.isUpgraded);
      if (unupgraded.length > 0) {
        const randCard = unupgraded[Math.floor(Math.random() * unupgraded.length)];
        dispatch({ type: 'UPGRADE_CARD', payload: { cardId: randCard.id } });
      }
      dispatch({ type: 'PROCEED_TO_MAP' });
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center items-center p-6 bg-background/95 relative z-20">
      <h2 className="text-3xl font-display mb-12 text-green-400">SAFEHOUSE</h2>
      
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <div 
          onClick={() => setSelectedAction('HEAL')}
          className={`border p-6 text-center cursor-pointer transition-all ${
            selectedAction === 'HEAL' ? 'border-green-400 bg-green-900/30' : 'border-muted hover:border-muted-foreground'
          }`}
        >
          <div className="text-xl font-display text-green-400 mb-2">RECHARGE</div>
          <div className="text-sm text-muted-foreground">Restore 25% Max HP</div>
        </div>

        <div 
          onClick={() => setSelectedAction('UPGRADE')}
          className={`border p-6 text-center cursor-pointer transition-all ${
            selectedAction === 'UPGRADE' ? 'border-primary bg-primary/20' : 'border-muted hover:border-muted-foreground'
          }`}
        >
          <div className="text-xl font-display text-primary mb-2">OPTIMIZE</div>
          <div className="text-sm text-muted-foreground">Upgrade a random datashard</div>
        </div>
      </div>

      <div className="mt-12 w-full max-w-sm">
        <Button 
          disabled={!selectedAction}
          onClick={handleAction}
          className="w-full bg-primary text-black rounded-none"
        >
          CONFIRM
        </Button>
      </div>
    </div>
  );
};
