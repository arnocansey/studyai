"use client";

import React from "react";
import { Search, Flame, Award } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HeaderProps {
  streak: number;
  userXP: number;
  checkedIn: boolean;
  onCheckIn: () => void;
}

export function Header({ streak, userXP, checkedIn, onCheckIn }: HeaderProps) {
  return (
    <header className="z-10 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md">
      <Button
        variant="outline"
        className="relative h-9 w-80 max-w-xs justify-start gap-2 text-muted-foreground"
        onClick={() =>
          window.dispatchEvent(new Event("studyai:open-command-palette"))
        }
      >
        <Search className="h-4 w-4" />
        <span className="truncate text-sm">Search concepts, labs, tools…</span>
        <kbd className="ml-auto hidden rounded border border-border px-1.5 text-[10px] sm:inline">
          ⌘K
        </kbd>
      </Button>

      <div className="flex items-center gap-3">
        <Button
          onClick={onCheckIn}
          disabled={checkedIn}
          variant={checkedIn ? "secondary" : "outline"}
          size="sm"
          className={cn(!checkedIn && "border-orange-500/40 text-orange-500")}
        >
          <Flame
            className={cn(
              "h-4 w-4",
              !checkedIn && "motion-safe:animate-bounce",
            )}
          />
          {checkedIn ? "Checked in" : "Check in (+100 XP)"}
        </Button>

        <Badge
          variant="outline"
          className="gap-1.5 normal-case tracking-normal"
        >
          <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
          {streak} days
        </Badge>

        <Badge
          variant="default"
          className="gap-1.5 normal-case tracking-normal"
        >
          <Award className="h-3.5 w-3.5" />
          {userXP} XP
        </Badge>

        <ThemeToggle />
      </div>
    </header>
  );
}
