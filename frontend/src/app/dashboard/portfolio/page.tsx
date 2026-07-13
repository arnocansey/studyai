'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Award, Sparkles, Zap, Users } from 'lucide-react';
import { PortfolioBuilder, CertificateViewer } from '@/components/portfolio';
import { SkillTreeVisualization } from '@/components/skill-tree';
import { SkillMatchmaking } from '@/components/matchmaking';

type Tab = 'portfolio' | 'certificates' | 'skills' | 'matchmaking';

export default function PortfolioDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('portfolio');

  const tabs = [
    { id: 'portfolio' as Tab, label: 'Portfolio', icon: Briefcase },
    { id: 'certificates' as Tab, label: 'Certificates', icon: Award },
    { id: 'skills' as Tab, label: 'Skill Tree', icon: Sparkles },
    { id: 'matchmaking' as Tab, label: 'Find Matches', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-purple-500" />
            My Learning Journey
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Build your portfolio, earn certificates, and find learning partners.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'portfolio' && <PortfolioBuilder />}
          {activeTab === 'certificates' && <CertificateViewer />}
          {activeTab === 'skills' && <SkillTreeVisualization />}
          {activeTab === 'matchmaking' && <SkillMatchmaking />}
        </motion.div>
      </div>
    </div>
  );
}
