import { PrismaClient, Role, LessonType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing data (in reverse order of dependencies)
  await prisma.auditLog.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.labSession.deleteMany({});
  await prisma.userBadge.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.quizQuestion.deleteMany({});
  await prisma.lessonProgress.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing database records.');

  // 2. Create Badges
  const badgeSubnet = await prisma.badge.create({
    data: {
      name: 'Subnet Master',
      description: 'Successfully completed the advanced subnet routing lab',
      iconUrl: '/badges/subnet-master.png',
    },
  });

  const badgeCoder = await prisma.badge.create({
    data: {
      name: 'Python Pioneer',
      description: 'Wrote your first system script in Python',
      iconUrl: '/badges/python-pioneer.png',
    },
  });

  const badgeHacker = await prisma.badge.create({
    data: {
      name: 'Shell Raider',
      description: 'Exploited a SUID binary in the Linux cyber lab',
      iconUrl: '/badges/shell-raider.png',
    },
  });

  console.log('🏆 Created default gamification badges.');

  // 3. Create Seed Instructor User
  const instructor = await prisma.user.create({
    data: {
      email: 'instructor@studyai.io',
      name: 'Dr. Evelyn Carter',
      role: Role.INSTRUCTOR,
      xp: 5000,
    },
  });

  console.log(`👤 Created Instructor User: ${instructor.email}`);

  // 4. Course 1: Programming with Python
  const pythonCourse = await prisma.course.create({
    data: {
      title: 'Systems Programming & Scripting with Python',
      slug: 'python-systems-programming',
      description: 'Master systems automation, basic scripting syntax, data types, and file execution.',
      difficulty: 'BEGINNER',
      published: true,
    },
  });

  const pyModule1 = await prisma.module.create({
    data: {
      courseId: pythonCourse.id,
      title: 'Foundations & Basic Syntax',
      order: 1,
    },
  });

  const pyLesson1 = await prisma.lesson.create({
    data: {
      moduleId: pyModule1.id,
      title: 'The Hello World Executable',
      type: LessonType.CODING_LAB,
      order: 1,
      content: `# Hello World in Python

Welcome to your first programming lab! Python is an interpreted, high-level programming language known for its readability.

### Today's Mission:
Your goal is to write a script that outputs the text \`Hello, StudyAI!\` to the stdout console.

### Syntax Hint:
\`\`\`python
print("Your text here")
\`\`\`
`,
      labConfig: {
        starterCode: "# Write your Python code below\nprint('')",
        solution: "print('Hello, StudyAI!')",
        testCases: [
          { input: "", expected: "Hello, StudyAI!\n" }
        ]
      }
    },
  });

  await prisma.quizQuestion.create({
    data: {
      lessonId: pyLesson1.id,
      question: 'Which built-in Python function writes text to the standard console output?',
      options: ['echo()', 'printf()', 'print()', 'system.out()'],
      correctAnswer: 'print()',
    },
  });

  // 5. Course 2: IP Subnetting & Network Architectures
  const networkingCourse = await prisma.course.create({
    data: {
      title: 'IP Subnetting & Network Topologies',
      slug: 'ip-subnetting-topologies',
      description: 'Learn subnet masks, CIDR notations, packet traversals, and routing cable setups.',
      difficulty: 'INTERMEDIATE',
      published: true,
    },
  });

  const netModule1 = await prisma.module.create({
    data: {
      courseId: networkingCourse.id,
      title: 'CIDR & Routing Boundaries',
      order: 1,
    },
  });

  const netLesson1 = await prisma.lesson.create({
    data: {
      moduleId: netModule1.id,
      title: 'Splitting Class C Subnets',
      type: LessonType.NETWORKING_LAB,
      order: 1,
      content: `# Class C Subnetwork Design

Subnetting allows you to divide a single network range into smaller isolated pieces (subnets) to restrict broadcast traffic and improve IP management.

### Today's Mission:
You need to segment a IP range of \`192.168.1.0/24\` to yield at least 4 subnet blocks. 

1. Drag 4 routers and 4 switches onto the canvas.
2. Link the Router ports to the Switches.
3. Configure the subnet mask boundary to accommodate the divisions.
`,
      labConfig: {
        networkRange: "192.168.1.0/24",
        requiredSubnets: 4,
        targetMask: "255.255.255.192" // /26
      }
    },
  });

  await prisma.quizQuestion.create({
    data: {
      lessonId: netLesson1.id,
      question: 'What is the subnet mask representation of a /26 prefix block?',
      options: ['255.255.255.0', '255.255.255.192', '255.255.255.240', '255.255.255.252'],
      correctAnswer: '255.255.255.192',
    },
  });

  // 6. Course 3: Ethical Hacking & Linux Security
  const cyberCourse = await prisma.course.create({
    data: {
      title: 'Ethical Hacking & Linux Exploit Labs',
      slug: 'ethical-hacking-linux-security',
      description: 'Master bash navigation, directory permissions, file cracking, and privilege escalations.',
      difficulty: 'ADVANCED',
      published: true,
    },
  });

  const cyberModule1 = await prisma.module.create({
    data: {
      courseId: cyberCourse.id,
      title: 'Linux Directory Navigation & Security',
      order: 1,
    },
  });

  const cyberLesson1 = await prisma.lesson.create({
    data: {
      moduleId: cyberModule1.id,
      title: 'Exploiting SUID Binaries',
      type: LessonType.CYBER_LAB,
      order: 1,
      content: `# Linux SUID Privilege Escalation

SUID (Set owner User ID upon execution) is a special type of file permission in Unix-like OS that permits users to run files with the permissions of the file owner.

### Today's Mission:
1. Inspect the \`/bin/vuln-helper\` executable.
2. Notice the SUID bit set for the root owner.
3. Exploiting the binary to read \`/root/flag.txt\`.
`,
      labConfig: {
        flag: "studyai{suid_priv_escalation_success}",
        environmentImage: "alpine-suid-vuln"
      }
    },
  });

  await prisma.quizQuestion.create({
    data: {
      lessonId: cyberLesson1.id,
      question: 'Which chmod permission code sets the SUID bit on an executable?',
      options: ['chmod 777', 'chmod +x', 'chmod u+s', 'chmod g+s'],
      correctAnswer: 'chmod u+s',
    },
  });

  console.log('📚 Curricula, lessons, and quizzes successfully seeded.');
  console.log('🌱 Seeding process complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
