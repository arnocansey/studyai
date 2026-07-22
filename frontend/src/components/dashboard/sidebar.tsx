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
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
    <aside className="hidden w-64 flex-col justify-between border-r border-sidebar-border bg-sidebar md:flex">
      <div>
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Cpu className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">StudyAI</span>
        </div>

        <nav className="space-y-1 p-3" aria-label="Main">
          {navItems.map((item) => {
            const active = item.href
              ? pathname === item.href
              : activeTab === item.id && pathname === "/";
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{username}</p>
            <p className="text-xs text-muted-foreground">{userRole}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            className="flex-1 justify-start text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
        <Link href="/dashboard/study-plan" className="sr-only">
          Study plan
        </Link>
      </div>
    </aside>
  );
}
