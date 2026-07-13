'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, Plus, Edit3, Trash2, ExternalLink, Globe, 
  Download, Eye, Save, X, GripVertical, Award, BookOpen, Code, Star, GitBranch
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
  imageUrl?: string;
  featured: boolean;
}

interface Portfolio {
  id: string;
  title: string;
  bio: string;
  avatarUrl: string | null;
  projects: Project[];
  skills: string[];
  achievements: { name: string; icon: string; earnedAt: string }[];
  stats: {
    totalXP: number;
    level: number;
    coursesCompleted: number;
    labsCompleted: number;
    certificates: number;
  };
}

export function PortfolioBuilder() {
  const [portfolio, setPortfolio] = useState<Portfolio>({
    id: '1',
    title: 'My StudyAI Portfolio',
    bio: 'Passionate learner exploring the world of technology. Currently focused on cybersecurity and cloud architecture.',
    avatarUrl: null,
    projects: [
      {
        id: 'p1',
        title: 'Network Scanner',
        description: 'A Python-based network scanner using scapy for port discovery and service detection.',
        technologies: ['Python', 'Scapy', 'Networking'],
        githubUrl: 'https://github.com/example/scanner',
        featured: true,
      },
      {
        id: 'p2',
        title: 'Portfolio Website',
        description: 'Modern portfolio built with Next.js and Tailwind CSS.',
        technologies: ['Next.js', 'TypeScript', 'Tailwind'],
        url: 'https://example.com',
        githubUrl: 'https://github.com/example/portfolio',
        featured: false,
      },
    ],
    skills: ['Python', 'JavaScript', 'Networking', 'Cybersecurity', 'AWS', 'Linux'],
    achievements: [
      { name: 'First Steps', icon: '📚', earnedAt: '2026-01-15' },
      { name: 'Week Warrior', icon: '⚡', earnedAt: '2026-02-01' },
      { name: 'Lab Rat', icon: '🧪', earnedAt: '2026-02-15' },
    ],
    stats: {
      totalXP: 12500,
      level: 18,
      coursesCompleted: 8,
      labsCompleted: 15,
      certificates: 3,
    },
  });

  const [editing, setEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({});
  const [showAddProject, setShowAddProject] = useState(false);
  const portfolioRef = useRef<HTMLDivElement>(null);

  const addProject = () => {
    if (!newProject.title) return;
    setPortfolio((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: `p${Date.now()}`,
          title: newProject.title || '',
          description: newProject.description || '',
          technologies: newProject.technologies || [],
          url: newProject.url,
          githubUrl: newProject.githubUrl,
          featured: false,
        },
      ],
    }));
    setNewProject({});
    setShowAddProject(false);
  };

  const removeProject = (id: string) => {
    setPortfolio((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  const toggleFeatured = (id: string) => {
    setPortfolio((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id ? { ...p, featured: !p.featured } : p
      ),
    }));
  };

  const downloadPortfolio = async () => {
    if (!portfolioRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(portfolioRef.current);
      const link = document.createElement('a');
      link.download = 'portfolio.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Failed to download portfolio');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-purple-500" />
          Portfolio Builder
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button
            onClick={downloadPortfolio}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-purple-600 hover:to-indigo-700 transition-all"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Portfolio Card */}
      <div ref={portfolioRef} className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        {/* Profile Section */}
        <div className="flex items-start gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-purple-500/30">
            {portfolio.avatarUrl ? (
              <img src={portfolio.avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              '🎓'
            )}
          </div>
          <div className="flex-1">
            {editing ? (
              <input
                type="text"
                value={portfolio.title}
                onChange={(e) => setPortfolio({ ...portfolio, title: e.target.value })}
                className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-b border-purple-500 focus:outline-none"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{portfolio.title}</h2>
            )}
            {editing ? (
              <textarea
                value={portfolio.bio}
                onChange={(e) => setPortfolio({ ...portfolio, bio: e.target.value })}
                rows={2}
                className="mt-2 w-full text-gray-600 dark:text-gray-400 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            ) : (
              <p className="mt-2 text-gray-600 dark:text-gray-400">{portfolio.bio}</p>
            )}
            <button
              onClick={() => setEditing(!editing)}
              className="mt-2 text-sm text-purple-500 hover:text-purple-600 flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> {editing ? 'Save' : 'Edit'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-4 py-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { label: 'Total XP', value: portfolio.stats.totalXP.toLocaleString(), icon: Star, color: 'text-yellow-500' },
            { label: 'Level', value: portfolio.stats.level, icon: Award, color: 'text-purple-500' },
            { label: 'Courses', value: portfolio.stats.coursesCompleted, icon: BookOpen, color: 'text-blue-500' },
            { label: 'Labs', value: portfolio.stats.labsCompleted, icon: Code, color: 'text-green-500' },
            { label: 'Certs', value: portfolio.stats.certificates, icon: Award, color: 'text-orange-500' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="py-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {portfolio.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="py-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Achievements</h4>
          <div className="flex gap-4">
            {portfolio.achievements.map((achievement, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <span className="text-xl">{achievement.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{achievement.name}</p>
                  <p className="text-xs text-gray-500">{achievement.earnedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="py-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Projects</h4>
            <button
              onClick={() => setShowAddProject(true)}
              className="flex items-center gap-1 text-sm text-purple-500 hover:text-purple-600"
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolio.projects.map((project) => (
              <motion.div
                key={project.id}
                layout
                className={`p-4 rounded-xl border transition-all ${
                  project.featured
                    ? 'border-purple-500/50 bg-purple-50 dark:bg-purple-900/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">{project.title}</h5>
                      {project.featured && (
                        <span className="px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded">Featured</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {project.technologies.map((tech) => (
                        <span key={tech} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                  <button
                    onClick={() => toggleFeatured(project.id)}
                    className={`p-1.5 rounded-lg transition-all ${
                      project.featured ? 'bg-purple-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'
                    }`}
                    title="Toggle featured"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400">
                      <GitBranch className="w-4 h-4" />
                    </a>
                  )}
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => removeProject(project.id)}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-gray-400 hover:text-red-500 ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddProject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowAddProject(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Project</h3>
              <button onClick={() => setShowAddProject(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={newProject.title || ''}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={newProject.description || ''}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="What does this project do?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Technologies (comma-separated)</label>
                <input
                  type="text"
                  value={newProject.technologies?.join(', ') || ''}
                  onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value.split(',').map((s) => s.trim()) })}
                  className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="React, TypeScript, Tailwind"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={newProject.githubUrl || ''}
                    onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Live URL</label>
                  <input
                    type="url"
                    value={newProject.url || ''}
                    onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddProject(false)} className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                Cancel
              </button>
              <button onClick={addProject} className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-indigo-700 transition-all">
                Add Project
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
