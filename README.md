# StudyAI — AI-Powered Learning Platform

A full-stack EdTech platform combining AI tutoring, gamification, real-time collaboration, and lab environments. Built to compete with TryHackMe, Duolingo, Codecademy, and Khan Academy.

## Architecture

```
studyai/
├── api/              # Shared types, Zod schemas, client SDK (@studyai/api)
├── backend/          # NestJS API server (port 4000)
├── frontend/         # Next.js 16 web app (port 3000)
├── mobile/           # Expo React Native app
├── scripts/          # Utility scripts (icon generation)
├── docker-compose.yml
└── pnpm-workspace.yaml
```

**Tech Stack:** NestJS, Prisma ORM, PostgreSQL 16, Redis 7, Next.js 16 (App Router), React, TypeScript, Tailwind CSS, Expo SDK 54, React Native, Socket.io, Yjs CRDTs, web-push VAPID

## Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 16 (or Docker)
- Redis 7 (optional, for caching)
- Google Gemini API key (for AI features)

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-org/studyai.git
cd studyai
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example backend/.env
cp .env.example frontend/.env.local
```

Edit `backend/.env` with your values:

```ini
DATABASE_URL="postgresql://postgres:password@localhost:5432/studyai"
JWT_SECRET="your-super-secret-jwt-key"
GEMINI_API_KEY="your-gemini-api-key"
CORS_ORIGINS="http://localhost:3000"
VAPID_PUBLIC_KEY=""    # Generate with: npx web-push generate-vapid-keys
VAPID_PRIVATE_KEY=""
VAPID_EMAIL="mailto:you@example.com"
```

### 3. Database Setup

```bash
cd backend
npx prisma db push
npx ts-node prisma/seed.ts
npx ts-node prisma/seed-gamification.ts
```

### 4. Run with Docker (Recommended)

```bash
docker-compose up -d
```

This starts PostgreSQL, Redis, backend, and frontend.

### 5. Run Manually

```bash
# Terminal 1 — Backend
cd backend
pnpm run start:dev

# Terminal 2 — Frontend
cd frontend
pnpm run dev

# Terminal 3 — Mobile (optional)
cd mobile
pnpm start
```

Open http://localhost:3000 for the web app.

## Features

### AI-Powered Learning
- **Socratic Tutoring** — AI guides students through problems with questions, not answers
- **Code Review** — Gemini AI reviews code submissions with detailed feedback
- **Adaptive Quizzes** — Questions adjust difficulty based on performance
- **AI Hints** — Context-aware hints that don't spoil the solution
- **Natural Language Explanations** — Ask questions about any lesson topic

### Gamification System
- **XP & Levels** — Earn XP for completing lessons, quizzes, and challenges
- **Daily Streaks** — Maintain streaks with streak freeze protection
- **Achievements** — 15+ achievements across bronze/silver/gold/platinum tiers
- **Skill Trees** — 12+ skill nodes with prerequisites and progression tracking
- **Leagues** — Weekly competitive leagues (Bronze → Diamond)
- **Daily Challenges** — Rotating challenges with bonus XP rewards
- **Leaderboards** — Global and per-course rankings

### Real-Time Collaboration
- **Live Chat** — WebSocket-powered chat with reactions, emoji, and typing indicators
- **Collaborative Editor** — Yjs CRDT-based real-time code editing with cursor presence
- **Study Groups** — Create/join groups with role-based moderation
- **Discussion Forums** — Threaded discussions with upvotes and pinning

### Lab Environments
- **Coding Labs** — Interactive code execution with sandboxed output
- **Networking Labs** — Network simulation exercises
- **Cybersecurity Labs** — Security challenge environments

### Content & Progress
- **Course Catalog** — Structured courses with modules and lessons
- **Lesson Types** — Text, video, coding labs, networking labs, quizzes
- **Progress Tracking** — Per-lesson completion, course enrollment, XP history
- **Portfolio Builder** — Showcase projects with technologies and links
- **Certificates** — Verified completion certificates with unique hashes

### Mobile App (Expo)
- **13 screens** — Dashboard, Gamification, Chat, Social, Playground, Profile, Analytics, Settings, and more
- **Push Notifications** — Real-time alerts via web-push VAPID
- **Biometric Auth** — Face ID / fingerprint login
- **Offline Mode** — Cached data with automatic sync
- **Dark/Light Theme** — System-aware theme toggle
- **Deep Linking** — `studyai://` URL scheme
- **OTA Updates** — Expo Updates for instant hotfixes

### Security
- **JWT Authentication** — Access tokens with configurable expiration
- **Password Hashing** — bcrypt with 12 rounds, complexity enforcement
- **Rate Limiting** — Configurable per-endpoint throttling
- **Input Validation** — Class-validator with whitelist filtering
- **Security Headers** — X-Frame-Options, CSP, HSTS
- **CORS Restrictions** — Origin allowlist
- **WebSocket Auth** — JWT verification on connection
- **IDOR Prevention** — Server-side ownership verification

### i18n
- **Multi-language** — English, Spanish, French translations
- **Context Provider** — React-based language switching

### PWA
- **Web App Manifest** — Installable as native-like app
- **Service Worker** — Cache-first for assets, network-first for API

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login (returns JWT) |
| GET | `/auth/me` | Get current user (JWT required) |

### Gamification
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/gamification/check-in` | Daily check-in |
| GET | `/gamification/xp-progress` | XP and level info |
| GET | `/gamification/leaderboard` | Top users |
| GET | `/gamification/achievements` | User achievements |
| POST | `/gamification/study-sessions/start` | Start timer |
| POST | `/gamification/study-sessions/:id/end` | End timer, earn XP |
| POST | `/gamification/streak-freezes/use` | Use streak freeze |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses` | List courses |
| GET | `/courses/:id` | Course details |
| POST | `/courses/:id/enroll` | Enroll in course |
| GET | `/courses/:id/progress` | Course progress |

### Lessons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/lessons/:id` | Lesson details |
| POST | `/lessons/:id/complete` | Mark complete |
| POST | `/lessons/:id/quiz/submit` | Submit quiz answers |
| POST | `/lessons/:id/lab/submit` | Submit lab code |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/explain` | Explain a concept |
| POST | `/ai/tutor` | Socratic tutoring session |
| POST | `/ai/review` | Code review |
| POST | `/ai/hint` | Get a hint |

### Chat (WebSocket)
| Event | Description |
|-------|-------------|
| `join-room` | Join a chat room |
| `send-message` | Send a message |
| `typing` | Typing indicator |
| `reaction` | Add/remove reaction |

### Collaborative Editing (WebSocket)
| Event | Description |
|-------|-------------|
| `doc:join` | Join a document room |
| `doc:update` | Send Yjs update |
| `awareness:update` | Send cursor position |
| `doc:leave` | Leave document |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/notifications/subscribe` | Register push subscription |
| POST | `/notifications/send` | Send notification to user |
| POST | `/notifications/broadcast` | Send to all subscribers (admin) |
| GET | `/notifications/vapid-public-key` | Get VAPID public key |

### Study Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/study-groups` | List groups |
| POST | `/study-groups` | Create group |
| POST | `/study-groups/:id/join` | Join group |
| POST | `/study-groups/:id/leave` | Leave group |

### Discussions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/discussions` | List discussions |
| POST | `/discussions` | Create discussion |
| POST | `/discussions/:id/reply` | Reply to discussion |
| POST | `/discussions/:id/upvote` | Upvote discussion |
| PATCH | `/discussions/:id/pin` | Pin discussion (admin) |

## Development

### Running Tests

```bash
# Backend unit tests
cd backend && pnpm test

# Backend E2E tests
cd backend && pnpm run test:e2e

# Mobile tests
cd mobile && pnpm test

# Mobile typecheck
cd mobile && pnpm typecheck
```

### Pre-commit Hooks

Husky + lint-staged run automatically on commit:
- ESLint with auto-fix
- Prettier formatting

### Backend Modules

| Module | Purpose |
|--------|---------|
| `auth` | JWT authentication, registration, login |
| `users` | User profiles, XP tracking |
| `courses` | Course catalog, enrollment |
| `lessons` | Lesson content, progress, quizzes, labs |
| `gamification` | XP, streaks, achievements, leagues, skill trees |
| `ai` | Gemini AI integration (tutor, review, hints) |
| `chat` | WebSocket real-time chat |
| `collaborative` | Yjs-based collaborative editing |
| `discussions` | Forum discussions and replies |
| `study-groups` | Study group management |
| `notifications` | Web-push notification delivery |
| `prisma` | Database access layer |

### Database Schema

26 models across auth, content, gamification, progress, and community domains. Key relationships:

- User → Enrollments → Course → Modules → Lessons
- User → Achievements, Skills, Leagues (gamification)
- User → StudySessions, StreakFreezes (progress)
- User → Discussions, StudyGroups, ChatMessages (community)

See `backend/prisma/schema.prisma` for the full schema.

## Deployment

### Docker Production Build

```bash
docker-compose -f docker-compose.yml up -d --build
```

### Manual Deployment

**Backend (Railway/Render):**
```bash
cd backend
pnpm build
node dist/main.js
```

**Frontend (Vercel):**
```bash
cd frontend
pnpm build
# Deploy to Vercel
```

**Mobile (EAS):**
```bash
cd mobile
eas build --platform android
eas build --platform ios
```

### Environment Variables for Production

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Random 32+ character string |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins |
| `VAPID_PUBLIC_KEY` | No | Web-push VAPID public key |
| `VAPID_PRIVATE_KEY` | No | Web-push VAPID private key |
| `VAPID_EMAIL` | No | Contact email for VAPID |
| `REDIS_HOST` | No | Redis host for caching |

## License

MIT
