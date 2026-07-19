import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Card as CardType } from '../game/types';
import { motion, AnimatePresence } from 'framer-motion';

export const CombatScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);

  if (!state.combat || !state.player) return null;

  const { player, combat } = state;
  const { enemies, hand, turn } = combat;

  const classColor = 
    player.class === 'NETRUNNER' ? 'var(--color-netrunner)' : 
    player.class === 'STREET_SAMURAI' ? 'var(--color-samurai)' : 'var(--color-fixer)';

  const handleCardClick = (idx: number) => {
    if (turn !== 'player') return;
    
    // If it targets an enemy, in a full game we'd wait for enemy click.
    // For mobile simplicty, auto-target first enemy if only 1 exists, 
    // or if we select it we wait for enemy tap.
    
    if (enemies.length === 1) {
      dispatch({ type: 'PLAY_CARD', payload: { cardIndex: idx, targetEnemyId: enemies[0].id } });
      setSelectedCardIdx(null);
    } else {
      setSelectedCardIdx(idx);
    }
  };

  const handleEnemyClick = (enemyId: string) => {
    if (selectedCardIdx !== null) {
      dispatch({ type: 'PLAY_CARD', payload: { cardIndex: selectedCardIdx, targetEnemyId: enemyId } });
      setSelectedCardIdx(null);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background font-mono relative overflow-hidden">
      {/* Scanline overlay */}
      <div className="absolute inset-0 scanlines z-50 pointer-events-none" />

      {/* TOP: Enemies */}
      <div className="flex-1 flex items-center justify-center gap-4 p-4 border-b border-border bg-card/20 relative z-10">
        <AnimatePresence>
          {enemies.map((enemy) => (
            <motion.div 
              key={enemy.id} 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => handleEnemyClick(enemy.id)}
              className={`flex flex-col items-center w-32 ${selectedCardIdx !== null ? 'cursor-pointer hover:drop-shadow-[0_0_10px_red]' : ''}`}
            >
              {/* Intent */}
              <div className="h-8 mb-2 flex items-center justify-center text-xs bg-black/50 px-2 border border-muted rounded text-yellow-400">
                {enemy.intent?.type === 'ATTACK' && `ATK ${enemy.intent.value}`}
                {enemy.intent?.type === 'DEFEND' && `DEF ${enemy.intent.value}`}
                {enemy.intent?.type === 'DEBUFF' && `DEBUFF`}
                {enemy.intent?.type === 'BUFF' && `BUFF`}
              </div>
              
              {/* Sprite Mock */}
              <div className="w-16 h-16 bg-muted-foreground polygon-clip mb-4 flex items-center justify-center text-2xl"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', backgroundColor: '#333' }}>
                🤖
              </div>

              {/* Status */}
              <div className="text-xs text-center">{enemy.name}</div>
              
              {/* HP Bar */}
              <div className="w-full h-3 bg-red-900/50 mt-1 border border-red-900 relative">
                <div 
                  className="h-full bg-red-500 transition-all" 
                  style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white">
                  {enemy.hp}/{enemy.maxHp}
                </div>
              </div>
              {enemy.block > 0 && <div className="text-[10px] text-blue-400 mt-1">BLOCK: {enemy.block}</div>}
              
              {/* Debuffs */}
              <div className="flex gap-1 mt-1 text-[10px]">
                {enemy.statusEffects.virus > 0 && <span className="text-green-500">VRS:{enemy.statusEffects.virus}</span>}
                {enemy.statusEffects.vulnerable > 0 && <span className="text-purple-500">VUL:{enemy.statusEffects.vulnerable}</span>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* MIDDLE: Player Status */}
      <div className="h-24 bg-card/80 border-b border-border p-2 flex justify-between items-center relative z-10 px-4">
        <div className="flex flex-col">
          <span className="text-primary font-display">{player.class}</span>
          <div className="w-40 h-4 bg-green-900/50 border border-green-900 relative mt-1">
            <div 
              className="h-full bg-green-500 transition-all" 
              style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white">
              {player.hp}/{player.maxHp}
            </div>
          </div>
          <div className="flex gap-2 mt-1">
            {player.block > 0 && <span className="text-blue-400 text-xs font-bold border border-blue-400 px-1">BLK: {player.block}</span>}
            <span className="text-yellow-400 text-xs">EN: {player.energy}/{player.maxEnergy}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button 
            className="border border-primary px-4 py-2 text-sm bg-primary/10 hover:bg-primary hover:text-black font-bold active:bg-primary/50"
            onClick={() => dispatch({ type: 'END_TURN' })}
            disabled={turn !== 'player'}
          >
            END TURN
          </button>
          <div className="text-[10px] text-muted-foreground flex gap-2">
            <span>DRAW: {combat.drawPile.length}</span>
            <span>DISC: {combat.discardPile.length}</span>
          </div>
        </div>
      </div>

      {/* BOTTOM: Hand */}
      <div className="h-[40vh] p-4 flex gap-2 overflow-x-auto relative z-10 snap-x items-end pb-8">
        <AnimatePresence>
          {hand.map((card, idx) => {
            const playable = player.energy >= card.cost;
            const selected = selectedCardIdx === idx;
            
            return (
              <motion.div
                key={card.id}
                layout
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: selected ? -20 : 0, opacity: playable ? 1 : 0.5 }}
                exit={{ y: -100, opacity: 0, scale: 0.8 }}
                onClick={() => handleCardClick(idx)}
                className={`snap-center shrink-0 w-36 h-48 border bg-[#0a0a0f] flex flex-col relative transition-all`}
                style={{ 
                  borderColor: classColor,
                  boxShadow: selected ? `0 0 15px ${classColor}` : 'none'
                }}
              >
                {/* Type Stripe */}
                <div className="absolute left-0 top-0 bottom-0 w-1 opacity-80" 
                  style={{ 
                    backgroundColor: card.type === 'Attack' ? 'red' : card.type === 'Defense' ? 'blue' : card.type === 'Power' ? 'purple' : 'yellow' 
                  }} 
                />
                
                <div className="p-2 border-b border-muted/30 flex justify-between items-center bg-black/40">
                  <span className="font-display text-[10px] truncate w-24 text-white" style={{ color: classColor }}>{card.name}</span>
                  <div className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold"
                    style={{ borderColor: classColor, color: classColor }}>
                    {card.cost}
                  </div>
                </div>
                
                <div className="flex-1 p-2 text-[10px] text-muted-foreground leading-tight">
                  {card.description}
                  {card.damage && <div className="mt-1 text-red-400">Dmg: {card.damage}</div>}
                  {card.block && <div className="mt-1 text-blue-400">Blk: {card.block}</div>}
                </div>
                
                <div className="text-[8px] p-1 text-center border-t border-muted/30 opacity-50 uppercase tracking-widest">
                  {card.type}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
