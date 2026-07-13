'use client';

import React from 'react';
import { Shield } from 'lucide-react';

interface AdminPanelProps {
  username: string;
}

export function AdminPanel({ username }: AdminPanelProps) {
  const systems = [
    { title: 'Neon DB Connections', value: '8 / 50 Active Pools', detail: 'Latency: 24ms (SSL)', icon: '💾' },
    { title: 'Gemini Orchestration API', value: 'Status: Online', detail: 'Usage: 3.4K calls today', icon: '🤖' },
    { title: 'Sandbox MicroVM Status', value: 'Healthy', detail: '0 active security alarms', icon: '🔒' },
  ];

  const auditLogs = [
    { time: '01:31:02', ip: '192.168.1.104', action: 'USER_SIGNUP', desc: 'cadet@studyai.io created STUDENT profile' },
    { time: '01:28:44', ip: '10.0.8.22', action: 'LAB_SUBMIT', desc: 'student@studyai.io triggered Cyber flag verification' },
    { time: '01:25:12', ip: '192.168.1.203', action: 'STREAK_CHECK_IN', desc: 'Checked in, updated streak stats' },
  ];

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900 p-6 md:p-8 glow-red">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-xs text-red-400 font-medium">
            <Shield className="w-3.5 h-3.5 animate-pulse" />
            <span>System Administrator Portal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Root Console, {username}.
          </h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
            Overview of global compute systems, direct Neon database pools, and system security logs.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {systems.map((system, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-800 space-y-2">
            <div className="text-3xl">{system.icon}</div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{system.title}</div>
            <div className="text-xl font-bold text-white">{system.value}</div>
            <div className="text-[10px] text-zinc-400">{system.detail}</div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/20 space-y-4">
        <h3 className="text-sm font-bold text-white">Direct Security Audit Log</h3>
        <div className="space-y-2 text-xs font-mono">
          {auditLogs.map((log, idx) => (
            <div key={idx} className="flex justify-between p-2 rounded-lg bg-zinc-900/30 border border-zinc-850 text-zinc-400">
              <div className="flex gap-3">
                <span className="text-zinc-600">[{log.time}]</span>
                <span className="text-cyber-purple font-bold">{log.action}</span>
                <span>{log.desc}</span>
              </div>
              <span className="text-zinc-600">{log.ip}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
