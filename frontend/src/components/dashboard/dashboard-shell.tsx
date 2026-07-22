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
  Search,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { CommandPalette } from "@/components/command-palette";
import { PageTransition } from "@/components/page-transition";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-3 p-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground cyber-grid">
      <CommandPalette />
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
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
              {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground">{role}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start text-muted-foreground"
              onClick={() => {
                window.dispatchEvent(new Event("studyai:open-command-palette"));
              }}
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
              <kbd className="ml-auto rounded border border-border px-1.5 text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </Button>
          </div>
          <Separator />
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-border bg-card/80 px-3 py-2 md:hidden">
          <div className="flex flex-1 gap-2 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <ThemeToggle />
        </div>
        <main className="flex-1 p-6 md:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
