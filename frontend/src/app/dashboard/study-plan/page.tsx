"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, CalendarDays, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/skeleton";

interface StudyPlan {
  id?: string;
  goal: string;
  level: string;
  weeklyHours: number;
  durationWeeks: number;
  milestones: string[];
  weeks: Array<{
    week: number;
    theme: string;
    objectives: string[];
    activities: string[];
    deliverable: string;
  }>;
}

export default function StudyPlanPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [goal, setGoal] = useState(
    "Prepare for a junior cybersecurity analyst role",
  );
  const [currentLevel, setCurrentLevel] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");
  const [weeklyHours, setWeeklyHours] = useState(6);
  const [focusAreas, setFocusAreas] = useState(
    "Linux, networking, web security",
  );
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    apiFetch<StudyPlan | null>("/ai/study-plan/latest")
      .then((latest) => {
        if (latest?.weeks) {
          setPlan({
            ...latest,
            weeks: Array.isArray(latest.weeks) ? latest.weeks : [],
            milestones: latest.milestones || [],
          });
          if (latest.goal) setGoal(latest.goal);
          if (
            latest.level === "beginner" ||
            latest.level === "intermediate" ||
            latest.level === "advanced"
          ) {
            setCurrentLevel(latest.level);
          }
          if (latest.weeklyHours) setWeeklyHours(latest.weeklyHours);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingLatest(false));
  }, [isAuthenticated, router]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<StudyPlan>("/ai/study-plan", {
        method: "POST",
        body: JSON.stringify({
          goal,
          currentLevel,
          weeklyHours,
          focusAreas: focusAreas
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });
      setPlan(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Study plan generation failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <Badge variant="default" className="w-fit">
            AI Coach
          </Badge>
          <CardTitle className="text-2xl">Study Plan</CardTitle>
          <CardDescription>
            Generate a structured weekly plan. New plans are saved
            automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal">Goal</Label>
              <Textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <select
                  id="level"
                  value={currentLevel}
                  onChange={(e) =>
                    setCurrentLevel(
                      e.target.value as
                        "beginner" | "intermediate" | "advanced",
                    )
                  }
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Hours / week</Label>
                <Input
                  id="hours"
                  type="number"
                  min={1}
                  max={80}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="focus">Focus areas</Label>
              <Input
                id="focus"
                value={focusAreas}
                onChange={(e) => setFocusAreas(e.target.value)}
              />
            </div>

            {error ? <ErrorState message={error} /> : null}

            <Button type="submit" disabled={loading} className="w-full">
              <Sparkles className="h-4 w-4" />
              {loading ? "Generating…" : "Generate plan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="min-h-[520px]">
        <CardContent className="p-5">
          {loadingLatest ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : !plan ? (
            <EmptyState
              icon={Brain}
              title="No plan generated yet"
              description="Submit the form to get a week-by-week path. Saved plans reload automatically next visit."
            />
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {plan.id ? "Saved plan" : "Generated plan"}
                </p>
                <h2 className="mt-2 text-2xl font-extrabold">{plan.goal}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  {plan.durationWeeks} weeks · {plan.weeklyHours} hours/week ·{" "}
                  {plan.level}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {plan.milestones.map((milestone) => (
                  <Card key={milestone} className="bg-muted/40">
                    <CardContent className="p-4 text-sm">
                      {milestone}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                {plan.weeks.map((week) => (
                  <Card key={week.week}>
                    <CardHeader>
                      <Badge variant="secondary" className="w-fit">
                        Week {week.week}
                      </Badge>
                      <CardTitle>{week.theme}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Objectives
                          </p>
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {week.objectives.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Activities
                          </p>
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {week.activities.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                        Deliverable: {week.deliverable}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
