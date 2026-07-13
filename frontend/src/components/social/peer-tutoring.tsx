'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Star, Clock, MessageCircle, Video, Calendar, Search, Award, BookOpen } from 'lucide-react';

interface Tutor {
  id: string;
  name: string;
  avatarUrl: string | null;
  level: number;
  xp: number;
  specializations: string[];
  rating: number;
  sessionsCompleted: number;
  available: boolean;
  bio: string;
}

export function PeerTutoring() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for demo
    setTutors([
      {
        id: '1',
        name: 'Sarah Chen',
        avatarUrl: null,
        level: 42,
        xp: 85000,
        specializations: ['Python', 'Machine Learning', 'Data Science'],
        rating: 4.9,
        sessionsCompleted: 156,
        available: true,
        bio: 'Senior ML Engineer passionate about teaching AI concepts.',
      },
      {
        id: '2',
        name: 'Marcus Johnson',
        avatarUrl: null,
        level: 38,
        xp: 72000,
        specializations: ['Networking', 'Cloud', 'AWS'],
        rating: 4.8,
        sessionsCompleted: 98,
        available: true,
        bio: 'Cloud architect with 10+ years of experience.',
      },
      {
        id: '3',
        name: 'Alex Rivera',
        avatarUrl: null,
        level: 35,
        xp: 65000,
        specializations: ['Cybersecurity', 'Penetration Testing', 'Linux'],
        rating: 4.9,
        sessionsCompleted: 134,
        available: false,
        bio: 'Ethical hacker and CTF champion.',
      },
      {
        id: '4',
        name: 'Emily Park',
        avatarUrl: null,
        level: 30,
        xp: 55000,
        specializations: ['JavaScript', 'React', 'Node.js'],
        rating: 4.7,
        sessionsCompleted: 87,
        available: true,
        bio: 'Full-stack developer and open source contributor.',
      },
    ]);
  }, []);

  const allSpecs = [...new Set(tutors.flatMap((t) => t.specializations))];

  const filtered = tutors.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.specializations.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesSpec = !selectedSpec || t.specializations.includes(selectedSpec);
    return matchesSearch && matchesSpec;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-purple-500" />
          Peer Tutoring
        </h3>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-xl text-sm font-medium hover:bg-purple-600 transition-all">
          Become a Tutor
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tutors or topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Specialization Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedSpec(null)}
          className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            !selectedSpec
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {allSpecs.map((spec) => (
          <button
            key={spec}
            onClick={() => setSelectedSpec(selectedSpec === spec ? null : spec)}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedSpec === spec
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Tutors List */}
      <div className="space-y-4">
        {filtered.map((tutor, i) => (
          <motion.div
            key={tutor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500/50 transition-all"
          >
            <div className="flex gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {tutor.name[0]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{tutor.name}</h4>
                    <p className="text-sm text-gray-500">{tutor.bio}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tutor.available
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {tutor.available ? 'Available' : 'Offline'}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" /> {tutor.rating}
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <BookOpen className="w-4 h-4" /> {tutor.sessionsCompleted} sessions
                  </span>
                  <span className="flex items-center gap-1 text-purple-500">
                    <Award className="w-4 h-4" /> Level {tutor.level}
                  </span>
                </div>

                {/* Specializations */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {tutor.specializations.map((spec) => (
                    <span
                      key={spec}
                      className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-purple-600 hover:to-indigo-700 transition-all">
                    <Video className="w-4 h-4" /> Book Session
                  </button>
                  <button className="flex items-center gap-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    <MessageCircle className="w-4 h-4" /> Message
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
