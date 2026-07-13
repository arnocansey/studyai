'use client';

import React from 'react';
import { Shield, Cpu, ArrowRight } from 'lucide-react';

interface InstructorPanelProps {
  username: string;
}

export function InstructorPanel({ username }: InstructorPanelProps) {
  const metrics = [
    { title: 'Active Enrolled Cadets', value: '142 Students', detail: '+12 new signups this week', icon: '🎓' },
    { title: 'Pending Code Submissions', value: '8 submissions', detail: 'Requires manual evaluation', icon: '📝' },
    { title: 'Average Streak Rate', value: '4.8 Days', detail: 'Streak incentive positive', icon: '⚡' },
  ];

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900 p-6 md:p-8 glow-blue">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyber-blue/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyber-blue/10 border border-cyber-blue/30 rounded-full text-xs text-cyber-blue font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>Laboratory Instructor Portal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Welcome Back, Instructor {username}.
          </h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
            You have active laboratory classes. Review cadet logs, grade pending code submissions, or construct new modules using our sandbox visualizer.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-800 space-y-2">
            <div className="text-3xl">{metric.icon}</div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{metric.title}</div>
            <div className="text-xl font-bold text-white">{metric.value}</div>
            <div className="text-[10px] text-zinc-400">{metric.detail}</div>
          </div>
        ))}
      </div>

      <section className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/20 backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyber-blue" />
              <span>Curriculum & Lab Builder</span>
            </h3>
            <p className="text-xs text-zinc-400 max-w-xl">
              Add new lessons, define VM sandbox setups, configure multiple-choice question validation keys, or write customized instructions.
            </p>
          </div>
          <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyber-blue to-teal-500 hover:opacity-90 text-zinc-950 font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer border-none">
            <span>Create Course Curriculum</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-950" />
          </button>
        </div>
      </section>
    </>
  );
}
