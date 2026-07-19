import React from 'react';
import { useGame } from '../context/GameContext';
import { Button } from '@/components/ui/button';

export const TitleScreen: React.FC = () => {
  const { dispatch } = useGame();

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background elements */}
      <div className="absolute inset-0 scanlines z-10" />
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(#1a1a2e 2px, transparent 2px), linear-gradient(90deg, #1a1a2e 2px, transparent 2px)',
          backgroundSize: '30px 30px'
        }}
      />
      
      <div className="z-20 text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-black text-primary glitch-text" data-text="TECHNO ROGUE">
          TECHNO ROGUE
        </h1>
        
        <p className="text-muted-foreground text-sm tracking-[0.2em] font-mono">
          NEO-AKIHABARA 2087 // OVERSEER UPLINK PENDING
        </p>

        <div className="pt-12 flex flex-col items-center gap-4">
          <Button 
            size="lg"
            className="text-lg px-12 py-6 rounded-none border border-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all duration-300 neon-shadow"
            onClick={() => dispatch({ type: 'GO_TO_CHARACTER_SELECT' })}
          >
            INITIALIZE RUN
          </Button>
          <span className="text-xs text-muted-foreground">V 1.0.0_BETA</span>
        </div>
      </div>
    </div>
  );
};
