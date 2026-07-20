import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { MILESTONES, loadMetaState } from '../game/milestones';

export const TitleScreen: React.FC = () => {
  const { dispatch } = useGame();
  const [output, setOutput] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const [bootPhase, setBootPhase] = useState(0);

  useEffect(() => {
    const bootSequence = [
      "OVERSEER UPLINK v2.1 ... STARTING",
      "CHECKING MEMORY BANKS ... OK",
      "MOUNTING ENCRYPTED VOLUMES ... OK",
      "ESTABLISHING SECURE CONNECTION ...",
      "ACCESS GRANTED.",
      "Type 'help' for a list of commands."
    ];

    let delay = 0;
    bootSequence.forEach((line, i) => {
      delay += 400 + Math.random() * 400;
      setTimeout(() => {
        setOutput(prev => [...prev, line]);
        if (i === bootSequence.length - 1) setBootPhase(1);
      }, delay);
    });
  }, []);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView();
  }, [output, bootPhase]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    setOutput(prev => [...prev, `> ${trimmed}`]);
    
    if (trimmed === 'run' || trimmed === 'start') {
      dispatch({ type: 'GO_TO_CHARACTER_SELECT' });
      return;
    }

    if (trimmed === 'classes') {
      setOutput(prev => [...prev, 
        "AVAILABLE CLASSES:",
        "1. NETRUNNER (Hacker, Virus, Control)",
        "2. GUNSLINGER (Merc, Combo, Multi-hit)",
        "3. CYBORG (Chrome, HP for Power)",
        "4. RIPPER (Doctor, Healing to Damage)",
        "5. CORPORATE_AGENT (Budget, Drones)"
      ]);
    } else if (trimmed === 'milestones') {
      const meta = loadMetaState();
      setOutput(prev => [...prev, "MILESTONE PROGRESS:"]);
      MILESTONES.forEach(m => {
        const unlocked = meta.unlockedMilestones.includes(m.id);
        setOutput(prev => [...prev, `[${unlocked ? 'X' : ' '}] ${m.name}`]);
      });
    } else if (trimmed === 'help') {
      setOutput(prev => [...prev, 
        "COMMANDS:",
        "  run / start  - Begin new uplink",
        "  classes      - View class dossiers",
        "  milestones   - View progress",
        "  help         - Show this message"
      ]);
    } else if (trimmed !== '') {
      setOutput(prev => [...prev, `Command not found: ${trimmed}`]);
    }

    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-green-500 font-mono p-4 flex flex-col relative overflow-hidden crt-flicker">
      <div className="absolute inset-0 scanlines z-50 pointer-events-none opacity-50" />
      
      <div className="flex-1 overflow-y-auto pb-20 relative z-10 text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-4xl font-display text-primary glitch-text" data-text="TECHNOROGUE">TECHNOROGUE</h1>
        </div>
        
        {output.map((line, i) => (
          <div key={i} className="mb-1">{line}</div>
        ))}

        {bootPhase === 1 && (
          <div className="flex items-center mt-2">
            <span className="mr-2">&gt;</span>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none text-green-500 flex-1 caret-transparent"
              autoFocus
              autoComplete="off"
              spellCheck="false"
            />
            {input.length === 0 && <span className="terminal-cursor" />}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {bootPhase === 1 && (
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap gap-2">
          {['run', 'classes', 'milestones', 'help'].map(cmd => (
            <button 
              key={cmd}
              onClick={() => handleCommand(cmd)}
              className="border border-green-500/50 bg-green-900/20 px-3 py-1 text-xs hover:bg-green-500 hover:text-black transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
