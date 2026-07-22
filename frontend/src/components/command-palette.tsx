"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  BookOpen,
  ClipboardList,
  Code,
  GraduationCap,
  LogOut,
  MessageSquare,
  Search,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const studentRoutes = [
  { href: "/", label: "Dashboard", icon: BookOpen },
  { href: "/dashboard/study-plan", label: "Study Plan", icon: Sparkles },
  { href: "/dashboard/gamification", label: "Gamification", icon: Trophy },
  { href: "/dashboard/social", label: "Social", icon: Users },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/playground", label: "Playground", icon: Code },
];

const instructorRoutes = [
  { href: "/", label: "Dashboard", icon: BookOpen },
  {
    href: "/dashboard/manage-courses",
    label: "Manage Courses",
    icon: GraduationCap,
  },
  { href: "/dashboard/submissions", label: "Submissions", icon: ClipboardList },
  { href: "/dashboard/students", label: "Students", icon: Users },
  { href: "/dashboard/study-plan", label: "Study Plan", icon: Sparkles },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const role = user?.role || "STUDENT";

  const routes =
    role === "ADMIN" || role === "INSTRUCTOR"
      ? instructorRoutes
      : studentRoutes;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("studyai:open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("studyai:open-command-palette", onOpen);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <Command className="rounded-2xl bg-popover text-popover-foreground">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Command.Input
              placeholder="Search navigation…"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
            <Command.Group
              heading="Navigate"
              className="px-1 py-2 text-xs text-muted-foreground"
            >
              {routes.map((route) => (
                <Command.Item
                  key={route.href}
                  value={route.label}
                  onSelect={() => go(route.href)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground aria-selected:bg-accent aria-selected:text-accent-foreground",
                  )}
                >
                  <route.icon className="h-4 w-4 text-muted-foreground" />
                  {route.label}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group
              heading="Account"
              className="px-1 py-2 text-xs text-muted-foreground"
            >
              <Command.Item
                value="Log out"
                onSelect={() => {
                  setOpen(false);
                  logout();
                  router.push("/login");
                }}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground aria-selected:bg-accent"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
                Log out
              </Command.Item>
            </Command.Group>
          </Command.List>
          <div className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
            Press <kbd className="rounded border border-border px-1">Esc</kbd>{" "}
            to close
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
