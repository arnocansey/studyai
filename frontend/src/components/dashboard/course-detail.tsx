'use client';

import React from 'react';
import { ArrowRight, BookOpen, Code, Network, ShieldAlert, Play, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Lesson {
  id: string;
  title: string;
  type: string;
  locked?: boolean;
}

interface Module {
  title: string;
  name?: string;
  lessons: Lesson[];
}

interface CourseDetails {
  title: string;
  description: string;
  modules: Module[];
}

interface CourseDetailProps {
  course: CourseDetails;
  onBack: () => void;
}

export function CourseDetail({ course, onBack }: CourseDetailProps) {
  const router = useRouter();

  const getLessonIcon = (type: string) => {
    if (type === 'NET_SUBNET' || type === 'NETWORKING_LAB') {
      return { icon: <Network className="w-4 h-4 text-cyber-green" />, badge: 'Network Canvas', badgeClass: 'text-cyber-green bg-cyber-green/10 border-cyber-green/20' };
    }
    if (type === 'CYBER_EXPLOIT' || type === 'CYBER_LAB') {
      return { icon: <ShieldAlert className="w-4 h-4 text-cyber-blue" />, badge: 'Exploit Shell', badgeClass: 'text-cyber-blue bg-cyber-blue/10 border-cyber-blue/20' };
    }
    return { icon: <Code className="w-4 h-4 text-cyber-purple" />, badge: 'Coding Sandbox', badgeClass: 'text-cyber-purple bg-cyber-purple/10 border-cyber-purple/20' };
  };

  return (
    <div className="space-y-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-400 hover:text-white font-bold text-xs transition-colors cursor-pointer border-none bg-transparent"
      >
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span>Back to Dashboard</span>
      </button>

      {/* Glowing banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6 md:p-8 glow-purple">
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyber-purple/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyber-purple bg-cyber-purple/10 border border-cyber-purple/20 px-2.5 py-1 rounded-full">
            Course Syllabus
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">{course.title}</h1>
          <p className="text-zinc-400 text-sm max-w-3xl leading-relaxed">{course.description}</p>
        </div>
      </div>

      {/* Modules list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyber-purple" />
            <span>Curriculum Timeline</span>
          </h2>

          <div className="space-y-8 relative pl-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-[2px] before:bg-zinc-850">
            {course.modules?.map((mod, mIdx) => (
              <div key={mIdx} className="space-y-4 relative">
                <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-cyber-purple border-2 border-[#030303]" />
                <h3 className="text-sm font-bold text-zinc-300">{mod.title || mod.name}</h3>

                <div className="space-y-3">
                  {mod.lessons?.map((les, lIdx) => {
                    const { icon, badge, badgeClass } = getLessonIcon(les.type);

                    return (
                      <div
                        key={lIdx}
                        className={`p-4 rounded-xl border border-zinc-850 bg-zinc-950/40 flex justify-between items-center transition-all ${
                          les.locked ? 'opacity-50' : 'hover:border-zinc-700/60 hover:bg-zinc-900/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">{icon}</div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-200">{les.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${badgeClass} px-2 py-0.5 rounded-full border`}>
                                {badge}
                              </span>
                              {les.locked && <span className="text-[9px] font-semibold text-zinc-600">Locked</span>}
                            </div>
                          </div>
                        </div>

                        {!les.locked ? (
                          <button
                            onClick={() => router.push(`/lessons/${les.id}`)}
                            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-[10px] font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span>Start Lab</span>
                            <Play className="w-2.5 h-2.5 fill-current" />
                          </button>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-600 text-xs">
                            🔒
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metadata Card */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-cyber-blue" />
            <span>Track Stats</span>
          </h2>

          <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-800 space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Instructor</span>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyber-blue flex items-center justify-center font-bold text-xs text-zinc-950">
                  AI
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Dr. Elyra Vance</p>
                  <p className="text-[10px] text-zinc-500">Principal Systems Engineer</p>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-900 pt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Prerequisites:</span>
                <span className="text-zinc-300 font-medium">None</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Target XP:</span>
                <span className="text-cyber-green font-bold">+1,200 XP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Skill Badges:</span>
                <span className="text-cyber-purple font-bold">1 Unlocked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
