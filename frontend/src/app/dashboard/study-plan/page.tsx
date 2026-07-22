"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, CalendarDays, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

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
          setGoal(latest.goal || goal);
          if (
            latest.level === "beginner" ||
            latest.level === "intermediate" ||
            latest.level === "advanced"
          ) {
            setCurrentLevel(latest.level);
          }
          setWeeklyHours(latest.weeklyHours || weeklyHours);
        }
      })
      .catch(() => {});
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
      <form
        onSubmit={submit}
        className="h-fit rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5"
      >
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyber-purple">
            AI Coach
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-white">
            Study Plan
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Generate a structured weekly plan. New plans are saved
            automatically.
          </p>
        </div>

        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
          Goal
        </label>
        <textarea
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          className="mt-2 min-h-28 w-full rounded-xl border border-zinc-800 bg-[#030303] p-3 text-sm text-zinc-200 outline-none"
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
              Level
            </label>
            <select
              value={currentLevel}
              onChange={(event) =>
                setCurrentLevel(
                  event.target.value as
                    "beginner" | "intermediate" | "advanced",
                )
              }
              className="mt-2 h-10 w-full rounded-xl border border-zinc-800 bg-[#030303] px-3 text-sm text-zinc-200 outline-none"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
              Hours / week
            </label>
            <input
              type="number"
              min={1}
              max={80}
              value={weeklyHours}
              onChange={(event) => setWeeklyHours(Number(event.target.value))}
              className="mt-2 h-10 w-full rounded-xl border border-zinc-800 bg-[#030303] px-3 text-sm text-zinc-200 outline-none"
            />
          </div>
        </div>

        <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-zinc-500">
          Focus areas
        </label>
        <input
          value={focusAreas}
          onChange={(event) => setFocusAreas(event.target.value)}
          className="mt-2 h-10 w-full rounded-xl border border-zinc-800 bg-[#030303] px-3 text-sm text-zinc-200 outline-none"
        />

        {error && (
          <p className="mt-4 rounded-xl border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-300">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyber-purple to-cyber-blue px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" />
          {loading ? "Generating..." : "Generate Plan"}
        </button>
      </form>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5">
        {!plan ? (
          <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
            <Brain className="h-14 w-14 text-zinc-700" />
            <p className="mt-4 text-sm font-semibold text-zinc-300">
              No plan generated yet.
            </p>
            <p className="mt-1 max-w-md text-xs text-zinc-600">
              Submit the form to get a week-by-week path. Saved plans reload
              automatically next visit.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                {plan.id ? "Saved Plan" : "Generated Plan"}
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-white">
                {plan.goal}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                <CalendarDays className="h-4 w-4" />
                {plan.durationWeeks} weeks • {plan.weeklyHours} hours/week •{" "}
                {plan.level}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {plan.milestones.map((milestone) => (
                <div
                  key={milestone}
                  className="rounded-xl border border-zinc-800 bg-[#030303] p-4 text-sm text-zinc-300"
                >
                  {milestone}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {plan.weeks.map((week) => (
                <article
                  key={week.week}
                  className="rounded-2xl border border-zinc-800 bg-[#030303] p-5"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-cyber-purple">
                    Week {week.week}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-white">
                    {week.theme}
                  </h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Objectives
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                        {week.objectives.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Activities
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                        {week.activities.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-400">
                    Deliverable: {week.deliverable}
                  </p>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
