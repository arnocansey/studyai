"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, UserCog, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

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

export default function StudentsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const isAdmin = user?.role === "ADMIN";
  const canView = user?.role === "INSTRUCTOR" || isAdmin;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user && !canView) {
      router.push("/");
      return;
    }

    if (!isAdmin) {
      setLoading(false);
      return;
    }

    apiFetch<UserRow[]>("/users")
      .then(setUsers)
      .catch(() =>
        setMessage("Could not load users. Admin access is required."),
      )
      .finally(() => setLoading(false));
  }, [canView, isAdmin, isAuthenticated, router, user]);

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
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Role update failed.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyber-green">
          Roster
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-white">
          Students & Users
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Admins can promote users to instructor/admin. Instructors see this
          roster once cohort enrollment APIs are expanded.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 text-sm text-zinc-300">
          {message}
        </div>
      )}

      {!isAdmin ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-10 text-center">
          <Users className="mx-auto h-12 w-12 text-zinc-700" />
          <p className="mt-4 text-sm font-semibold text-zinc-300">
            Instructor roster view is awaiting backend cohort data.
          </p>
        </div>
      ) : loading ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-8 text-sm text-zinc-400">
          Loading users...
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/50">
          <div className="grid grid-cols-12 border-b border-zinc-800 px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
            <div className="col-span-5">User</div>
            <div className="col-span-2">Progress</div>
            <div className="col-span-3">Role</div>
            <div className="col-span-2">Joined</div>
          </div>
          {users.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-12 items-center border-b border-zinc-900 px-4 py-4 text-sm last:border-0"
            >
              <div className="col-span-5">
                <p className="font-semibold text-zinc-100">
                  {row.name || "Unnamed user"}
                </p>
                <p className="text-xs text-zinc-500">{row.email}</p>
              </div>
              <div className="col-span-2 text-xs text-zinc-400">
                L{row.level} • {row.xp} XP • {row.streak}d
              </div>
              <div className="col-span-3">
                <label className="inline-flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-zinc-600" />
                  <select
                    value={row.role}
                    onChange={(event) =>
                      updateRole(row.id, event.target.value as Role)
                    }
                    className="rounded-lg border border-zinc-800 bg-[#030303] px-3 py-2 text-xs text-zinc-300 outline-none"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="INSTRUCTOR">Instructor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </label>
              </div>
              <div className="col-span-2 flex items-center gap-2 text-xs text-zinc-500">
                <Shield className="h-4 w-4" />
                {new Date(row.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
