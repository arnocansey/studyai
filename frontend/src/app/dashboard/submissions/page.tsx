"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ClipboardList, Search, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

interface Submission {
  id: string;
  lessonId: string;
  status: string;
  logs: string | null;
  startedAt: string;
  endedAt: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}

export default function SubmissionsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const canReview = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<Submission[]>("/lessons/submissions");
      setSubmissions(data);
    } catch (err) {
      setSubmissions([]);
      setError(
        err instanceof Error ? err.message : "Failed to load submissions",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user && !canReview) {
      router.push("/");
      return;
    }
    if (canReview) void load();
  }, [canReview, isAuthenticated, router, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return submissions;
    return submissions.filter((row) => {
      const haystack =
        `${row.user.name || ""} ${row.user.email} ${row.lessonId} ${row.status}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, submissions]);

  const counts = useMemo(() => {
    const pending = submissions.filter(
      (s) => s.status === "FAILED" || !s.endedAt,
    ).length;
    const success = submissions.filter((s) => s.status === "SUCCESS").length;
    const reviewed = submissions.filter((s) => s.status === "REVIEWED").length;
    return { pending, success, reviewed };
  }, [submissions]);

  const review = async (
    id: string,
    status: "SUCCESS" | "FAILED" | "REVIEWED",
  ) => {
    setUpdatingId(id);
    setError("");
    try {
      const updated = await apiFetch<Submission>(`/lessons/submissions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setSubmissions((current) =>
        current.map((row) => (row.id === id ? updated : row)),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update submission",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyber-blue">
          Review Queue
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-white">Submissions</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Review lab submissions, approve successful work, or mark items for
          revision.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Needs attention
          </p>
          <p className="mt-2 text-3xl font-extrabold text-white">
            {counts.pending}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Passed
          </p>
          <p className="mt-2 text-3xl font-extrabold text-white">
            {counts.success}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Reviewed
          </p>
          <p className="mt-2 text-3xl font-extrabold text-white">
            {counts.reviewed}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50">
        <div className="flex flex-col gap-3 border-b border-zinc-800 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-800 bg-[#030303] pl-9 pr-3 text-sm text-zinc-300 outline-none"
              placeholder="Search learner, lesson, or status"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-sm text-zinc-400">
            Loading submissions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-zinc-700" />
            <p className="mt-4 text-sm font-semibold text-zinc-300">
              No submissions match this view.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-900">
            {filtered.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-zinc-100">
                    {row.user.name || "Unnamed learner"}
                  </p>
                  <p className="text-xs text-zinc-500">{row.user.email}</p>
                  <p className="mt-2 text-xs text-zinc-400">
                    Lesson {row.lessonId.slice(0, 8)}… • {row.status} •{" "}
                    {new Date(row.startedAt).toLocaleString()}
                  </p>
                  {row.logs && (
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-600">
                      {row.logs}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={updatingId === row.id}
                    onClick={() => review(row.id, "SUCCESS")}
                    className="inline-flex items-center gap-1 rounded-xl border border-cyber-green/30 bg-cyber-green/10 px-3 py-2 text-xs font-semibold text-cyber-green disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    disabled={updatingId === row.id}
                    onClick={() => review(row.id, "FAILED")}
                    className="inline-flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Needs work
                  </button>
                  <button
                    disabled={updatingId === row.id}
                    onClick={() => review(row.id, "REVIEWED")}
                    className="inline-flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 disabled:opacity-50"
                  >
                    Mark reviewed
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
