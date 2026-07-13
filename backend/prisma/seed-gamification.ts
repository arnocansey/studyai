import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding gamification data...\n');

  // ==================== ACHIEVEMENTS ====================
  const achievements = [
    // Learning achievements
    {
      name: 'first_lesson',
      title: 'First Steps',
      description: 'Complete your first lesson',
      icon: '📚',
      category: 'learning',
      tier: 'bronze',
      xpReward: 50,
      requirement: { type: 'lessons_completed', count: 1 },
    },
    {
      name: 'lesson_10',
      title: 'Knowledge Seeker',
      description: 'Complete 10 lessons',
      icon: '🎓',
      category: 'learning',
      tier: 'silver',
      xpReward: 200,
      requirement: { type: 'lessons_completed', count: 10 },
    },
    {
      name: 'lesson_50',
      title: 'Learning Master',
      description: 'Complete 50 lessons',
      icon: '🏆',
      category: 'learning',
      tier: 'gold',
      xpReward: 500,
      requirement: { type: 'lessons_completed', count: 50 },
    },
    {
      name: 'lesson_100',
      title: 'Century Scholar',
      description: 'Complete 100 lessons',
      icon: '💎',
      category: 'learning',
      tier: 'platinum',
      xpReward: 1000,
      requirement: { type: 'lessons_completed', count: 100 },
    },
    // Streak achievements
    {
      name: 'streak_3',
      title: 'Getting Warm',
      description: 'Maintain a 3-day streak',
      icon: '🔥',
      category: 'streak',
      tier: 'bronze',
      xpReward: 100,
      requirement: { type: 'streak', count: 3 },
    },
    {
      name: 'streak_7',
      title: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '⚡',
      category: 'streak',
      tier: 'silver',
      xpReward: 250,
      requirement: { type: 'streak', count: 7 },
    },
    {
      name: 'streak_30',
      title: 'Monthly Master',
      description: 'Maintain a 30-day streak',
      icon: '🌟',
      category: 'streak',
      tier: 'gold',
      xpReward: 500,
      requirement: { type: 'streak', count: 30 },
    },
    {
      name: 'streak_100',
      title: 'Century Streak',
      description: 'Maintain a 100-day streak',
      icon: '👑',
      category: 'streak',
      tier: 'platinum',
      xpReward: 2000,
      requirement: { type: 'streak', count: 100 },
    },
    // Lab achievements
    {
      name: 'first_lab',
      title: 'Lab Rat',
      description: 'Complete your first lab',
      icon: '🧪',
      category: 'mastery',
      tier: 'bronze',
      xpReward: 75,
      requirement: { type: 'labs_completed', count: 1 },
    },
    {
      name: 'labs_10',
      title: 'Lab Expert',
      description: 'Complete 10 labs',
      icon: '🔬',
      category: 'mastery',
      tier: 'silver',
      xpReward: 300,
      requirement: { type: 'labs_completed', count: 10 },
    },
    // XP achievements
    {
      name: 'xp_1000',
      title: 'Rising Star',
      description: 'Earn 1,000 XP',
      icon: '⭐',
      category: 'challenge',
      tier: 'bronze',
      xpReward: 100,
      requirement: { type: 'xp_earned', count: 1000 },
    },
    {
      name: 'xp_10000',
      title: 'XP Hunter',
      description: 'Earn 10,000 XP',
      icon: '🚀',
      category: 'challenge',
      tier: 'silver',
      xpReward: 500,
      requirement: { type: 'xp_earned', count: 10000 },
    },
    {
      name: 'xp_100000',
      title: 'XP Legend',
      description: 'Earn 100,000 XP',
      icon: '🏅',
      category: 'challenge',
      tier: 'gold',
      xpReward: 2000,
      requirement: { type: 'xp_earned', count: 100000 },
    },
    // Level achievements
    {
      name: 'level_5',
      title: 'Leveling Up',
      description: 'Reach level 5',
      icon: '📈',
      category: 'learning',
      tier: 'bronze',
      xpReward: 100,
      requirement: { type: 'level_reached', count: 5 },
    },
    {
      name: 'level_25',
      title: 'Seasoned Learner',
      description: 'Reach level 25',
      icon: '🎯',
      category: 'learning',
      tier: 'gold',
      xpReward: 1000,
      requirement: { type: 'level_reached', count: 25 },
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement,
    });
  }
  console.log(`✅ Created ${achievements.length} achievements`);

  // ==================== SKILL TREES ====================
  const skillTrees = [
    // Programming branch
    {
      name: 'programming',
      title: 'Programming',
      description: 'Learn to code in multiple languages',
      icon: '💻',
      category: 'programming',
      order: 0,
      xpRequired: 0,
    },
    {
      name: 'python',
      title: 'Python',
      description: 'Master Python programming',
      icon: '🐍',
      category: 'programming',
      parentId: null,
      order: 0,
      xpRequired: 0,
    },
    {
      name: 'python_basics',
      title: 'Python Basics',
      description: 'Variables, loops, and functions',
      icon: '📝',
      category: 'programming',
      order: 0,
      xpRequired: 0,
    },
    {
      name: 'python_advanced',
      title: 'Advanced Python',
      description: 'Decorators, generators, and async',
      icon: '⚡',
      category: 'programming',
      order: 1,
      xpRequired: 500,
    },
    {
      name: 'javascript',
      title: 'JavaScript',
      description: 'Modern JavaScript development',
      icon: '🟨',
      category: 'programming',
      parentId: null,
      order: 1,
      xpRequired: 0,
    },
    {
      name: 'react',
      title: 'React',
      description: 'Build modern UIs with React',
      icon: '⚛️',
      category: 'programming',
      parentId: null,
      order: 2,
      xpRequired: 200,
    },
    // Networking branch
    {
      name: 'networking',
      title: 'Networking',
      description: 'Network fundamentals and protocols',
      icon: '🌐',
      category: 'networking',
      order: 1,
      xpRequired: 0,
    },
    {
      name: 'networking_basics',
      title: 'Network Fundamentals',
      description: 'OSI model, TCP/IP, and more',
      icon: '📡',
      category: 'networking',
      order: 0,
      xpRequired: 0,
    },
    {
      name: 'subnetting',
      title: 'Subnetting',
      description: 'Master IP subnetting',
      icon: '🔢',
      category: 'networking',
      order: 1,
      xpRequired: 200,
    },
    // Cybersecurity branch
    {
      name: 'cybersecurity',
      title: 'Cybersecurity',
      description: 'Ethical hacking and security',
      icon: '🛡️',
      category: 'cybersecurity',
      order: 2,
      xpRequired: 0,
    },
    {
      name: 'web_security',
      title: 'Web Security',
      description: 'OWASP Top 10 and web vulnerabilities',
      icon: '🔒',
      category: 'cybersecurity',
      order: 0,
      xpRequired: 0,
    },
    {
      name: 'pentesting',
      title: 'Penetration Testing',
      description: 'Learn ethical hacking techniques',
      icon: '🎯',
      category: 'cybersecurity',
      order: 1,
      xpRequired: 500,
    },
  ];

  // Create skill trees with parent relationships
  const createdSkills: Record<string, string> = {};
  for (const skill of skillTrees) {
    const created = await prisma.skillTree.upsert({
      where: { name: skill.name },
      update: {
        title: skill.title,
        description: skill.description,
        icon: skill.icon,
        category: skill.category,
        order: skill.order,
        xpRequired: skill.xpRequired,
      },
      create: {
        name: skill.name,
        title: skill.title,
        description: skill.description,
        icon: skill.icon,
        category: skill.category,
        order: skill.order,
        xpRequired: skill.xpRequired,
      },
    });
    createdSkills[skill.name] = created.id;
  }

  // Update parent relationships
  const pythonId = createdSkills['python'];
  await prisma.skillTree.update({
    where: { name: 'python_basics' },
    data: { parentId: pythonId },
  });
  await prisma.skillTree.update({
    where: { name: 'python_advanced' },
    data: { parentId: pythonId },
  });

  console.log(`✅ Created ${skillTrees.length} skill tree nodes`);

  // ==================== DAILY CHALLENGES ====================
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const challenges = [
    {
      title: 'Code Challenge',
      description: 'Solve today\'s coding problem',
      type: 'coding',
      difficulty: 'medium',
      xpReward: 100,
      content: {
        problem: 'Write a function that finds the longest palindrome in a string.',
        examples: ['"babad" → "bab"', '"cbbd" → "bb"'],
        constraints: ['1 <= s.length <= 1000', 's consists of lowercase English letters only'],
      },
      date: today,
      expiresAt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
    {
      title: 'Quiz Challenge',
      description: 'Test your networking knowledge',
      type: 'quiz',
      difficulty: 'easy',
      xpReward: 50,
      content: {
        questions: [
          { q: 'What does DNS stand for?', options: ['Domain Name System', 'Dynamic Network Service', 'Data Node Storage'] },
        ],
      },
      date: today,
      expiresAt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
    {
      title: 'Cyber Challenge',
      description: 'Identify the SQL injection vulnerability',
      type: 'cyber',
      difficulty: 'hard',
      xpReward: 150,
      content: {
        scenario: 'A login form accepts user input without sanitization.',
        task: 'Write a query that would exploit this vulnerability.',
      },
      date: today,
      expiresAt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  ];

  for (const challenge of challenges) {
    await prisma.dailyChallenge.upsert({
      where: { date_type: { date: challenge.date, type: challenge.type } },
      update: challenge,
      create: challenge,
    });
  }
  console.log(`✅ Created ${challenges.length} daily challenges`);

  // ==================== LEAGUES ====================
  const leagues = [
    { name: 'Bronze', tier: 1, minXP: 0, maxXP: 1000, icon: '🥉', color: '#CD7F32' },
    { name: 'Silver', tier: 2, minXP: 1000, maxXP: 5000, icon: '🥈', color: '#C0C0C0' },
    { name: 'Gold', tier: 3, minXP: 5000, maxXP: 15000, icon: '🥇', color: '#FFD700' },
    { name: 'Platinum', tier: 4, minXP: 15000, maxXP: 50000, icon: '💎', color: '#E5E4E2' },
    { name: 'Diamond', tier: 5, minXP: 50000, maxXP: null, icon: '🏆', color: '#B9F2FF' },
  ];

  for (const league of leagues) {
    await prisma.league.upsert({
      where: { id: league.name.toLowerCase() },
      update: league,
      create: {
        id: league.name.toLowerCase(),
        ...league,
      },
    });
  }
  console.log(`✅ Created ${leagues.length} leagues`);

  console.log('\n🎉 Gamification seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
