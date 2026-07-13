'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, CheckCircle, Lock, BookOpen, Clock, Target } from 'lucide-react';

interface LearningStep {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'quiz' | 'lab' | 'project';
  duration: string;
  completed: boolean;
  locked: boolean;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalSteps: number;
  completedSteps: number;
  estimatedHours: number;
  steps: LearningStep[];
}

export function AILearningPath() {
  const [paths, setPaths] = useState<LearningPath[]>([
    {
      id: '1',
      title: 'Python Mastery',
      description: 'From zero to professional Python developer',
      category: 'programming',
      difficulty: 'beginner',
      totalSteps: 12,
      completedSteps: 5,
      estimatedHours: 40,
      steps: [
        { id: 's1', title: 'Python Basics', description: 'Variables, types, and operators', type: 'lesson', duration: '2h', completed: true, locked: false },
        { id: 's2', title: 'Control Flow', description: 'If statements and loops', type: 'lesson', duration: '2h', completed: true, locked: false },
        { id: 's3', title: 'Functions Quiz', description: 'Test your function knowledge', type: 'quiz', duration: '30m', completed: true, locked: false },
        { id: 's4', title: 'Data Structures', description: 'Lists, dicts, and sets', type: 'lesson', duration: '3h', completed: true, locked: false },
        { id: 's5', title: 'OOP Fundamentals', description: 'Classes and objects', type: 'lesson', duration: '4h', completed: true, locked: false },
        { id: 's6', title: 'Build a Calculator', description: 'Apply what you learned', type: 'project', duration: '3h', completed: false, locked: false },
        { id: 's7', title: 'File I/O Lab', description: 'Practice file operations', type: 'lab', duration: '2h', completed: false, locked: false },
        { id: 's8', title: 'Error Handling', description: 'Try/except and custom exceptions', type: 'lesson', duration: '2h', completed: false, locked: true },
        { id: 's9', title: 'Modules & Packages', description: 'Organize your code', type: 'lesson', duration: '2h', completed: false, locked: true },
        { id: 's10', title: 'Web Scraping', description: 'BeautifulSoup and requests', type: 'lesson', duration: '3h', completed: false, locked: true },
        { id: 's11', title: 'Final Project', description: 'Build a complete application', type: 'project', duration: '5h', completed: false, locked: true },
        { id: 's12', title: 'Certification Exam', description: 'Prove your Python skills', type: 'quiz', duration: '1h', completed: false, locked: true },
      ],
    },
    {
      id: '2',
      title: 'Ethical Hacking',
      description: 'Learn penetration testing from scratch',
      category: 'cybersecurity',
      difficulty: 'intermediate',
      totalSteps: 10,
      completedSteps: 0,
      estimatedHours: 60,
      steps: [
        { id: 'h1', title: 'Security Fundamentals', description: 'Core security concepts', type: 'lesson', duration: '3h', completed: false, locked: false },
        { id: 'h2', title: 'Networking for Hackers', description: 'TCP/IP deep dive', type: 'lesson', duration: '4h', completed: false, locked: false },
        { id: 'h3', title: 'Reconnaissance Lab', description: 'Information gathering', type: 'lab', duration: '3h', completed: false, locked: true },
        { id: 'h4', title: 'Vulnerability Scanning', description: 'Nmap and Nessus', type: 'lesson', duration: '3h', completed: false, locked: true },
        { id: 'h5', title: 'Exploitation Basics', description: 'Metasploit framework', type: 'lesson', duration: '4h', completed: false, locked: true },
        { id: 'h6', title: 'Web App Hacking', description: 'OWASP Top 10 in practice', type: 'lab', duration: '5h', completed: false, locked: true },
        { id: 'h7', title: 'Privilege Escalation', description: 'Linux and Windows', type: 'lesson', duration: '4h', completed: false, locked: true },
        { id: 'h8', title: 'CTF Challenge', description: 'Capture the flag', type: 'project', duration: '6h', completed: false, locked: true },
        { id: 'h9', title: 'Report Writing', description: 'Professional pentest reports', type: 'lesson', duration: '2h', completed: false, locked: true },
        { id: 'h10', title: 'Final Exam', description: 'Certified ethical hacker prep', type: 'quiz', duration: '2h', completed: false, locked: true },
      ],
    },
    {
      id: '3',
      title: 'Cloud Architecture',
      description: 'AWS solutions architect learning path',
      category: 'cloud',
      difficulty: 'advanced',
      totalSteps: 8,
      completedSteps: 0,
      estimatedHours: 50,
      steps: [
        { id: 'c1', title: 'Cloud Fundamentals', description: 'IaaS, PaaS, SaaS', type: 'lesson', duration: '2h', completed: false, locked: false },
        { id: 'c2', title: 'AWS Core Services', description: 'EC2, S3, RDS', type: 'lesson', duration: '5h', completed: false, locked: true },
        { id: 'c3', title: 'VPC Lab', description: 'Build a virtual network', type: 'lab', duration: '4h', completed: false, locked: true },
        { id: 'c4', title: 'IAM & Security', description: 'Identity and access management', type: 'lesson', duration: '3h', completed: false, locked: true },
        { id: 'c5', title: 'Serverless', description: 'Lambda and API Gateway', type: 'lesson', duration: '4h', completed: false, locked: true },
        { id: 'c6', title: 'Infrastructure as Code', description: 'CloudFormation basics', type: 'lesson', duration: '4h', completed: false, locked: true },
        { id: 'c7', title: 'Architecture Project', description: 'Design a scalable system', type: 'project', duration: '8h', completed: false, locked: true },
        { id: 'c8', title: 'Certification Prep', description: 'AWS Solutions Architect', type: 'quiz', duration: '3h', completed: false, locked: true },
      ],
    },
  ]);

  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);

  const difficultyColors = {
    beginner: 'text-green-500 bg-green-100 dark:bg-green-900/30',
    intermediate: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
    advanced: 'text-red-500 bg-red-100 dark:bg-red-900/30',
  };

  const stepIcons = {
    lesson: BookOpen,
    quiz: Target,
    lab: Sparkles,
    project: ChevronRight,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Learning Paths
        </h3>
      </div>

      {!selectedPath ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paths.map((path, i) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedPath(path)}
              className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500/50 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColors[path.difficulty]}`}>
                  {path.difficulty}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {path.estimatedHours}h
                </span>
              </div>

              <h4 className="font-semibold text-gray-900 dark:text-white">{path.title}</h4>
              <p className="text-sm text-gray-500 mt-1">{path.description}</p>

              {/* Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">{path.completedSteps}/{path.totalSteps} steps</span>
                  <span className="text-purple-500 font-medium">
                    {Math.round((path.completedSteps / path.totalSteps) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${(path.completedSteps / path.totalSteps) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <button
            onClick={() => setSelectedPath(null)}
            className="text-purple-500 hover:text-purple-600 text-sm font-medium flex items-center gap-1"
          >
            ← Back to Learning Paths
          </button>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedPath.title}</h3>
                <p className="text-gray-500 mt-1">{selectedPath.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[selectedPath.difficulty]}`}>
                {selectedPath.difficulty}
              </span>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {selectedPath.steps.map((step, i) => {
                const Icon = stepIcons[step.type];
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      step.locked
                        ? 'bg-gray-50 dark:bg-gray-800/50 opacity-50'
                        : step.completed
                          ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800'
                          : 'bg-gray-50 dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/10 cursor-pointer'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      step.completed
                        ? 'bg-green-500 text-white'
                        : step.locked
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-500'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : step.locked ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white">{step.title}</h4>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {step.duration}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full capitalize">
                        {step.type}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
