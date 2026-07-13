'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface WelcomeBannerProps {
  username: string;
  userRole: string;
  userXP: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function WelcomeBanner({ username, userRole, userXP }: WelcomeBannerProps) {
  const xpProgress = Math.round(((userXP % 1000) / 1000) * 100);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900 p-6 md:p-8 glow-purple animate-fade-in">
      <div className="absolute right-0 top-0 w-96 h-96 bg-cyber-purple/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-cyber-blue/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-2xl relative z-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyber-purple/10 border border-cyber-purple/30 rounded-full text-xs text-cyber-purple font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Learning Route Active</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
          {getGreeting()}, {username}.
        </h1>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          You are currently scaling through your <strong>IP Routing & Network Architectures</strong> course.
          Let&apos;s finish today&apos;s subnetting checkpoints to claim your bonus badges.
        </p>

        <div className="pt-2 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-zinc-400">{userRole}</span>
            <span className="text-zinc-300">{userXP} / 3,000 XP ({xpProgress}%)</span>
          </div>
          <div className="h-2.5 w-full bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyber-purple to-cyber-blue rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
