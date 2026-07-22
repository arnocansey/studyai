"use client";

import React from "react";
import { BookOpen, ChevronRight } from "lucide-react";
import { CourseCard } from "./course-card";

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

interface CoursesListProps {
  courses: Course[];
  onEnter: (slug: string) => void;
  onBrowseAll: () => void;
  onEnroll?: (courseId: string) => void;
  enrollingId?: string | null;
}

export function CoursesList({
  courses,
  onEnter,
  onBrowseAll,
  onEnroll,
  enrollingId,
}: CoursesListProps) {
  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyber-purple" />
          <span>Your Courses</span>
        </h2>
        <button
          onClick={onBrowseAll}
          className="text-xs font-bold text-cyber-purple hover:text-cyber-purple/80 flex items-center gap-1 transition-colors"
        >
          <span>Browse All</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onEnter={onEnter}
            onEnroll={onEnroll}
            enrollingId={enrollingId}
          />
        ))}
      </div>
    </div>
  );
}
