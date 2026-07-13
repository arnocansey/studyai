'use client';

import React, { useState } from 'react';
import { Terminal, ArrowRight, CheckCircle, RotateCcw } from 'lucide-react';

interface QuickLabProps {
  onXpAwarded: (xp: number) => void;
}

export function QuickLab({ onXpAwarded }: QuickLabProps) {
  const [subnetInput, setSubnetInput] = useState('');
  const [subnetStatus, setSubnetStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subnetInput.trim() === '255.255.255.252') {
      setSubnetStatus('correct');
      onXpAwarded(150);
    } else {
      setSubnetStatus('incorrect');
    }
  };

  const resetChallenge = () => {
    setSubnetInput('');
    setSubnetStatus('idle');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
        <Terminal className="w-5 h-5 text-cyber-green" />
        <span>Daily Quick Lab</span>
      </h2>

      <div className="p-6 rounded-2xl bg-zinc-950/40 border border-cyber-green/20 bg-gradient-to-b from-zinc-950/80 to-zinc-950/30 flex flex-col justify-between h-[340px] glow-green relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-green/5 blur-3xl rounded-full" />

        <div className="space-y-3 relative z-10">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyber-green bg-cyber-green/10 border border-cyber-green/20 px-2 py-0.5 rounded-full">
              Networking Practice
            </span>
            <span className="text-xs text-zinc-500 font-medium">+150 XP</span>
          </div>

          <h3 className="text-sm font-bold text-zinc-200">Point-to-Point Mask Calculator</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            A WAN link is set up using the CIDR subnet block <strong>10.0.0.44/30</strong>.
            To configure the router interface, what is the correct subnet mask?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 relative z-10 pt-4">
          {subnetStatus === 'idle' && (
            <>
              <input
                type="text"
                value={subnetInput}
                onChange={(e) => setSubnetInput(e.target.value)}
                placeholder="e.g. 255.255.255.0"
                className="w-full h-10 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 placeholder-zinc-600 focus:border-cyber-green focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-cyber-green hover:bg-cyber-green/90 text-zinc-950 font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Validate Answer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {subnetStatus === 'correct' && (
            <div className="p-3 bg-cyber-green/10 border border-cyber-green/30 rounded-xl text-cyber-green space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Correct! +150 XP Awarded</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">
                Excellent work! /30 provides 4 total IPs, with 2 host IPs, giving a subnet mask of 255.255.255.252.
              </p>
              <button
                type="button"
                onClick={resetChallenge}
                className="w-full h-8 mt-1 border border-cyber-green/20 hover:border-cyber-green/40 text-[10px] font-bold text-cyber-green rounded-lg transition-all"
              >
                Reset Challenge
              </button>
            </div>
          )}

          {subnetStatus === 'incorrect' && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                <RotateCcw className="w-4 h-4" />
                <span>Validation Failed</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">
                That subnet mask is incorrect for /30. Review subnets or ask the AI Coach.
              </p>
              <button
                type="button"
                onClick={() => setSubnetStatus('idle')}
                className="w-full h-8 mt-1 bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-300 rounded-lg hover:border-zinc-700 transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
