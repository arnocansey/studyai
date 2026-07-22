"use client";

import React from "react";
import { Code, Network, ShieldAlert, Play, UserPlus } from "lucide-react";

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
  enrolled?: boolean;
}

interface CourseCardProps {
  course: Course;
  onEnter: (slug: string) => void;
  onEnroll?: (courseId: string) => void;
  enrollingId?: string | null;
}

export function CourseCard({
  course,
  onEnter,
  onEnroll,
  enrollingId,
}: CourseCardProps) {
  const getIcon = () => {
    if (course.icon) return course.icon;
    if (course.category === "Programming")
      return <Code className="w-5 h-5 text-cyber-purple" />;
    if (course.category === "Networking")
      return <Network className="w-5 h-5 text-cyber-green" />;
    return <ShieldAlert className="w-5 h-5 text-cyber-blue" />;
  };

  return (
    <div className="flex cursor-pointer flex-col items-start justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-5 transition-all duration-300 hover:scale-[1.01] hover:border-zinc-700/50 hover:bg-zinc-900/20 hover:shadow-lg hover:shadow-cyber-purple/5 md:flex-row md:items-center">
      <div className="flex items-start gap-4 md:items-center">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
          {getIcon()}
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {course.category}
          </span>
          <h3 className="text-base font-bold text-zinc-200">{course.title}</h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            {course.enrolled
              ? `${course.completed} of ${course.lessons} lessons completed • ${course.difficulty}`
              : `Not enrolled • ${course.difficulty}`}
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-6 md:w-auto md:justify-end">
        <div className="w-24 flex-shrink-0 space-y-1 md:w-28">
          <div className="flex justify-between text-[10px] font-bold text-zinc-500">
            <span>Progress</span>
            <span>{course.progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyber-purple to-cyber-blue transition-all duration-500"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>

        {course.enrolled ? (
          <button
            onClick={() => onEnter(course.slug)}
            className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 shadow-md transition-all hover:border-zinc-700 hover:text-white"
          >
            <Play className="h-3.5 w-3.5 fill-zinc-500 text-zinc-500 transition-all group-hover:fill-white group-hover:text-white" />
            <span>Resume</span>
          </button>
        ) : (
          <button
            onClick={() => onEnroll?.(course.id)}
            disabled={enrollingId === course.id}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyber-purple/40 bg-cyber-purple/10 px-4 py-2 text-xs font-semibold text-cyber-purple transition-all hover:bg-cyber-purple/20 disabled:opacity-50"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>{enrollingId === course.id ? "Enrolling…" : "Enroll"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
