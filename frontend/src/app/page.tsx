"use client";

import React, { useState, useEffect } from "react";
import { Code, Network, ShieldAlert, ClipboardList, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Sidebar,
  Header,
  WelcomeBanner,
  CoursesList,
  QuickLab,
  CourseCatalog,
  LabsSection,
  Leaderboard,
  AiChat,
  CourseDetail,
  InstructorPanel,
  AdminPanel,
} from "@/components/dashboard";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { CommandPalette } from "@/components/command-palette";
import { PageTransition } from "@/components/page-transition";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [username, setUsername] = useState("Operator");
  const [userRole, setUserRole] = useState("Level 12 Cadet");
  const [streak, setStreak] = useState(7);
  const [checkedIn, setCheckedIn] = useState(false);
  const [userXP, setUserXP] = useState(2450);
  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR" | "ADMIN">(
    "STUDENT",
  );
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string | null>(
    null,
  );
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<
    any | null
  >(null);
  const [loadingSyllabus, setLoadingSyllabus] = useState(false);
  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [progressByCourseId, setProgressByCourseId] = useState<
    Record<
      string,
      {
        progress: number;
        totalLessons: number;
        completedLessons: number;
        enrolled: boolean;
      }
    >
  >({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const mockSyllabus: Record<string, any> = {
    "systems-programming-and-scripting-with-python": {
      title: "Systems Programming & Scripting with Python",
      description:
        "Master system utilities, automated scripts, CLI arguments parsing, and file manipulations using Python.",
      modules: [
        {
          title: "Module 1: Command Line & Execution Flow",
          lessons: [
            {
              id: "python-helloworld",
              title: "Introduction to Python & CLI Arguments",
              type: "CODING_LAB",
            },
            {
              id: "python-control-flow",
              title: "Control Flow & Loops in Systems Scripts",
              type: "CODING_LAB",
              locked: true,
            },
            {
              id: "python-file-io",
              title: "File Input/Output & Buffer Streams",
              type: "CODING_LAB",
              locked: true,
            },
          ],
        },
      ],
    },
    "ip-subnetting-and-network-topologies": {
      title: "IP Subnetting & Network Topologies",
      description:
        "Design efficient subnets, configure gateways, and visualize routing topologies using drag-and-drop node simulators.",
      modules: [
        {
          title: "Module 1: Subnet Computations & CIDR",
          lessons: [
            {
              id: "cidr-calc",
              title: "CIDR Notation & Subnet Calculation",
              type: "NET_SUBNET",
            },
            {
              id: "subnet-routing",
              title: "Static Routing & Gateway Setup",
              type: "NET_SUBNET",
              locked: true,
            },
            {
              id: "vlan-config",
              title: "VLAN Segmentation & Trunking",
              type: "NET_SUBNET",
              locked: true,
            },
          ],
        },
      ],
    },
    "ethical-hacking-and-linux-exploit-labs": {
      title: "Ethical Hacking & Linux Exploit Labs",
      description:
        "Understand SUID permissions, exploit shell buffer overflows, and capture flags in containerized environments.",
      modules: [
        {
          title: "Module 1: Linux Privilege Escalation",
          lessons: [
            {
              id: "suid-exploit",
              title: "SUID Privilege Escalation & Exploit",
              type: "CYBER_EXPLOIT",
            },
            {
              id: "buffer-overflow",
              title: "Stack Buffer Overflow Exploits",
              type: "CYBER_EXPLOIT",
              locked: true,
            },
            {
              id: "hash-cracking",
              title: "Password Hashing & Hash Cracking",
              type: "CYBER_EXPLOIT",
              locked: true,
            },
          ],
        },
      ],
    },
  };

  const courses = [
    {
      id: "python-101",
      title: "Systems Programming & Python",
      slug: "systems-programming-and-scripting-with-python",
      category: "Programming",
      difficulty: "Beginner",
      progress: 45,
      lessons: 12,
      completed: 5,
      color: "border-cyber-purple",
      icon: <Code className="w-5 h-5 text-cyber-purple" />,
    },
    {
      id: "routing-201",
      title: "IP Subnetting & Network Topologies",
      slug: "ip-subnetting-and-network-topologies",
      category: "Networking",
      difficulty: "Intermediate",
      progress: 80,
      lessons: 15,
      completed: 12,
      color: "border-cyber-green",
      icon: <Network className="w-5 h-5 text-cyber-green" />,
    },
    {
      id: "cyber-301",
      title: "Ethical Hacking & Linux Security",
      slug: "ethical-hacking-and-linux-exploit-labs",
      category: "Cybersecurity",
      difficulty: "Advanced",
      progress: 15,
      lessons: 20,
      completed: 3,
      color: "border-cyber-blue",
      icon: <ShieldAlert className="w-5 h-5 text-cyber-blue" />,
    },
  ];

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    setUsername(user.name || "Operator");
    setUserXP(user.xp);
    setStreak(user.streak);
    setRole(user.role || "STUDENT");

    if (user.role === "INSTRUCTOR") {
      setUserRole("Laboratory Instructor");
    } else if (user.role === "ADMIN") {
      setUserRole("Laboratory Administrator");
    } else {
      setUserRole("Level 12 Cadet");
    }

    async function loadData() {
      try {
        const [coursesData, progressData] = await Promise.all([
          apiFetch<any[]>("/courses"),
          apiFetch<
            Array<{
              courseId: string;
              progress: number;
              totalLessons: number;
              completedLessons: number;
            }>
          >("/courses/my-progress").catch(() => []),
        ]);
        setDbCourses(coursesData);
        const map: Record<
          string,
          {
            progress: number;
            totalLessons: number;
            completedLessons: number;
            enrolled: boolean;
          }
        > = {};
        for (const row of progressData) {
          map[row.courseId] = {
            progress: row.progress,
            totalLessons: row.totalLessons,
            completedLessons: row.completedLessons,
            enrolled: true,
          };
        }
        setProgressByCourseId(map);
      } catch {
        console.warn("API Server offline, running in offline mock mode.");
      } finally {
        setInitialLoading(false);
      }
    }
    loadData();
  }, [router, isAuthenticated, user]);

  const handleEnroll = async (courseId: string) => {
    setEnrollingId(courseId);
    try {
      await apiFetch(`/courses/${courseId}/enroll`, { method: "POST" });
      const progressData = await apiFetch<
        Array<{
          courseId: string;
          progress: number;
          totalLessons: number;
          completedLessons: number;
        }>
      >("/courses/my-progress");
      const map: Record<
        string,
        {
          progress: number;
          totalLessons: number;
          completedLessons: number;
          enrolled: boolean;
        }
      > = {};
      for (const row of progressData) {
        map[row.courseId] = {
          progress: row.progress,
          totalLessons: row.totalLessons,
          completedLessons: row.completedLessons,
          enrolled: true,
        };
      }
      setProgressByCourseId(map);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enroll failed");
    } finally {
      setEnrollingId(null);
    }
  };
  const handleCheckIn = async () => {
    if (!checkedIn) {
      try {
        const data = await apiFetch<{ streak: number; xp: number }>(
          "/users/check-in",
          {
            method: "POST",
          },
        );
        setStreak(data.streak);
        setUserXP(data.xp);
        setCheckedIn(true);
        return;
      } catch {
        console.warn("API Server offline, updating locally.");
      }
      setStreak((prev) => prev + 1);
      setUserXP((prev) => prev + 100);
      setCheckedIn(true);
    }
  };

  const handleXpAwarded = (xp: number) => {
    setUserXP((prev) => prev + xp);
  };

  const displayCourses =
    dbCourses.length > 0
      ? dbCourses.map((c) => {
          let icon = <Code className="w-5 h-5 text-cyber-purple" />;
          if (c.slug.includes("subnet")) {
            icon = <Network className="w-5 h-5 text-cyber-green" />;
          } else if (c.slug.includes("ethical") || c.slug.includes("cyber")) {
            icon = <ShieldAlert className="w-5 h-5 text-cyber-blue" />;
          }

          const progressInfo = progressByCourseId[c.id];
          const difficulty =
            c.difficulty === "BEGINNER"
              ? "Beginner"
              : c.difficulty === "INTERMEDIATE"
                ? "Intermediate"
                : "Advanced";

          return {
            id: c.id,
            title: c.title,
            slug: c.slug,
            category: c.slug.includes("python")
              ? "Programming"
              : c.slug.includes("subnet")
                ? "Networking"
                : "Cybersecurity",
            difficulty,
            progress: progressInfo?.progress ?? 0,
            lessons: progressInfo?.totalLessons || c._count?.modules || 0,
            completed: progressInfo?.completedLessons ?? 0,
            enrolled: !!progressInfo?.enrolled,
            color: "border-zinc-800",
            icon,
          };
        })
      : courses;

  const enterCourse = async (slug: string) => {
    setSelectedCourseSlug(slug);
    setLoadingSyllabus(true);
    try {
      const data = await apiFetch<any>(`/courses/${slug}`);
      setSelectedCourseDetails(data);
      setLoadingSyllabus(false);
      return;
    } catch {
      console.warn("API offline, loading mock syllabus.");
    }

    const localCourse = mockSyllabus[slug];
    if (localCourse) {
      setSelectedCourseDetails(localCourse);
    } else {
      setSelectedCourseDetails({
        title: "Systems Programming & Python",
        description: "Learn Python script parameters and system controls.",
        modules: [
          {
            title: "Module 1: Getting Started",
            lessons: [
              {
                id: "python-helloworld",
                title: "Introduction to Python & CLI Arguments",
                type: "CODING_LAB",
              },
            ],
          },
        ],
      });
    }
    setLoadingSyllabus(false);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground cyber-grid">
      <CommandPalette />
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        username={username}
        userRole={userRole}
        role={role}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <Header
          streak={streak}
          userXP={userXP}
          checkedIn={checkedIn}
          onCheckIn={handleCheckIn}
        />

        <div className="flex-1 space-y-8 overflow-y-auto p-6 md:p-8">
          <PageTransition>
            {selectedCourseSlug ? (
              loadingSyllabus ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-96" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : selectedCourseDetails ? (
                <CourseDetail
                  course={selectedCourseDetails}
                  onBack={() => {
                    setSelectedCourseSlug(null);
                    setSelectedCourseDetails(null);
                  }}
                />
              ) : (
                <ErrorState
                  title="Failed to load syllabus"
                  message="Could not load course details. Try again."
                  onRetry={() =>
                    selectedCourseSlug && void enterCourse(selectedCourseSlug)
                  }
                />
              )
            ) : (
              <>
                {activeTab === "dashboard" && (
                  <>
                    <WelcomeBanner
                      username={username}
                      userRole={userRole}
                      userXP={userXP}
                    />
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                      {initialLoading ? (
                        <div className="space-y-4 lg:col-span-2">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </div>
                      ) : displayCourses.length === 0 ? (
                        <div className="lg:col-span-2">
                          <EmptyState
                            title="No courses yet"
                            description="Browse the catalog once courses are published, or ask your instructor to create one."
                            action={{
                              label: "Browse courses",
                              onClick: () => setActiveTab("courses"),
                            }}
                          />
                        </div>
                      ) : (
                        <CoursesList
                          courses={displayCourses}
                          onEnter={enterCourse}
                          onBrowseAll={() => setActiveTab("courses")}
                          onEnroll={handleEnroll}
                          enrollingId={enrollingId}
                        />
                      )}
                      <QuickLab onXpAwarded={handleXpAwarded} />
                    </div>
                  </>
                )}

                {activeTab === "dashboard" && role === "INSTRUCTOR" && (
                  <InstructorPanel username={username} />
                )}
                {activeTab === "dashboard" && role === "ADMIN" && (
                  <AdminPanel username={username} />
                )}
                {activeTab === "courses" &&
                  role === "STUDENT" &&
                  (displayCourses.length === 0 ? (
                    <EmptyState
                      title="Catalog empty"
                      description="No published courses are available yet."
                    />
                  ) : (
                    <CourseCatalog
                      courses={displayCourses}
                      onEnter={enterCourse}
                    />
                  ))}
                {activeTab === "manage-courses" &&
                  (role === "INSTRUCTOR" || role === "ADMIN") && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-extrabold">
                          Manage Courses
                        </h2>
                        <Button
                          onClick={() =>
                            router.push("/dashboard/manage-courses")
                          }
                        >
                          + Create New Course
                        </Button>
                      </div>
                      <CourseCatalog
                        courses={displayCourses}
                        onEnter={enterCourse}
                      />
                    </div>
                  )}
                {activeTab === "submissions" &&
                  (role === "INSTRUCTOR" || role === "ADMIN") && (
                    <EmptyState
                      icon={ClipboardList}
                      title="No pending submissions"
                      description="Student submissions will appear here for grading."
                      action={{
                        label: "Open submissions",
                        onClick: () => router.push("/dashboard/submissions"),
                      }}
                    />
                  )}
                {activeTab === "students" &&
                  (role === "INSTRUCTOR" || role === "ADMIN") && (
                    <EmptyState
                      icon={Users}
                      title="Student roster"
                      description="View enrolled students and their progress."
                      action={{
                        label: "Open students",
                        onClick: () => router.push("/dashboard/students"),
                      }}
                    />
                  )}
                {activeTab === "labs" && <LabsSection />}
                {activeTab === "leaderboard" && (
                  <Leaderboard userXP={userXP} username={username} />
                )}
              </>
            )}
          </PageTransition>
        </div>
      </main>

      <AiChat isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
    </div>
  );
}
