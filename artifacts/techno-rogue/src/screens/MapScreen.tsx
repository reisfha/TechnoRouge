import React from 'react';
import { useGame } from '../context/GameContext';
import { NodeType } from '../game/types';
import { Shield, Skull, Tent, Store, HelpCircle, Swords } from 'lucide-react';

export const MapScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  
  if (!state.map || !state.player) return null;

  const handleNodeClick = (nodeId: string) => {
    if (state.map?.availableNodeIds.includes(nodeId)) {
      dispatch({ type: 'SELECT_NODE', payload: { nodeId } });
    }
  };

  const getNodeIcon = (type: NodeType) => {
    switch(type) {
      case 'COMBAT': return <Swords size={20} className="text-gray-400" />;
      case 'ELITE': return <Skull size={24} className="text-red-500" />;
      case 'REST': return <Tent size={20} className="text-green-400" />;
      case 'SHOP': return <Store size={20} className="text-yellow-400" />;
      case 'EVENT': return <HelpCircle size={20} className="text-purple-400" />;
      case 'BOSS': return <Skull size={32} className="text-red-600 drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]" />;
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col relative bg-background font-mono overflow-y-auto">
      <div className="sticky top-0 p-4 border-b border-border bg-background/90 backdrop-blur z-20 flex justify-between items-center text-sm">
        <div>
          <span className="text-muted-foreground">HP:</span> 
          <span className="text-green-400 ml-1">{state.player.hp}/{state.player.maxHp}</span>
        </div>
        <div>
          <span className="text-muted-foreground">CREDITS:</span> 
          <span className="text-yellow-400 ml-1">{state.player.gold}</span>
        </div>
        <div>
          <span className="text-primary font-display">ACT {state.map.act}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col-reverse justify-start items-center py-12 gap-12 max-w-md mx-auto w-full relative">
        {/* Draw edges could go here via SVG overlay, simplified for now */}
        
        {state.map.nodes.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-8 w-full z-10 relative">
            {row.map(node => {
              const isAvailable = state.map!.availableNodeIds.includes(node.id);
              const isCompleted = state.map!.completedNodeIds.includes(node.id);
              const isCurrent = state.map!.currentNodeId === node.id;
              
              let statusClass = "border-muted opacity-50";
              if (isAvailable) statusClass = "border-primary cursor-pointer animate-pulse drop-shadow-[0_0_8px_var(--primary)]";
              if (isCompleted) statusClass = "border-muted-foreground opacity-30 bg-muted";
              if (isCurrent) statusClass = "border-primary bg-primary/20 scale-110";

              return (
                <div 
                  key={node.id} 
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center bg-card transition-all ${statusClass}`}
                  onClick={() => handleNodeClick(node.id)}
                >
                  {getNodeIcon(node.type)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
