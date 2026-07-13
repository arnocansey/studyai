'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, Target, Clock, Star, MessageCircle, Video, ArrowRight } from 'lucide-react';

interface MatchResult {
  id: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    level: number;
  };
  compatibility: number;
  matchReason: string;
  sharedSkills: string[];
  complementarySkills: string[];
  availability: 'online' | 'offline' | 'busy';
  lastActive: string;
}

export function SkillMatchmaking() {
  const [matches, setMatches] = useState<MatchResult[]>([
    {
      id: '1',
      user: { id: 'u1', name: 'Sarah Chen', avatarUrl: null, level: 42 },
      compatibility: 95,
      matchReason: 'Both learning cybersecurity, you know Python she wants to learn',
      sharedSkills: ['Python', 'Networking'],
      complementarySkills: ['She teaches: Machine Learning', 'You teach: Web Security'],
      availability: 'online',
      lastActive: 'Now',
    },
    {
      id: '2',
      user: { id: 'u2', name: 'Marcus Lee', avatarUrl: null, level: 35 },
      compatibility: 88,
      matchReason: 'Complementary cloud skills, similar learning pace',
      sharedSkills: ['AWS', 'Linux'],
      complementarySkills: ['He teaches: Terraform', 'You teach: Python'],
      availability: 'online',
      lastActive: '5m ago',
    },
    {
      id: '3',
      user: { id: 'u3', name: 'Emily Park', avatarUrl: null, level: 28 },
      compatibility: 82,
      matchReason: 'Both working on full-stack projects, similar level',
      sharedSkills: ['JavaScript', 'React'],
      complementarySkills: ['She teaches: Design', 'You teach: Backend'],
      availability: 'busy',
      lastActive: '1h ago',
    },
    {
      id: '4',
      user: { id: 'u4', name: 'Alex Kim', avatarUrl: null, level: 31 },
      compatibility: 78,
      matchReason: 'Network security focus, different specializations',
      sharedSkills: ['Networking'],
      complementarySkills: ['He teaches: Forensics', 'You teach: Pentesting'],
      availability: 'offline',
      lastActive: '3h ago',
    },
  ]);

  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);

  const availabilityColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-yellow-500',
  };

  const compatibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-purple-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-500" />
          Skill Matchmaking
        </h3>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-xl text-sm font-medium hover:bg-purple-600 transition-all">
          <Target className="w-4 h-4" /> Find Matches
        </button>
      </div>

      <p className="text-gray-500 text-sm">
        We match you with learners who have complementary skills and similar goals.
      </p>

      {/* Matches List */}
      <div className="space-y-3">
        {matches.map((match, i) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedMatch(match)}
            className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500/50 cursor-pointer transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                  {match.user.name[0]}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${availabilityColors[match.availability]}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{match.user.name}</h4>
                    <p className="text-sm text-gray-500">Level {match.user.level}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${compatibilityColor(match.compatibility)}`}>
                      {match.compatibility}%
                    </p>
                    <p className="text-xs text-gray-500">match</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{match.matchReason}</p>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Shared:</span>
                    {match.sharedSkills.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> {match.lastActive}
                  </span>
                  <button className="flex items-center gap-1 text-sm text-purple-500 hover:text-purple-600">
                    <MessageCircle className="w-3.5 h-3.5" /> Message
                  </button>
                  <button className="flex items-center gap-1 text-sm text-purple-500 hover:text-purple-600">
                    <Video className="w-3.5 h-3.5" /> Video Call
                  </button>
                  <button className="ml-auto flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-all">
                    Connect <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedMatch(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-purple-500/30">
                {selectedMatch.user.name[0]}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4">{selectedMatch.user.name}</h3>
              <p className="text-gray-500">Level {selectedMatch.user.level}</p>
              <p className={`text-3xl font-bold mt-2 ${compatibilityColor(selectedMatch.compatibility)}`}>
                {selectedMatch.compatibility}% Match
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Why we matched you</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedMatch.matchReason}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Shared Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMatch.sharedSkills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Skill Exchange</h4>
                <ul className="space-y-2">
                  {selectedMatch.complementarySkills.map((skill, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <ArrowRight className="w-3.5 h-3.5 text-purple-500" /> {skill}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedMatch(null)}
                className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                Close
              </button>
              <button className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-indigo-700 transition-all">
                Send Request
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
