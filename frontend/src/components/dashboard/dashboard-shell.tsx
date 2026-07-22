"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  Code,
  Cpu,
  GraduationCap,
  LogOut,
  MessageSquare,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";

const studentNav = [
  { href: "/", label: "Dashboard", icon: BookOpen },
  { href: "/dashboard/study-plan", label: "Study Plan", icon: Sparkles },
  { href: "/dashboard/gamification", label: "Gamification", icon: Trophy },
  { href: "/dashboard/social", label: "Social", icon: Users },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/playground", label: "Playground", icon: Code },
];

const instructorNav = [
  { href: "/", label: "Dashboard", icon: BookOpen },
  {
    href: "/dashboard/manage-courses",
    label: "Manage Courses",
    icon: GraduationCap,
  },
  { href: "/dashboard/submissions", label: "Submissions", icon: ClipboardList },
  { href: "/dashboard/students", label: "Students", icon: Users },
];

const adminNav = [
  ...instructorNav,
  { href: "/dashboard/gamification", label: "Leaderboard", icon: Trophy },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const role = user?.role || "STUDENT";

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030303] text-zinc-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#030303] text-zinc-100 cyber-grid">
      <aside className="hidden w-64 flex-col justify-between border-r border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md md:flex">
        <div>
          <div className="flex h-16 items-center gap-3 border-b border-zinc-800/80 px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyber-purple to-cyber-blue shadow-lg">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-lg font-bold tracking-wider text-transparent">
              StudyAI
            </span>
          </div>
          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    active
                      ? "border border-zinc-700/30 bg-zinc-800/40 font-medium text-white"
                      : "text-zinc-400 hover:bg-zinc-900/30 hover:text-zinc-200"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="space-y-3 border-t border-zinc-800/80 p-4">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold">
              {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-zinc-500">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-zinc-400 transition-all hover:bg-zinc-900/30 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex gap-2 overflow-x-auto border-b border-zinc-800/80 bg-zinc-950/80 p-3 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold ${
                pathname === item.href
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
