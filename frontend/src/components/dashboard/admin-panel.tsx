"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ClipboardList, Shield, Users } from "lucide-react";
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
import { ErrorState, EmptyState } from "@/components/ui/states";

interface AdminPanelProps {
  username: string;
}

interface OpsSummary {
  totalUsers: number;
  usersByRole: {
    STUDENT: number;
    INSTRUCTOR: number;
    ADMIN: number;
  };
  courseCount: number;
  enrollmentCount: number;
  pendingSubmissions: number;
  avgStudentStreak: number;
}

interface AuditEntry {
  id: string;
  action: string;
  details: Record<string, unknown>;
  ipAddress: string | null;
  timestamp: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  } | null;
}

function formatAuditDetail(entry: AuditEntry): string {
  const d = entry.details || {};
  if (entry.action === "ROLE_CHANGE") {
    return `${d.targetEmail || d.targetUserId}: ${d.from} → ${d.to}`;
  }
  if (entry.action === "LAB_SUBMIT" || entry.action === "LAB_REVIEW") {
    return `lesson ${d.lessonId || "?"} · ${d.status || ""}`;
  }
  if (entry.user?.email) return entry.user.email;
  return Object.keys(d).length ? JSON.stringify(d).slice(0, 80) : "—";
}

export function AdminPanel({ username }: AdminPanelProps) {
  const [summary, setSummary] = useState<OpsSummary | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      apiFetch<OpsSummary>("/ops/summary"),
      apiFetch<AuditEntry[]>("/ops/audit?limit=20"),
    ])
      .then(([summaryData, auditData]) => {
        if (cancelled) return;
        setSummary(summaryData);
        setAudit(auditData);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setSummary(null);
        setAudit([]);
        setError(
          err instanceof Error ? err.message : "Failed to load admin ops data",
        );
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
          title: "Users",
          value: String(summary.totalUsers),
          detail: `${summary.usersByRole.STUDENT} students · ${summary.usersByRole.INSTRUCTOR} instructors · ${summary.usersByRole.ADMIN} admins`,
          icon: Users,
        },
        {
          title: "Courses & seats",
          value: String(summary.courseCount),
          detail: `${summary.enrollmentCount} enrollments · avg streak ${summary.avgStudentStreak}d`,
          icon: BookOpen,
        },
        {
          title: "Pending labs",
          value: String(summary.pendingSubmissions),
          detail: "Failed or unfinished submissions",
          icon: ClipboardList,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-muted/40 p-6 md:p-8">
        <div className="max-w-2xl space-y-4">
          <Badge variant="destructive" className="gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Administrator portal
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Ops console, {username}.
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Live platform metrics, role management, and recent security audit
            events.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/dashboard/students">Manage users</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/submissions">Review labs</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/manage-courses">Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState title="Could not load ops data" message={error} />
      ) : (
        <>
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
                  <p className="text-xs text-muted-foreground">
                    {metric.detail}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security audit log</CardTitle>
              <CardDescription>
                Recent role changes, lab submits, and platform actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {audit.length === 0 ? (
                <EmptyState
                  title="No audit events yet"
                  description="Role changes and lab activity will appear here."
                />
              ) : (
                audit.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-1 rounded-xl border border-border bg-muted/20 px-3 py-2 font-mono text-xs sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
                      <span className="text-muted-foreground/70">
                        [{new Date(entry.timestamp).toLocaleTimeString()}]
                      </span>
                      <span className="font-bold text-foreground">
                        {entry.action}
                      </span>
                      <span>{formatAuditDetail(entry)}</span>
                    </div>
                    <span className="shrink-0 text-muted-foreground/70">
                      {entry.ipAddress || entry.user?.email || "—"}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
