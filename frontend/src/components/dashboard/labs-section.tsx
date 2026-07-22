"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Code, Network, ShieldAlert, Play } from "lucide-react";

export function LabsSection() {
  const router = useRouter();

  const labs = [
    {
      title: "Coding Playground",
      description:
        "A client-side WASM-based code sandbox compiling Python and Javascript natively in your browser. No server delays.",
      icon: <Code className="w-5 h-5 text-cyber-purple" />,
      iconBg: "bg-cyber-purple/10",
      borderColor: "border-cyber-purple/20 hover:border-cyber-purple/40",
      glowClass: "glow-purple",
      buttonClass: "text-cyber-purple hover:text-white",
      href: "/dashboard/playground",
    },
    {
      title: "Networking Simulator",
      description:
        "Drag-and-drop network topology canvas using React Flow. Configure subnet routing rules and see packets animate along cables in real-time.",
      icon: <Network className="w-5 h-5 text-cyber-green" />,
      iconBg: "bg-cyber-green/10",
      borderColor: "border-cyber-green/20 hover:border-cyber-green/40",
      glowClass: "glow-green",
      buttonClass: "text-cyber-green hover:text-white",
      href: "/lessons/net-class-c",
    },
    {
      title: "Cybersecurity Exploit Lab",
      description:
        "A secured containerized Linux shell utilizing xterm.js. Exploit buffer overflows or crack hashes in isolated mock sandboxes.",
      icon: <ShieldAlert className="w-5 h-5 text-cyber-blue" />,
      iconBg: "bg-cyber-blue/10",
      borderColor: "border-cyber-blue/20 hover:border-cyber-blue/40",
      glowClass: "",
      buttonClass: "text-cyber-blue hover:text-white",
      href: "/lessons/cyber-suid",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-white">
        Interactive Lab Simulators
      </h2>
      <p className="text-zinc-400 text-sm">
        Launch one of the three highly responsive simulation playgrounds
        designed by our engineering team.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {labs.map((lab) => (
          <div
            key={lab.href}
            className={`p-6 rounded-2xl bg-zinc-950/40 border ${lab.borderColor} ${lab.glowClass} flex flex-col justify-between h-72 transition-all`}
          >
            <div>
              <div
                className={`w-10 h-10 rounded-lg ${lab.iconBg} flex items-center justify-center mb-4`}
              >
                {lab.icon}
              </div>
              <h3 className="font-bold text-zinc-200">{lab.title}</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                {lab.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push(lab.href)}
              className={`w-full h-10 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold ${lab.buttonClass} transition-all flex items-center justify-center gap-2 cursor-pointer`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch {lab.title}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
