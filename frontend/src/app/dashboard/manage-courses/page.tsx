"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Eye,
  Plus,
  ShieldAlert,
  ToggleLeft,
  Trash2,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  published: boolean;
  _count?: { modules: number; enrollments?: number };
}

interface CurriculumLesson {
  id: string;
  title: string;
  type: string;
  order: number;
  content: string;
}

interface CurriculumModule {
  id: string;
  title: string;
  order: number;
  lessons: CurriculumLesson[];
}

interface Curriculum {
  id: string;
  title: string;
  modules: CurriculumModule[];
}

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  difficulty: "BEGINNER",
  published: false,
};

const LESSON_TYPES = [
  "TEXT",
  "VIDEO",
  "QUIZ",
  "CODING_LAB",
  "NETWORKING_LAB",
  "CYBER_LAB",
];

export default function ManageCoursesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [curriculumLoading, setCurriculumLoading] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonForms, setLessonForms] = useState<
    Record<string, { title: string; type: string }>
  >({});
  const canManage = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";

  const loadCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<Course[]>("/courses/manage/all");
      setCourses(data);
    } catch (err) {
      setCourses([]);
      setError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const loadCurriculum = async (courseId: string) => {
    setCurriculumLoading(true);
    setError("");
    try {
      const data = await apiFetch<Curriculum>(
        `/courses/${courseId}/curriculum`,
      );
      setCurriculum(data);
      setSelectedId(courseId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load curriculum",
      );
    } finally {
      setCurriculumLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user && !canManage) {
      router.push("/");
      return;
    }
    if (canManage) void loadCourses();
  }, [canManage, isAuthenticated, router, user]);

  const slugPreview = useMemo(
    () =>
      form.slug ||
      form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    [form.slug, form.title],
  );

  const createCourse = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const created = await apiFetch<Course>("/courses", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          slug: slugPreview,
          description: form.description.trim(),
          difficulty: form.difficulty,
          published: form.published,
        }),
      });
      setCourses((current) => [created, ...current]);
      setForm(emptyForm);
      setShowCreate(false);
      await loadCurriculum(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create course");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (course: Course) => {
    setError("");
    try {
      const updated = await apiFetch<Course>(`/courses/${course.id}`, {
        method: "PATCH",
        body: JSON.stringify({ published: !course.published }),
      });
      setCourses((current) =>
        current.map((row) => (row.id === course.id ? updated : row)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update course");
    }
  };

  const addModule = async () => {
    if (!selectedId || !moduleTitle.trim()) return;
    try {
      await apiFetch(`/courses/${selectedId}/modules`, {
        method: "POST",
        body: JSON.stringify({ title: moduleTitle.trim() }),
      });
      setModuleTitle("");
      await loadCurriculum(selectedId);
      await loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add module");
    }
  };

  const deleteModule = async (moduleId: string) => {
    if (!selectedId || !confirm("Delete this module and all its lessons?"))
      return;
    try {
      await apiFetch(`/courses/modules/${moduleId}`, { method: "DELETE" });
      await loadCurriculum(selectedId);
      await loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete module");
    }
  };

  const addLesson = async (moduleId: string) => {
    if (!selectedId) return;
    const formState = lessonForms[moduleId] || { title: "", type: "TEXT" };
    if (!formState.title.trim()) return;
    try {
      await apiFetch(`/courses/modules/${moduleId}/lessons`, {
        method: "POST",
        body: JSON.stringify({
          title: formState.title.trim(),
          type: formState.type,
          content: "",
        }),
      });
      setLessonForms((current) => ({
        ...current,
        [moduleId]: { title: "", type: "TEXT" },
      }));
      await loadCurriculum(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add lesson");
    }
  };

  const deleteLesson = async (lessonId: string) => {
    if (!selectedId || !confirm("Delete this lesson?")) return;
    try {
      await apiFetch(`/courses/lessons/${lessonId}`, { method: "DELETE" });
      await loadCurriculum(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete lesson");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyber-purple">
            Instructor Console
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-white">
            Manage Courses
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Create courses, then build modules and lessons in the curriculum
            editor.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-cyber-purple/40 bg-cyber-purple/10 px-4 py-2 text-xs font-bold text-cyber-purple hover:bg-cyber-purple/20"
        >
          <Plus className="h-4 w-4" />
          Create Course
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {showCreate && (
        <form
          onSubmit={createCourse}
          className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">New course</h2>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="text-zinc-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-xs text-zinc-400">
              Title
              <input
                required
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="h-10 w-full rounded-xl border border-zinc-800 bg-[#030303] px-3 text-sm text-zinc-100 outline-none"
              />
            </label>
            <label className="space-y-1 text-xs text-zinc-400">
              Slug
              <input
                value={form.slug}
                placeholder={slugPreview}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
                className="h-10 w-full rounded-xl border border-zinc-800 bg-[#030303] px-3 text-sm text-zinc-100 outline-none"
              />
            </label>
          </div>
          <label className="block space-y-1 text-xs text-zinc-400">
            Description
            <textarea
              required
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              className="w-full rounded-xl border border-zinc-800 bg-[#030303] px-3 py-2 text-sm text-zinc-100 outline-none"
            />
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <label className="space-y-1 text-xs text-zinc-400">
              Difficulty
              <select
                value={form.difficulty}
                onChange={(e) =>
                  setForm((f) => ({ ...f, difficulty: e.target.value }))
                }
                className="ml-2 h-10 rounded-xl border border-zinc-800 bg-[#030303] px-3 text-sm text-zinc-100 outline-none"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-zinc-400">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm((f) => ({ ...f, published: e.target.checked }))
                }
              />
              Publish immediately
            </label>
            <button
              type="submit"
              disabled={saving}
              className="ml-auto rounded-xl bg-cyber-purple px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save course"}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-8 text-sm text-zinc-400">
              Loading courses...
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-8 text-center">
              <ShieldAlert className="mx-auto h-10 w-10 text-zinc-600" />
              <p className="mt-3 text-sm font-semibold text-zinc-300">
                No courses yet. Create your first draft.
              </p>
            </div>
          ) : (
            courses.map((course) => (
              <article
                key={course.id}
                className={`rounded-2xl border p-5 ${
                  selectedId === course.id
                    ? "border-cyber-purple/50 bg-cyber-purple/5"
                    : "border-zinc-800 bg-zinc-950/50"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
                      <BookOpen className="h-5 w-5 text-cyber-purple" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-zinc-100">
                          {course.title}
                        </h2>
                        <span className="rounded-full border border-zinc-800 px-2 py-0.5 text-[10px] uppercase text-zinc-500">
                          {course.difficulty}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${
                            course.published
                              ? "bg-cyber-green/10 text-cyber-green"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {course.published ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                        {course.description}
                      </p>
                      <p className="mt-2 text-xs text-zinc-600">
                        {course._count?.modules ?? 0} modules •{" "}
                        {course._count?.enrollments ?? 0} enrollments
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => void loadCurriculum(course.id)}
                      className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white"
                    >
                      Edit curriculum
                    </button>
                    <button
                      onClick={() => togglePublished(course)}
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white"
                    >
                      <ToggleLeft className="h-4 w-4" />
                      {course.published ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() => router.push(`/?course=${course.slug}`)}
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5">
          {!selectedId ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <BookOpen className="h-12 w-12 text-zinc-700" />
              <p className="mt-4 text-sm font-semibold text-zinc-300">
                Select a course to edit its curriculum
              </p>
            </div>
          ) : curriculumLoading ? (
            <p className="text-sm text-zinc-400">Loading curriculum…</p>
          ) : curriculum ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Curriculum
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  {curriculum.title}
                </h2>
              </div>

              <div className="flex gap-2">
                <input
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="New module title"
                  className="h-10 flex-1 rounded-xl border border-zinc-800 bg-[#030303] px-3 text-sm text-zinc-100 outline-none"
                />
                <button
                  onClick={addModule}
                  className="rounded-xl bg-cyber-purple px-4 text-xs font-bold text-white"
                >
                  Add module
                </button>
              </div>

              <div className="space-y-4">
                {curriculum.modules.length === 0 ? (
                  <p className="text-sm text-zinc-500">No modules yet.</p>
                ) : (
                  curriculum.modules.map((mod) => (
                    <div
                      key={mod.id}
                      className="rounded-xl border border-zinc-800 bg-[#030303] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-zinc-100">
                          Module {mod.order}: {mod.title}
                        </h3>
                        <button
                          onClick={() => void deleteModule(mod.id)}
                          className="text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 space-y-2">
                        {mod.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950 px-3 py-2 text-sm"
                          >
                            <div>
                              <p className="text-zinc-200">{lesson.title}</p>
                              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                                {lesson.type}
                              </p>
                            </div>
                            <button
                              onClick={() => void deleteLesson(lesson.id)}
                              className="text-zinc-600 hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <input
                          value={lessonForms[mod.id]?.title || ""}
                          onChange={(e) =>
                            setLessonForms((current) => ({
                              ...current,
                              [mod.id]: {
                                title: e.target.value,
                                type: current[mod.id]?.type || "TEXT",
                              },
                            }))
                          }
                          placeholder="New lesson title"
                          className="h-9 min-w-[160px] flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-100 outline-none"
                        />
                        <select
                          value={lessonForms[mod.id]?.type || "TEXT"}
                          onChange={(e) =>
                            setLessonForms((current) => ({
                              ...current,
                              [mod.id]: {
                                title: current[mod.id]?.title || "",
                                type: e.target.value,
                              },
                            }))
                          }
                          className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-300 outline-none"
                        >
                          {LESSON_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => void addLesson(mod.id)}
                          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-xs font-semibold text-zinc-300 hover:text-white"
                        >
                          Add lesson
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
