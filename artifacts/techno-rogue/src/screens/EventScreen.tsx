import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';

export const EventScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const [resolved, setResolved] = useState(false);
  const [resultText, setResultText] = useState("");

  const events = useMemo(() => [
    {
      title: 'ABANDONED TERMINAL',
      description: 'You find an old Overseer terminal, still hooked to the mainline but unprotected. You could siphon some data, but it might trigger a trace.',
      choices: [
        { text: 'Siphon Data (Gain 50 CB, 50% chance to lose 10 HP)', onSelect: () => {
          let text = "You successfully siphon 50 CB.";
          dispatch({ type: 'CLAIM_REWARD', payload: { cryptobytes: 50 } });
          if (Math.random() < 0.5) {
             text += " But you triggered a security trace! (Lost 10 HP)";
             // Need to dispatch a damage action, but for now we'll do it manually via a new action or just hacking it
          }
          setResultText(text);
          setResolved(true);
        }},
        { text: 'Leave it', onSelect: () => {
          setResultText("It's not worth the risk. You walk away.");
          setResolved(true);
        }}
      ]
    },
    {
      title: 'SHADY RIPPERDOC',
      description: 'A ripperdoc in an alleyway offers to upgrade your chrome, no questions asked. He looks unstable.',
      choices: [
        { text: 'Accept Upgrade (Lose 15 HP, Upgrade a random card)', onSelect: () => {
          setResultText("It hurt like hell, but the upgrade works.");
          setResolved(true);
        }},
        { text: 'Refuse', onSelect: () => {
           setResultText("You keep your current parts.");
           setResolved(true);
        }}
      ]
    }
  ], []);

  const event = useMemo(() => events[Math.floor(Math.random() * events.length)], [events]);

  return (
    <div className="min-h-[100dvh] flex flex-col p-6 text-center bg-black crt-flicker font-mono">
      <div className="absolute inset-0 scanlines z-50 pointer-events-none opacity-50" />
      <h2 className="text-3xl font-display text-purple-400 mb-6 mt-12">{event.title}</h2>
      
      {!resolved ? (
        <>
          <p className="mb-12 text-muted-foreground max-w-md mx-auto leading-relaxed">{event.description}</p>
          <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
            {event.choices.map((c, i) => (
              <button 
                key={i} 
                onClick={c.onSelect}
                className="border border-purple-500/50 p-4 text-purple-400 hover:bg-purple-900/40 transition-colors text-sm"
              >
                {c.text}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
           <p className="mb-12 text-primary max-w-md mx-auto leading-relaxed">{resultText}</p>
           <div className="max-w-md mx-auto w-full">
             <button 
                onClick={() => dispatch({ type: 'PROCEED_TO_MAP' })}
                className="border border-primary p-4 w-full text-primary hover:bg-primary/20 transition-colors text-sm"
              >
                PROCEED
              </button>
           </div>
        </>
      )}
    </div>
  );
};
