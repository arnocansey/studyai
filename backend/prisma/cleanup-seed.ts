import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Removing seeded data (keeping user-created data)...\n');

  // Delete in dependency order (reverse of seed)
  // 1. Delete seeded gamification data
  const achievements = await prisma.achievement.deleteMany({});
  console.log(`  Deleted ${achievements.count} achievements`);

  const skillTree = await prisma.skillTree.deleteMany({});
  console.log(`  Deleted ${skillTree.count} skill tree nodes`);

  const dailyChallenges = await prisma.dailyChallenge.deleteMany({});
  console.log(`  Deleted ${dailyChallenges.count} daily challenges`);

  const leagues = await prisma.league.deleteMany({});
  console.log(`  Deleted ${leagues.count} leagues`);

  // 2. Delete badges
  const badges = await prisma.badge.deleteMany({});
  console.log(`  Deleted ${badges.count} badges`);

  // 3. Delete quiz questions (before lessons)
  const quizzes = await prisma.quizQuestion.deleteMany({});
  console.log(`  Deleted ${quizzes.count} quiz questions`);

  // 4. Delete lessons (before modules)
  const lessons = await prisma.lesson.deleteMany({});
  console.log(`  Deleted ${lessons.count} lessons`);

  // 5. Delete modules (before courses)
  const modules = await prisma.module.deleteMany({});
  console.log(`  Deleted ${modules.count} modules`);

  // 6. Delete courses
  const courses = await prisma.course.deleteMany({});
  console.log(`  Deleted ${courses.count} courses`);

  // 7. Delete instructor user (seeded, not student-created)
  const instructor = await prisma.user.deleteMany({
    where: { email: 'instructor@studyai.io' },
  });
  console.log(`  Deleted ${instructor.count} instructor user(s)`);

  // 8. Delete audit logs and transactions (seed artifacts)
  const auditLogs = await prisma.auditLog.deleteMany({});
  console.log(`  Deleted ${auditLogs.count} audit logs`);

  const transactions = await prisma.transaction.deleteMany({});
  console.log(`  Deleted ${transactions.count} transactions`);

  const posts = await prisma.post.deleteMany({});
  console.log(`  Deleted ${posts.count} posts`);

  // Report what was KEPT
  const users = await prisma.user.count();
  const enrollments = await prisma.enrollment.count();
  const sessions = await prisma.studySession.count();
  console.log(`\n✅ Kept: ${users} user(s), ${enrollments} enrollment(s), ${sessions} study session(s)`);
  console.log('🎉 Seeded data removed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
