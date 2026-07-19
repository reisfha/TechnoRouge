import React from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '@/components/ui/button';
import { getRandomCardsForClass } from '../game/cards';

export const RewardScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  
  // Memoize so it doesn't rerender different cards
  const [cards] = React.useState(() => {
    if (state.player) {
      return getRandomCardsForClass(state.player.class, 3);
    }
    return [];
  });
  
  const [gold] = React.useState(() => Math.floor(Math.random() * 20) + 15);
  const [goldClaimed, setGoldClaimed] = React.useState(false);
  const [cardClaimed, setCardClaimed] = React.useState(false);

  if (!state.player) return null;

  return (
    <div className="min-h-[100dvh] p-6 flex flex-col z-20 relative bg-background/95">
      <h2 className="text-3xl font-display text-center mb-8 text-primary">VICTORY</h2>
      
      <div className="flex-1 max-w-md mx-auto w-full flex flex-col gap-6">
        
        {/* Gold Reward */}
        {!goldClaimed && (
          <Button 
            variant="outline" 
            className="w-full justify-start h-16 border-yellow-500/50 hover:border-yellow-400"
            onClick={() => {
              dispatch({ type: 'CLAIM_REWARD', payload: { gold } });
              setGoldClaimed(true);
            }}
          >
            <span className="text-yellow-400 text-lg mr-4">+ {gold}</span> CREDITS
          </Button>
        )}

        {/* Card Reward */}
        {!cardClaimed && (
          <div className="mt-4">
            <h3 className="text-muted-foreground text-sm mb-4">SELECT DATASHARD:</h3>
            <div className="flex flex-col gap-3">
              {cards.map((card, i) => (
                <div 
                  key={i}
                  onClick={() => {
                    dispatch({ type: 'CLAIM_REWARD', payload: { card } });
                    setCardClaimed(true);
                  }}
                  className="border border-muted p-4 cursor-pointer hover:border-primary bg-card"
                >
                  <div className="flex justify-between font-display text-sm">
                    <span className="text-primary">{card.name}</span>
                    <span className="text-yellow-400">Cost: {card.cost}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">{card.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <div className="mt-8 text-center pb-8">
        <Button 
          onClick={() => dispatch({ type: 'PROCEED_TO_MAP' })}
          className="w-full max-w-md bg-muted text-white rounded-none"
        >
          CONTINUE
        </Button>
      </div>
    </div>
  );
};
