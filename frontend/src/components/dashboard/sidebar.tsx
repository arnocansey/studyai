"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Code,
  Terminal,
  Trophy,
  Cpu,
  LogOut,
  Users,
  ClipboardList,
  GraduationCap,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  username: string;
  userRole: string;
  role?: "STUDENT" | "INSTRUCTOR" | "ADMIN";
}

export function Sidebar({
  activeTab,
  onTabChange,
  username,
  userRole,
  role = "STUDENT",
}: SidebarProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const studentNav = [
    { id: "dashboard", label: "Dashboard", icon: BookOpen, href: "/" },
    { id: "courses", label: "Courses", icon: Code },
    { id: "labs", label: "Simulated Labs", icon: Terminal },
    {
      id: "study-plan",
      label: "Study Plan",
      icon: Sparkles,
      href: "/dashboard/study-plan",
    },
    {
      id: "gamification",
      label: "Gamification",
      icon: Trophy,
      href: "/dashboard/gamification",
    },
    { id: "social", label: "Social", icon: Users, href: "/dashboard/social" },
    { id: "chat", label: "Chat", icon: MessageSquare, href: "/dashboard/chat" },
  ];

  const instructorNav = [
    { id: "dashboard", label: "Dashboard", icon: BookOpen, href: "/" },
    {
      id: "manage-courses",
      label: "Manage Courses",
      icon: GraduationCap,
      href: "/dashboard/manage-courses",
    },
    {
      id: "submissions",
      label: "Submissions",
      icon: ClipboardList,
      href: "/dashboard/submissions",
    },
    {
      id: "students",
      label: "Students",
      icon: Users,
      href: "/dashboard/students",
    },
  ];

  const adminNav = [
    ...instructorNav,
    {
      id: "gamification",
      label: "Leaderboard",
      icon: Trophy,
      href: "/dashboard/gamification",
    },
  ];

  const navItems =
    role === "ADMIN"
      ? adminNav
      : role === "INSTRUCTOR"
        ? instructorNav
        : studentNav;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleNav = (item: (typeof studentNav)[number]) => {
    if (item.href) {
      router.push(item.href);
      return;
    }
    onTabChange(item.id);
  };

  return (
    <aside className="hidden w-64 flex-col justify-between border-r border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md md:flex">
      <div>
        <div className="flex h-16 items-center gap-3 border-b border-zinc-800/80 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyber-purple to-cyber-blue shadow-lg">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-lg font-bold tracking-wider text-transparent">
              StudyAI
            </span>
            <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-cyber-green" />
          </div>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const active = item.href
              ? pathname === item.href
              : activeTab === item.id && pathname === "/";
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                  active
                    ? "border border-zinc-700/30 bg-zinc-800/40 font-medium text-white shadow-inner"
                    : "text-zinc-400 hover:bg-zinc-900/30 hover:text-zinc-200"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 border-t border-zinc-800/80 p-4">
        <div className="flex items-center gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-2">
          <div className="rounded-full bg-gradient-to-br from-cyber-purple via-cyber-blue to-cyber-green p-[2px]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{username}</p>
            <p className="text-xs text-zinc-500">{userRole}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-zinc-400 transition-all duration-200 hover:bg-zinc-900/30 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
        <Link href="/dashboard/study-plan" className="sr-only">
          Study plan
        </Link>
      </div>
    </aside>
  );
}
