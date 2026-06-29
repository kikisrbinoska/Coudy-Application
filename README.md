# Coudy – Student Productivity Platform

> **Coffee + Study** — where focus meets friendship.

Coudy is a comprehensive student productivity platform that combines study partner matching, deadline management, habit tracking, AI-powered scheduling, and gamification — all in one place. Instead of jumping between different apps and websites, students get everything they need to stay organized, motivated, and connected.

---

## Features

### Study Buddy System (Discord-Style)
- Connect with other students through subject-organized channels
- Each subject has its own color and role system: **Mentor**, **Beginner**, **Expert**
- Click **"Call a Partner"** to instantly start a video study session
- Earn **digital certificates** upon completing courses — shareable on your profile

### AI-Powered Schedule Generation
- Generate personalized study schedules using Claude AI
- Ombre color gradients represent study intensity — darker shades for intense sessions, lighter for relaxed periods
- Adapts to your workload, deadlines, and habits

### Timers & Study Tracking
- Automatic tracking of time spent studying, broken down by subject
- GitHub-style activity heatmap — each day is colored based on your productivity level
- Detailed statistics and session history

### Deadline Management
- Track all upcoming assignments, exams, and deadlines
- Color-coded urgency levels and course associations

### Habit Tracking
- Build and monitor daily study habits
- Log habit completions and view streaks over time

### Gamification
- Earn **SyncPoints** for productive study sessions, completing habits, and finishing courses
- Level up, unlock **achievements** and **badges**
- Interactive games to keep learning engaging

### Profile & Productivity Insights
- Personalized dashboard with total points, level, badges, and statistics
- AI-generated insights on your peak productivity hours and learning patterns
- Personalized tips based on your study behavior

### Quizzes
- AI-generated quizzes per course topic
- Track quiz performance and reinforce learning

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling (glassmorphic pastel design) |
| Radix UI + shadcn/ui | Component library |
| React Query | Server state management |
| React Router v6 | Client-side routing |
| Recharts | Charts and activity heatmap |
| Axios | HTTP client |

### Backend
| Technology | Purpose |
|---|---|
| Spring Boot | REST API framework |
| Spring Security + JWT | Authentication & authorization |
| PostgreSQL | Database |
| Spring Data JPA | ORM |
| Claude API (Anthropic) | AI schedule generation & quiz creation |
| Swagger / OpenAPI | API documentation |

---

## Project Structure

```
Coudy-Application/
├── backend/
│   └── coudy/
│       └── src/main/java/mk/ukim/finki/timski/coudy/
│           ├── config/          # Security, CORS, OpenAPI config
│           ├── dto/             # Request/response data transfer objects
│           ├── model/           # Domain entities
│           ├── service/         # Business logic & AI integration
│           └── web/controllers/ # REST controllers
└── frontend/
    └── coudy_app/
        └── src/
            ├── api/             # Axios API clients
            ├── components/      # Reusable UI components
            ├── pages/           # Route-level page components
            ├── context/         # Auth context
            └── hooks/           # Custom React hooks
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Java 17+
- PostgreSQL 14+
- Maven

### Backend Setup
   ```
   Run the backend:
   ```bash
   cd backend/coudy
   mvn spring-boot:run
   ```
   Server starts on `http://localhost:9096`

### Frontend Setup

```bash
cd frontend/coudy_app
npm install
npm run dev
```

App runs on `http://localhost:5173`

### API Docs

Swagger UI available at: `http://localhost:9096/swagger-ui.html`

---

## Design

Coudy uses an elegant glassmorphic interface with pastel colors and ombre gradients. Study intensity is visualized through color — darker shades represent heavier study blocks, lighter shades represent lighter sessions. The activity heatmap mirrors GitHub's contribution graph, giving students a satisfying visual record of their consistency.

