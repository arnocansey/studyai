'use client';

import React from 'react';
import { Cpu } from 'lucide-react';

export function SkeletonCard() {
  return (
    <div className="p-5 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 animate-pulse">
      <div className="flex gap-4 items-start md:items-center">
        <div className="w-12 h-12 rounded-xl bg-zinc-800" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 bg-zinc-800 rounded" />
          <div className="h-4 w-48 bg-zinc-800 rounded" />
          <div className="h-3 w-32 bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 to-zinc-900 p-6 md:p-8 animate-pulse">
        <div className="max-w-2xl space-y-4">
          <div className="h-6 w-32 bg-zinc-800 rounded-full" />
          <div className="h-10 w-64 bg-zinc-800 rounded" />
          <div className="h-4 w-96 bg-zinc-800 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="space-y-4">
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

export function SkeletonLesson() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-zinc-800 rounded" />
      <div className="h-4 w-96 bg-zinc-800 rounded" />
      <div className="h-64 w-full bg-zinc-800 rounded-2xl" />
    </div>
  );
}

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} rounded-lg bg-gradient-to-tr from-cyber-purple to-cyber-blue flex items-center justify-center shadow-lg`}>
      <Cpu className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
    </div>
  );
}
