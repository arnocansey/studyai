'use client';

import React, { useState, useEffect } from 'react';
import { Code, Network, ShieldAlert, ClipboardList, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
} from '@/components/dashboard';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [username, setUsername] = useState('Operator');
  const [userRole, setUserRole] = useState('Level 12 Cadet');
  const [streak, setStreak] = useState(7);
  const [checkedIn, setCheckedIn] = useState(false);
  const [userXP, setUserXP] = useState(2450);
  const [role, setRole] = useState<'STUDENT' | 'INSTRUCTOR' | 'ADMIN'>('STUDENT');
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string | null>(null);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<any | null>(null);
  const [loadingSyllabus, setLoadingSyllabus] = useState(false);
  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const mockSyllabus: Record<string, any> = {
    'systems-programming-and-scripting-with-python': {
      title: 'Systems Programming & Scripting with Python',
      description: 'Master system utilities, automated scripts, CLI arguments parsing, and file manipulations using Python.',
      modules: [
        {
          title: 'Module 1: Command Line & Execution Flow',
          lessons: [
            { id: 'python-helloworld', title: 'Introduction to Python & CLI Arguments', type: 'CODING_LAB' },
            { id: 'python-control-flow', title: 'Control Flow & Loops in Systems Scripts', type: 'CODING_LAB', locked: true },
            { id: 'python-file-io', title: 'File Input/Output & Buffer Streams', type: 'CODING_LAB', locked: true },
          ],
        },
      ],
    },
    'ip-subnetting-and-network-topologies': {
      title: 'IP Subnetting & Network Topologies',
      description: 'Design efficient subnets, configure gateways, and visualize routing topologies using drag-and-drop node simulators.',
      modules: [
        {
          title: 'Module 1: Subnet Computations & CIDR',
          lessons: [
            { id: 'cidr-calc', title: 'CIDR Notation & Subnet Calculation', type: 'NET_SUBNET' },
            { id: 'subnet-routing', title: 'Static Routing & Gateway Setup', type: 'NET_SUBNET', locked: true },
            { id: 'vlan-config', title: 'VLAN Segmentation & Trunking', type: 'NET_SUBNET', locked: true },
          ],
        },
      ],
    },
    'ethical-hacking-and-linux-exploit-labs': {
      title: 'Ethical Hacking & Linux Exploit Labs',
      description: 'Understand SUID permissions, exploit shell buffer overflows, and capture flags in containerized environments.',
      modules: [
        {
          title: 'Module 1: Linux Privilege Escalation',
          lessons: [
            { id: 'suid-exploit', title: 'SUID Privilege Escalation & Exploit', type: 'CYBER_EXPLOIT' },
            { id: 'buffer-overflow', title: 'Stack Buffer Overflow Exploits', type: 'CYBER_EXPLOIT', locked: true },
            { id: 'hash-cracking', title: 'Password Hashing & Hash Cracking', type: 'CYBER_EXPLOIT', locked: true },
          ],
        },
      ],
    },
  };

  const courses = [
    {
      id: 'python-101',
      title: 'Systems Programming & Python',
      slug: 'systems-programming-and-scripting-with-python',
      category: 'Programming',
      difficulty: 'Beginner',
      progress: 45,
      lessons: 12,
      completed: 5,
      color: 'border-cyber-purple',
      icon: <Code className="w-5 h-5 text-cyber-purple" />,
    },
    {
      id: 'routing-201',
      title: 'IP Subnetting & Network Topologies',
      slug: 'ip-subnetting-and-network-topologies',
      category: 'Networking',
      difficulty: 'Intermediate',
      progress: 80,
      lessons: 15,
      completed: 12,
      color: 'border-cyber-green',
      icon: <Network className="w-5 h-5 text-cyber-green" />,
    },
    {
      id: 'cyber-301',
      title: 'Ethical Hacking & Linux Security',
      slug: 'ethical-hacking-and-linux-exploit-labs',
      category: 'Cybersecurity',
      difficulty: 'Advanced',
      progress: 15,
      lessons: 20,
      completed: 3,
      color: 'border-cyber-blue',
      icon: <ShieldAlert className="w-5 h-5 text-cyber-blue" />,
    },
  ];

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    setUsername(user.name || 'Operator');
    setUserXP(user.xp);
    setStreak(user.streak);
    setRole(user.role || 'STUDENT');

    if (user.role === 'INSTRUCTOR') {
      setUserRole('Laboratory Instructor');
    } else if (user.role === 'ADMIN') {
      setUserRole('Laboratory Administrator');
    } else {
      setUserRole('Level 12 Cadet');
    }

    async function loadData() {
      try {
        const coursesData = await apiFetch<any[]>('/courses');
        setDbCourses(coursesData);
      } catch {
        console.warn('API Server offline, running in offline mock mode.');
      } finally {
        setInitialLoading(false);
      }
    }
    loadData();
  }, [router, isAuthenticated, user]);

  const handleCheckIn = async () => {
    if (!checkedIn) {
      try {
        const data = await apiFetch<{ streak: number; xp: number }>('/users/check-in', {
          method: 'POST',
        });
        setStreak(data.streak);
        setUserXP(data.xp);
        setCheckedIn(true);
        return;
      } catch {
        console.warn('API Server offline, updating locally.');
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
          let progress = 0;
          let lessonsCount = 10;
          let completedCount = 0;
          let difficulty = c.difficulty === 'BEGINNER' ? 'Beginner' : c.difficulty === 'INTERMEDIATE' ? 'Intermediate' : 'Advanced';

          if (c.slug.includes('python')) {
            icon = <Code className="w-5 h-5 text-cyber-purple" />;
            progress = 45;
            lessonsCount = 12;
            completedCount = 5;
          } else if (c.slug.includes('subnet')) {
            icon = <Network className="w-5 h-5 text-cyber-green" />;
            progress = 80;
            lessonsCount = 15;
            completedCount = 12;
          } else if (c.slug.includes('ethical')) {
            icon = <ShieldAlert className="w-5 h-5 text-cyber-blue" />;
            progress = 15;
            lessonsCount = 20;
            completedCount = 3;
          }

          return {
            id: c.id,
            title: c.title,
            slug: c.slug,
            category: c.slug.includes('python') ? 'Programming' : c.slug.includes('subnet') ? 'Networking' : 'Cybersecurity',
            difficulty,
            progress,
            lessons: lessonsCount,
            completed: completedCount,
            color: 'border-zinc-800',
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
      console.warn('API offline, loading mock syllabus.');
    }

    const localCourse = mockSyllabus[slug];
    if (localCourse) {
      setSelectedCourseDetails(localCourse);
    } else {
      setSelectedCourseDetails({
        title: 'Systems Programming & Python',
        description: 'Learn Python script parameters and system controls.',
        modules: [
          {
            title: 'Module 1: Getting Started',
            lessons: [{ id: 'python-helloworld', title: 'Introduction to Python & CLI Arguments', type: 'CODING_LAB' }],
          },
        ],
      });
    }
    setLoadingSyllabus(false);
  };

  return (
    <div className="flex min-h-screen bg-[#030303] text-zinc-100 cyber-grid">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} username={username} userRole={userRole} role={role} />

      <main className="flex-1 flex flex-col min-w-0">
        <Header streak={streak} userXP={userXP} checkedIn={checkedIn} onCheckIn={handleCheckIn} />

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 animate-fade-in">
          {selectedCourseSlug ? (
            loadingSyllabus ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyber-purple" />
              </div>
            ) : selectedCourseDetails ? (
              <CourseDetail course={selectedCourseDetails} onBack={() => { setSelectedCourseSlug(null); setSelectedCourseDetails(null); }} />
            ) : (
              <div className="text-center text-zinc-500 text-sm">Failed to load syllabus details.</div>
            )
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <>
                  <WelcomeBanner username={username} userRole={userRole} userXP={userXP} />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {initialLoading ? (
                      <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-2 mb-6">
                          <div className="w-5 h-5 rounded bg-zinc-800 animate-skeleton-pulse" />
                          <div className="h-5 w-48 rounded bg-zinc-800 animate-skeleton-pulse" />
                        </div>
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="p-5 rounded-2xl bg-zinc-950/40 border border-zinc-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex gap-4 items-center">
                              <div className="w-12 h-12 rounded-xl bg-zinc-800 animate-skeleton-pulse" />
                              <div className="space-y-2">
                                <div className="h-3 w-16 rounded bg-zinc-800 animate-skeleton-pulse" />
                                <div className="h-4 w-48 rounded bg-zinc-800 animate-skeleton-pulse" />
                                <div className="h-3 w-32 rounded bg-zinc-800 animate-skeleton-pulse" />
                              </div>
                            </div>
                            <div className="w-full md:w-auto flex items-center gap-6">
                              <div className="space-y-1 w-28">
                                <div className="h-2 w-full rounded bg-zinc-800 animate-skeleton-pulse" />
                              </div>
                              <div className="h-9 w-24 rounded-xl bg-zinc-800 animate-skeleton-pulse" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <CoursesList courses={displayCourses} onEnter={enterCourse} onBrowseAll={() => setActiveTab('courses')} />
                    )}
                    <QuickLab onXpAwarded={handleXpAwarded} />
                  </div>
                </>
              )}

              {activeTab === 'dashboard' && role === 'INSTRUCTOR' && <InstructorPanel username={username} />}
              {activeTab === 'dashboard' && role === 'ADMIN' && <AdminPanel username={username} />}
              {activeTab === 'courses' && role === 'STUDENT' && <CourseCatalog courses={displayCourses} onEnter={enterCourse} />}
              {activeTab === 'manage-courses' && (role === 'INSTRUCTOR' || role === 'ADMIN') && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold text-white">Manage Courses</h2>
                    <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyber-purple to-cyber-blue hover:opacity-90 text-white font-bold text-xs transition-all cursor-pointer border-none">
                      + Create New Course
                    </button>
                  </div>
                  <CourseCatalog courses={displayCourses} onEnter={enterCourse} />
                </div>
              )}
              {activeTab === 'submissions' && (role === 'INSTRUCTOR' || role === 'ADMIN') && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-extrabold text-white">Pending Submissions</h2>
                  <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/40 text-center">
                    <ClipboardList className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400 text-sm">No pending submissions to review.</p>
                    <p className="text-zinc-600 text-xs mt-2">Student submissions will appear here for grading.</p>
                  </div>
                </div>
              )}
              {activeTab === 'students' && (role === 'INSTRUCTOR' || role === 'ADMIN') && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-extrabold text-white">Students</h2>
                  <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/40 text-center">
                    <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400 text-sm">Student roster will appear here.</p>
                    <p className="text-zinc-600 text-xs mt-2">View enrolled students and their progress.</p>
                  </div>
                </div>
              )}
              {activeTab === 'labs' && <LabsSection />}
              {activeTab === 'leaderboard' && <Leaderboard userXP={userXP} username={username} />}
            </>
          )}
        </div>
      </main>

      <AiChat isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
    </div>
  );
}
