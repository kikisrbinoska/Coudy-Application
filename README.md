# Coudy – Student Productivity Platform

> **Coffee + Study** — where focus meets friendship.

Coudy is a comprehensive student productivity platform that combines study partner matching, deadline management, habit tracking, AI-powered scheduling, and gamification — all in one place. Instead of jumping between different apps and websites, students get everything they need to stay organized, motivated, and connected.

---

## Features

### Study Buddy System
- **Discover** tab: browse recommended study partners with a computed match score, filter by subject/course, and send connection requests
- **Requests** tab: accept/decline incoming requests, withdraw sent requests
- **My Buddies** tab: message connected buddies, view unread counts, and request study sessions (paste a Teams/Zoom/Meet link) — sessions go through a request → accept/decline → join flow

### Study Schedule Generation
- Generates a personalized weekly study schedule from your deadlines and available time slots using a rule-based urgency algorithm (`daysLeft / hoursNeeded`) — no external AI call
- Ombre color gradients represent study intensity per block — darker shades for urgent/intense sessions, lighter for relaxed periods
- Tracks adherence (did you follow the plan?) with history over past weeks, and shows a weekly workload summary (light/moderate/heavy)

### Timers & Study Tracking
- Focus timer (count-up stopwatch) with Start/Pause/Stop & Save, task list, optional background music, and theme selection
- Automatic tracking of time spent studying; awards SyncPoints (10 SP per minute)
- GitHub-style activity heatmap — each day is colored based on minutes studied
- Detailed statistics and session history

### Deadline Management
- Track all upcoming assignments, exams, and deadlines
- Color-coded priority levels (Low/Medium/High/Critical) and course associations
- Completion percentage tracking per deadline

### Habit Tracking
- Build and monitor daily/weekly habits by category (Academic, Wellness, Life Balance)
- Log habit completions and view current/longest streaks
- Weekly completion summary chart

### Gamification
- Earn **SyncPoints** for study sessions, habits, and educational games
- Level up (500 SP per level) and unlock **achievements** based on real usage stats
- Play built-in **educational games** — multiple-choice question sessions with live scoring and a results history

### Courses & Quizzes
- Create courses and upload PDF/PowerPoint slides
- Quiz questions are auto-generated from slide content via an AI model (with a deterministic fallback generator if the AI call fails)
- Track quiz performance per course/topic

### Profile & Productivity Insights
- Personalized dashboard with total points, level, and statistics
- Activity heatmap and calculated productivity insights (peak hours, consistency)
- Digital certificates for completed courses

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
| Azure AI / GitHub Models (Llama-3.3-70B-Instruct) | AI quiz question generation from course slides |
| Apache PDFBox / POI-OOXML | PDF/PowerPoint slide text extraction |
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

### Run with Docker

```bash
cp .env.example .env   # fill in AZURE_AI_API_KEY / API_KEY
./deploy.sh            # or: docker compose up --build
```

Spins up Postgres, backend, and frontend containers. Frontend at `http://localhost:3000`, backend at `http://localhost:9096`.

---

## Design

Coudy uses an elegant glassmorphic interface with pastel colors and ombre gradients. Study intensity is visualized through color — darker shades represent heavier study blocks, lighter shades represent lighter sessions. The activity heatmap mirrors GitHub's contribution graph, giving students a satisfying visual record of their consistency.

