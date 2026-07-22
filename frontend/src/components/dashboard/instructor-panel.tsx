"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  GraduationCap,
  Shield,
  Users,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";

interface InstructorPanelProps {
  username: string;
}

interface OpsSummary {
  enrolledStudents: number;
  pendingSubmissions: number;
  avgStudentStreak: number;
  courseCount: number;
  enrollmentCount: number;
}

export function InstructorPanel({ username }: InstructorPanelProps) {
  const [summary, setSummary] = useState<OpsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch<OpsSummary>("/ops/summary")
      .then((data) => {
        if (!cancelled) {
          setSummary(data);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSummary(null);
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load instructor metrics",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = summary
    ? [
        {
          title: "Enrolled students",
          value: String(summary.enrolledStudents),
          detail: `${summary.enrollmentCount} course seats · ${summary.courseCount} courses`,
          icon: Users,
        },
        {
          title: "Pending submissions",
          value: String(summary.pendingSubmissions),
          detail: "Failed or unfinished labs awaiting review",
          icon: ClipboardList,
        },
        {
          title: "Avg student streak",
          value: `${summary.avgStudentStreak}d`,
          detail: "Across active student accounts",
          icon: GraduationCap,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-muted/40 p-6 md:p-8">
        <div className="max-w-2xl space-y-4">
          <Badge variant="secondary" className="gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Instructor portal
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Welcome back, {username}.
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Review lab submissions, manage curriculum, and check your cohort
            roster.
          </p>
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState title="Could not load metrics" message={error} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <metric.icon className="h-4 w-4" />
                  <CardDescription className="text-[10px] font-bold uppercase tracking-wider">
                    {metric.title}
                  </CardDescription>
                </div>
                <CardTitle className="text-2xl">{metric.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{metric.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>Curriculum & ops</CardTitle>
            <CardDescription>
              Build courses, grade labs, and open the student roster.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/dashboard/manage-courses">
                Manage courses
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/submissions">Submissions</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/students">Students</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
