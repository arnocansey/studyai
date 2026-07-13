'use client';

import React from 'react';
import { Code, Network, ShieldAlert, Play } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  progress: number;
  lessons: number;
  completed: number;
  color: string;
  icon?: React.ReactNode;
  accent?: string;
}

interface CourseCardProps {
  course: Course;
  onEnter: (slug: string) => void;
}

export function CourseCard({ course, onEnter }: CourseCardProps) {
  const getIcon = () => {
    if (course.icon) return course.icon;
    if (course.category === 'Programming') return <Code className="w-5 h-5 text-cyber-purple" />;
    if (course.category === 'Networking') return <Network className="w-5 h-5 text-cyber-green" />;
    return <ShieldAlert className="w-5 h-5 text-cyber-blue" />;
  };

  return (
    <div className="p-5 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 hover:border-zinc-700/50 hover:bg-zinc-900/20 hover:scale-[1.01] hover:shadow-lg hover:shadow-cyber-purple/5 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer">
      <div className="flex gap-4 items-start md:items-center">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
          {getIcon()}
        </div>
        <div>
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">{course.category}</span>
          <h3 className="text-base font-bold text-zinc-200">{course.title}</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            {course.completed} of {course.lessons} lessons completed • {course.difficulty}
          </p>
        </div>
      </div>

      <div className="w-full md:w-auto flex items-center gap-6 justify-between md:justify-end">
        <div className="space-y-1 w-24 md:w-28 flex-shrink-0">
          <div className="flex justify-between text-[10px] font-bold text-zinc-500">
            <span>Progress</span>
            <span>{course.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyber-purple to-cyber-blue transition-all duration-500"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => onEnter(course.slug)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-md group cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 text-zinc-500 fill-zinc-500 group-hover:fill-white group-hover:text-white transition-all" />
          <span>Resume</span>
        </button>
      </div>
    </div>
  );
}
