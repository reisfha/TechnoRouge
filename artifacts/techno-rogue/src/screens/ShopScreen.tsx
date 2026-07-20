import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { getRandomCardsForClass } from '../game/cards';
import { PACKAGES, getRandomPackage, PackageDef } from '../game/packages';

export const ShopScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  
  // Memoize shop inventory so it doesn't change on re-renders
  const inventory = useMemo(() => {
    if (!state.player) return { cards: [], packages: [] };
    const cards = getRandomCardsForClass(state.player.class, 6);
    const pkgs: PackageDef[] = [];
    for(let i=0; i<3; i++) {
       const pkg = getRandomPackage(state.player.packages);
       if (pkg && !pkgs.find(p => p.id === pkg.id)) pkgs.push(pkg);
    }
    return { cards, packages: pkgs };
  }, [state.player?.class]);

  if (!state.player) return null;

  return (
    <div className="min-h-[100dvh] bg-black text-foreground font-mono p-4 flex flex-col overflow-y-auto crt-flicker">
      <div className="absolute inset-0 scanlines z-50 pointer-events-none opacity-50" />
      
      <div className="flex justify-between items-center mb-6 border-b border-border pb-2 z-10">
        <h2 className="text-2xl font-display text-yellow-400">BLACK MARKET</h2>
        <div className="text-yellow-400">CB: {state.player.cryptobytes}</div>
      </div>

      <div className="mb-6 z-10">
        <h3 className="text-lg text-primary mb-2">CARDS</h3>
        <div className="flex gap-2 overflow-x-auto pb-4 snap-x">
          {inventory.cards.map((card, i) => {
            let cost = 50 + (card.rarity === 'Rare' ? 50 : card.rarity === 'Uncommon' ? 25 : 0);
            if (state.player!.packages.includes('bribe_chip')) cost = Math.floor(cost * 0.8);
            const canAfford = state.player!.cryptobytes >= cost;
            const alreadyBought = state.player!.deck.find(c => c.id === card.id);
            if (alreadyBought) return null;

            return (
              <div key={card.id} className="snap-center shrink-0 w-36 border border-primary/50 bg-card flex flex-col justify-between">
                <div className="p-2 border-b border-muted text-[10px] font-bold truncate text-primary">{card.name}</div>
                <div className="p-2 text-[10px] text-muted-foreground flex-1">{card.description}</div>
                <button 
                  onClick={() => dispatch({ type: 'BUY_CARD', payload: { card, cost } })}
                  disabled={!canAfford}
                  className={`p-2 text-xs border-t border-muted font-bold text-center transition-colors ${canAfford ? 'hover:bg-yellow-400 hover:text-black text-yellow-400 cursor-pointer' : 'text-muted-foreground opacity-50'}`}
                >
                  {cost} CB
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mb-6 z-10">
        <h3 className="text-lg text-secondary mb-2">PACKAGES</h3>
        <div className="flex flex-col gap-2">
          {inventory.packages.map((pkg, i) => {
            if (!pkg) return null;
            let cost = pkg.price;
            if (state.player!.packages.includes('bribe_chip')) cost = Math.floor(cost * 0.8);
            const canAfford = state.player!.cryptobytes >= cost;
            const alreadyBought = state.player!.packages.includes(pkg.id);
            if (alreadyBought) return null;

            return (
              <div key={pkg.id} className="border border-secondary/30 bg-card p-3 flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-secondary">{pkg.name}</div>
                  <div className="text-xs text-muted-foreground">{pkg.description}</div>
                </div>
                <button 
                  onClick={() => dispatch({ type: 'BUY_PACKAGE', payload: { packageId: pkg.id, cost } })}
                  disabled={!canAfford}
                  className={`ml-4 px-3 py-1 border text-xs font-bold transition-colors ${canAfford ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black' : 'border-muted text-muted-foreground opacity-50'}`}
                >
                  {cost} CB
                </button>
              </div>
            )
          })}
        </div>
      </div>
      
      <div className="mb-6 z-10">
        <h3 className="text-lg text-red-500 mb-2">SERVICES</h3>
        <div className="border border-red-500/30 bg-card p-3 flex justify-between items-center">
          <div>
            <div className="text-sm font-bold text-red-500">Card Removal</div>
            <div className="text-xs text-muted-foreground">Remove a card from your deck.</div>
          </div>
          <button 
            disabled={true}
            className={`ml-4 px-3 py-1 border text-xs font-bold border-muted text-muted-foreground opacity-50`}
          >
            NOT IMPL
          </button>
        </div>
      </div>

      <div className="mt-auto pt-8 z-10">
        <button 
          onClick={() => dispatch({ type: 'PROCEED_TO_MAP' })}
          className="w-full border border-primary py-3 font-display text-primary hover:bg-primary hover:text-black transition-colors"
        >
          LEAVE MARKET
        </button>
      </div>
    </div>
  );
};
