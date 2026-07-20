import React from 'react';
import { TitleScreen } from './screens/TitleScreen';
import { CharacterSelectScreen } from './screens/CharacterSelectScreen';
import { MapScreen } from './screens/MapScreen';
import { CombatScreen } from './screens/CombatScreen';
import { RewardScreen } from './screens/RewardScreen';
import { RestSiteScreen } from './screens/RestSiteScreen';
import { ShopScreen } from './screens/ShopScreen';
import { EventScreen } from './screens/EventScreen';
import { useGame, GameProvider } from './context/GameContext';
import { MILESTONES, loadMetaState } from './game/milestones';

const ScreenRouter: React.FC = () => {
  const { state, dispatch } = useGame();

  const GameOverScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-black crt-flicker">
      <div className="absolute inset-0 scanlines z-50 pointer-events-none opacity-50" />
      <h2 className="text-5xl font-display text-red-500 mb-4 glitch-text" data-text="SYSTEM FAILURE">SYSTEM FAILURE</h2>
      <p className="mb-2 text-muted-foreground font-mono">Floors cleared: {state.run.floorsCleared}</p>
      <p className="mb-2 text-muted-foreground font-mono">Enemies neutralized: {state.run.enemiesKilled}</p>
      <p className="mb-8 text-muted-foreground font-mono">Max CB reached: {state.run.maxCryptobytes}</p>
      <button 
        className="border border-red-500 text-red-500 px-6 py-2 font-mono hover:bg-red-500 hover:text-black transition-colors"
        onClick={() => dispatch({ type: 'RESTART' })}
      >
        REBOOT
      </button>
    </div>
  );

  const VictoryScreen = () => {
    const meta = loadMetaState();
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-black crt-flicker">
        <div className="absolute inset-0 scanlines z-50 pointer-events-none opacity-50" />
        <h2 className="text-5xl font-display text-primary mb-4 glitch-text" data-text="UPLINK ESTABLISHED">UPLINK ESTABLISHED</h2>
        <p className="mb-8 text-primary font-mono">You survived. The Overseer has been purged.</p>
        
        <div className="mb-8 text-left border border-primary/30 p-4 bg-primary/10 w-full max-w-md">
          <h3 className="text-xl font-display text-primary mb-2">RUN STATS</h3>
          <p className="text-muted-foreground font-mono text-sm">Floors cleared: {state.run.floorsCleared}</p>
          <p className="text-muted-foreground font-mono text-sm">Enemies neutralized: {state.run.enemiesKilled}</p>
          <p className="text-muted-foreground font-mono text-sm">Packages acquired: {state.player?.packages.length}</p>
        </div>

        <button 
          className="border border-primary text-primary px-6 py-2 font-mono hover:bg-primary hover:text-black transition-colors"
          onClick={() => dispatch({ type: 'RESTART' })}
        >
          DISCONNECT
        </button>
      </div>
    );
  };

  switch (state.screen) {
    case 'title': return <TitleScreen />;
    case 'characterSelect': return <CharacterSelectScreen />;
    case 'map': return <MapScreen />;
    case 'combat': return <CombatScreen />;
    case 'reward': return <RewardScreen />;
    case 'restSite': return <RestSiteScreen />;
    case 'event': return <EventScreen />;
    case 'shop': return <ShopScreen />;
    case 'gameOver': return <GameOverScreen />;
    case 'victory': return <VictoryScreen />;
    default: return <TitleScreen />;
  }
};

function App() {
  return (
    <GameProvider>
      <ScreenRouter />
    </GameProvider>
  );
}

export default App;
