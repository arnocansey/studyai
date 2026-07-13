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
}

interface CourseCatalogProps {
  courses: Course[];
  onEnter: (slug: string) => void;
}

export function CourseCatalog({ courses, onEnter }: CourseCatalogProps) {
  const getIcon = (category: string) => {
    if (category === 'Programming') return <Code className="w-5 h-5 text-cyber-purple" />;
    if (category === 'Networking') return <Network className="w-5 h-5 text-cyber-green" />;
    return <ShieldAlert className="w-5 h-5 text-cyber-blue" />;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-white">Technology Course Catalogs</h2>
      <p className="text-zinc-400 text-sm">Select a learning track to start coding or designing network topologies.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-800 flex flex-col justify-between h-56 hover:border-zinc-700 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyber-purple/5 transition-all duration-300 cursor-pointer"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  {getIcon(course.category)}
                </div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{course.difficulty}</span>
              </div>
              <h3 className="font-bold text-zinc-200">{course.title}</h3>
              <p className="text-xs text-zinc-500 mt-2">{course.lessons} full curriculum modules</p>
            </div>
            <div className="pt-4 flex items-center justify-between border-t border-zinc-900">
              <span className="text-xs text-zinc-400">{course.progress}% Complete</span>
              <button
                onClick={() => onEnter(course.slug)}
                className="text-xs font-bold text-cyber-purple flex items-center gap-1 hover:underline cursor-pointer border-none bg-transparent"
              >
                <span>Enter course</span>
                <Play className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
