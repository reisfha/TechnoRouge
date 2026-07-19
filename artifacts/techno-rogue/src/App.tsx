import React from 'react';
import { TitleScreen } from './screens/TitleScreen';
import { CharacterSelectScreen } from './screens/CharacterSelectScreen';
import { MapScreen } from './screens/MapScreen';
import { CombatScreen } from './screens/CombatScreen';
import { RewardScreen } from './screens/RewardScreen';
import { RestSiteScreen } from './screens/RestSiteScreen';
import { useGame, GameProvider } from './context/GameContext';
import { Button } from '@/components/ui/button';

const ScreenRouter: React.FC = () => {
  const { state, dispatch } = useGame();

  // Basic catch-alls for un-implemented screens
  const EventScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-display text-purple-400 mb-4">SYSTEM ANOMALY</h2>
      <p className="mb-8">You found some credits lying around.</p>
      <Button onClick={() => {
        dispatch({ type: 'CLAIM_REWARD', payload: { gold: 30 } });
        dispatch({ type: 'PROCEED_TO_MAP' });
      }}>Proceed</Button>
    </div>
  );

  const ShopScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-display text-yellow-400 mb-4">BLACK MARKET</h2>
      <p className="mb-8">Vendor is out of stock. Move along.</p>
      <Button onClick={() => dispatch({ type: 'PROCEED_TO_MAP' })}>Leave</Button>
    </div>
  );

  const GameOverScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-5xl font-display text-red-500 mb-4 glitch-text" data-text="SYSTEM FAILURE">SYSTEM FAILURE</h2>
      <p className="mb-8 text-muted-foreground">Floors cleared: {state.run.floorsCleared}</p>
      <Button onClick={() => dispatch({ type: 'RESTART' })}>REBOOT</Button>
    </div>
  );

  const VictoryScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-5xl font-display text-primary mb-4 glitch-text" data-text="UPLINK ESTABLISHED">UPLINK ESTABLISHED</h2>
      <p className="mb-8 text-muted-foreground">You survived.</p>
      <Button onClick={() => dispatch({ type: 'RESTART' })}>START NEW RUN</Button>
    </div>
  );

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
