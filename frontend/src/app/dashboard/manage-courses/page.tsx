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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
          <Badge className="mb-2">Instructor Console</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Manage Courses
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Create courses, then build modules and lessons in the curriculum
            editor.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Create course
        </Button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => void loadCourses()} />
      ) : null}

      {showCreate ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>New course</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => setShowCreate(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={createCourse} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    placeholder={slugPreview}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, slug: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <select
                    id="difficulty"
                    value={form.difficulty}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, difficulty: e.target.value }))
                    }
                    className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, published: e.target.checked }))
                    }
                  />
                  Publish immediately
                </label>
                <Button type="submit" disabled={saving} className="ml-auto">
                  {saving ? "Saving…" : "Save course"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : courses.length === 0 ? (
            <EmptyState
              icon={ShieldAlert}
              title="No courses yet"
              description="Create your first draft to start building curriculum."
              action={{
                label: "Create course",
                onClick: () => setShowCreate(true),
              }}
            />
          ) : (
            courses.map((course) => (
              <Card
                key={course.id}
                className={cn(
                  selectedId === course.id && "border-primary/50 bg-primary/5",
                )}
              >
                <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold">{course.title}</h2>
                        <Badge variant="outline">{course.difficulty}</Badge>
                        <Badge
                          variant={course.published ? "success" : "secondary"}
                        >
                          {course.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {course.description}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {course._count?.modules ?? 0} modules ·{" "}
                        {course._count?.enrollments ?? 0} enrollments
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void loadCurriculum(course.id)}
                    >
                      Edit curriculum
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void togglePublished(course)}
                    >
                      <ToggleLeft className="h-4 w-4" />
                      {course.published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/?course=${course.slug}`)}
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="min-h-[420px]">
          <CardContent className="p-5">
            {!selectedId ? (
              <EmptyState
                icon={BookOpen}
                title="Select a course"
                description="Choose a course on the left to edit its curriculum."
              />
            ) : curriculumLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : curriculum ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Curriculum
                  </p>
                  <h2 className="mt-1 text-xl font-bold">{curriculum.title}</h2>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    placeholder="New module title"
                  />
                  <Button onClick={() => void addModule()}>Add module</Button>
                </div>

                {curriculum.modules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No modules yet.
                  </p>
                ) : (
                  curriculum.modules.map((mod) => (
                    <Card key={mod.id} className="bg-muted/20">
                      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-base">
                          Module {mod.order}: {mod.title}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => void deleteModule(mod.id)}
                          aria-label="Delete module"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {mod.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {lesson.title}
                              </p>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                {lesson.type}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => void deleteLesson(lesson.id)}
                              aria-label="Delete lesson"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}

                        <div className="flex flex-wrap gap-2 pt-1">
                          <Input
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
                            className="min-w-[160px] flex-1"
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
                            className="h-10 rounded-xl border border-input bg-background px-2 text-xs"
                          >
                            {LESSON_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void addLesson(mod.id)}
                          >
                            Add lesson
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
