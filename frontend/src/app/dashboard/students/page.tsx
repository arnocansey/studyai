"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Shield, UserCog, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";

type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

interface UserRow {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  xp: number;
  level: number;
  streak: number;
  createdAt: string;
}

interface EnrollmentRow {
  enrollmentId: string;
  joinedAt: string;
  completed: boolean;
  user: UserRow;
  course: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function StudentsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isAdmin = user?.role === "ADMIN";
  const isInstructor = user?.role === "INSTRUCTOR";
  const canView = isInstructor || isAdmin;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user && !canView) {
      router.push("/");
      return;
    }
    if (!canView) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    const load = isAdmin
      ? apiFetch<UserRow[]>("/users").then((data) => {
          if (!cancelled) {
            setUsers(data);
            setEnrollments([]);
          }
        })
      : apiFetch<EnrollmentRow[]>("/courses/students").then((data) => {
          if (!cancelled) {
            setEnrollments(data);
            setUsers([]);
          }
        });

    load
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load roster",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canView, isAdmin, isAuthenticated, router, user]);

  const uniqueStudentCount = useMemo(() => {
    return new Set(enrollments.map((row) => row.user.id)).size;
  }, [enrollments]);

  const updateRole = async (id: string, role: Role) => {
    setMessage("");
    try {
      const updated = await apiFetch<UserRow>(`/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      setUsers((current) =>
        current.map((row) => (row.id === id ? updated : row)),
      );
      setMessage("Role updated.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Role update failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
          Roster
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">Students & Users</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {isAdmin
            ? "Promote users and review platform accounts."
            : "Students enrolled in your courses."}
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
          {message}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : error ? (
        <ErrorState title="Roster unavailable" message={error} />
      ) : isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All users
            </CardTitle>
            <CardDescription>{users.length} accounts</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {users.length === 0 ? (
              <div className="p-6">
                <EmptyState title="No users" description="No accounts found." />
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="grid grid-cols-12 border-b border-border px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-5">User</div>
                  <div className="col-span-2">Progress</div>
                  <div className="col-span-3">Role</div>
                  <div className="col-span-2">Joined</div>
                </div>
                {users.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-12 items-center border-b border-border/60 px-4 py-4 text-sm last:border-0"
                  >
                    <div className="col-span-5">
                      <p className="font-semibold">
                        {row.name || "Unnamed user"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.email}
                      </p>
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground">
                      L{row.level} · {row.xp} XP · {row.streak}d
                    </div>
                    <div className="col-span-3">
                      <label className="inline-flex items-center gap-2">
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                        <select
                          value={row.role}
                          onChange={(event) =>
                            updateRole(row.id, event.target.value as Role)
                          }
                          className="rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none"
                        >
                          <option value="STUDENT">Student</option>
                          <option value="INSTRUCTOR">Instructor</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </label>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      {new Date(row.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Cohort enrollments
            </CardTitle>
            <CardDescription>
              {uniqueStudentCount} students · {enrollments.length} enrollments
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {enrollments.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No enrollments yet"
                  description="Students who enroll in your courses will appear here."
                />
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="grid grid-cols-12 border-b border-border px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-4">Student</div>
                  <div className="col-span-4">Course</div>
                  <div className="col-span-2">Progress</div>
                  <div className="col-span-2">Joined</div>
                </div>
                {enrollments.map((row) => (
                  <div
                    key={row.enrollmentId}
                    className="grid grid-cols-12 items-center border-b border-border/60 px-4 py-4 text-sm last:border-0"
                  >
                    <div className="col-span-4">
                      <p className="font-semibold">
                        {row.user.name || "Unnamed user"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.user.email}
                      </p>
                    </div>
                    <div className="col-span-4">
                      <p className="font-medium">{row.course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.course.slug}
                      </p>
                    </div>
                    <div className="col-span-2 flex flex-col gap-1 text-xs text-muted-foreground">
                      <span>
                        L{row.user.level} · {row.user.xp} XP · {row.user.streak}
                        d
                      </span>
                      <Badge
                        variant={row.completed ? "default" : "secondary"}
                        className="w-fit"
                      >
                        {row.completed ? "Completed" : "In progress"}
                      </Badge>
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground">
                      {new Date(row.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
