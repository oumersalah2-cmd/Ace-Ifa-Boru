# Ace-Ifa-Boru 🎓
### Premium Telegram Mini App (TMA) & Exam Preparation Platform

**Ace-Ifa-Boru** is a production-ready, high-performance secondary school exam preparation platform built as a native Telegram Mini App (TMA). It features a responsive, premium Oromo-centric user interface, interactive quiz engines, advanced analytics, and subscription payment verification handled directly via Telegram admin commands.

---

## 🚀 Key Features

*   **⚡ Optimized Startup Speed:** Authentication is streamlined into a single backend handshake (`/auth/telegram`), eliminating redundant requests to load the dashboard twice as fast.
*   **🔒 Content & Screenshot Protection:**
    *   Disabled text selection (`user-select: none`) and mobile long-press callouts.
    *   Custom JavaScript blockers prevent right-click context menus.
    *   Hotkeys blocked (`F12`, developer tools combination `Ctrl+Shift+I/J/C`, view source `Ctrl+U`, print `Ctrl+P`) to protect question banks from leaks.
*   **📖 Normal (Practice) vs. 📝 Exam Modes:**
    *   **Practice Mode:** Highlights correct answers in green and selected wrong answers in red instantly upon selection. Displays a sliding explanation card (`Ibsa Qabxii`) explaining the answer key.
    *   **Exam Mode:** Simulates a real timed exam (hiding answers and explanation until submission).
*   **⚠️ Question Reporting System:** Students can click a `⚠️ Gabaasi` (Report) button on any question to specify issues. The backend immediately forwards these reports to your Telegram inbox via the bot.
*   **💎 Premium Subscription & Admin Panel:**
    *   Admin access is restricted to `@Lamifd` with case-insensitivity.
    *   Supports bot commands `/approve <username>` to instantly grant 30-day premium status to students upon payment.
    *   Supports bot command `/users` to monitor registration stats.
*   **🆓 Free Trial Structure:**
    *   **Herrega** (Mathematics) and **Saayinsii** (General Science) are available as 5-question free trials.
    *   **Afaan Oromoo** and **English** subjects are locked under premium restrictions.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | [Next.js 14](https://nextjs.org/) | React framework with App Router, static page generation |
| | [Tailwind CSS](https://tailwindcss.com/) | Premium utility-first styling with custom animation transitions |
| | [Lucide React](https://lucide.dev/) | Modern, clean vector icon set |
| | [Telegram SDK](https://github.com/telegram-mini-apps/telegram-apps) | SDK for native MainButton, BackButton, and Haptic Feedback |
| **Backend** | [Express](https://expressjs.com/) | REST API server built in TypeScript |
| | [grammY](https://grammy.dev/) | Telegram bot framework for admin commands and notifications |
| | [Prisma](https://www.prisma.io/) | Next-generation Node.js/TypeScript ORM |
| | [JSON Web Tokens](https://jwt.io/) | JWT stateless authentication |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Hosted on Supabase with connection pooling |

---

## 📂 Project Structure

```text
Ace-Ifa-Boru/
├── packages/
│   ├── backend/
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Prisma database models
│   │   │   └── seed.ts         # Question bank seeding script
│   │   ├── src/
│   │   │   ├── bot.ts          # Telegram bot handlers & commands
│   │   │   ├── index.ts        # Express REST server startup
│   │   │   ├── routes/         # REST API endpoints (auth, exams, paywall, analytics)
│   │   │   └── middleware/     # JWT authentication verifiers
│   └── frontend/
│       ├── src/
│       │   ├── app/            # Next.js App Router (pages & layout)
│       │   ├── components/     # Reusable UI (QuizScreen, Paywall)
│       │   ├── hooks/          # Custom hooks (Telegram WebApp triggers)
│       │   └── lib/            # Axios/Fetch API client hooks
```

---

## ⚙️ Quick Setup

### 1. Prerequisites
- **Node.js** 18 or higher.
- A **PostgreSQL** database (e.g. Supabase).
- A bot token generated from Telegram's [@BotFather](https://t.me/BotFather).

### 2. Database Migration & Seeding
In `packages/backend`:
```bash
# Create/Sync database tables
npx prisma db push

# Seed the question bank
npm run prisma:seed
```

### 3. Backend Configurations
Create a `.env` file in `packages/backend`:
```env
DATABASE_URL="postgresql://user:pass@host:port/dbname?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:port/dbname"
TELEGRAM_BOT_TOKEN="your-bot-token"
JWT_SECRET="your-32-char-jwt-secret"
FRONTEND_ORIGIN="https://your-frontend-domain"
ADMIN_TELEGRAM_ID="your-numeric-telegram-user-id"
PORT=4000
```
Run the backend:
```bash
npm run dev
```

### 4. Frontend Configurations
Create a `.env.local` file in `packages/frontend`:
```env
NEXT_PUBLIC_API_BASE_URL="https://your-backend-domain"
```
Run the frontend:
```bash
npm run dev
```

---

## 🤖 Admin Bot Commands

Register these commands with `@BotFather` or let the backend register them automatically on startup:
*   `/start` - Launches the Mini App.
*   `/register` - Sets up custom login credentials (Username/Password) for students using other devices.
*   `/stats` - Shows basic stats and performance logs of the current user.
*   `/users` (Admin Only) - Displays the last 30 registered users.
*   `/approve <username>` (Admin Only) - Upgrades a student's username to Premium status for 30 days.

---
Built with ❤️ for Oromo Boarding Secondary School Exam Prep.
