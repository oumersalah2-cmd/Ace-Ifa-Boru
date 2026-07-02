# Ace-Ifa-Boru - Premium Telegram Exam Preparation Platform

A complete, production-ready exam preparation platform built as a Telegram Mini App (TMA). Features include timed quizzes, mock exams, performance analytics, and premium subscriptions.

## 🎯 Features

### Core Features
- ✅ **Secure Telegram Authentication** - Native TMA auth with HMAC-SHA256 validation
- ✅ **Interactive Quiz Engine** - Real-time questions with auto-save functionality
- ✅ **Premium Paywall** - Access control for premium content
- ✅ **Performance Analytics** - Track progress by subject
- ✅ **Responsive UI** - Mobile-first design optimized for Telegram
- ✅ **Telegram Native Integration** - MainButton, BackButton, haptic feedback

### Advanced Features
- 🔒 **Subscription Management** - Monthly and yearly plans
- 📊 **Detailed Analytics Dashboard** - Accuracy, progress, and historical data
- 🤖 **Telegram Bot** - Commands for help, premium upgrade, stats
- ⏱️ **Timed Quizzes** - Countdown timer with auto-submit
- 💾 **State Persistence** - Auto-save quiz progress
- 🔔 **Push Notifications** - Via Telegram bot

## 🏗️ Architecture

```
Ace-Ifa-Boru/
├── database/
│   ├── schema.sql              # PostgreSQL DDL
│   └── prisma.schema           # Prisma ORM schema
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── index.ts        # Express server
│   │   │   ├── bot.ts          # Telegram bot
│   │   │   ├── utils/
│   │   │   │   └── telegram.ts # Auth validation
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── quiz.ts
│   │   │   │   ├── paywall.ts
│   │   │   │   └── analytics.ts
│   │   │   └── lib/
│   │   │       └── prisma.ts
│   │   └── package.json
│   └── frontend/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx         # Home
│       │   ├── quiz/
│       │   ├── analytics/
│       │   └── upgrade/
│       ├── components/
│       │   ├── providers/
│       │   │   ├── TMAProvider.tsx
│       │   │   ├── PaymentProvider.tsx
│       │   │   └── AnalyticsProvider.tsx
│       │   ├── quiz/
│       │   │   ├── QuizScreen.tsx
│       │   │   ├── QuestionCard.tsx
│       │   │   ├── TimerDisplay.tsx
│       │   │   ├── ResultsScreen.tsx
│       │   │   └── PaywallScreen.tsx
│       │   └── analytics/
│       │       └── AnalyticsDashboard.tsx
│       ├── hooks/
│       │   └── useQuizSession.ts
│       └── package.json
├── SETUP.md                     # Setup instructions
├── ARCHITECTURE.md              # Detailed architecture guide
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL / Supabase
- Telegram Bot Token

### 1. Setup Database

```bash
cd packages/backend
# Create database
createdb ace-ifa-boru

# Run migrations
psql ace-ifa-boru < ../../database/schema.sql

# Generate Prisma client
npx prisma generate
```

### 2. Backend Setup

```bash
cd packages/backend
npm install
cp .env.example .env

# Edit .env with:
# DATABASE_URL=postgresql://user:password@localhost:5432/ace-ifa-boru
# TELEGRAM_BOT_TOKEN=your_bot_token
# JWT_SECRET=your-secret-key-min-32-chars

npm run dev
```

### 3. Frontend Setup

```bash
cd packages/frontend
npm install
cp .env.example .env.local

# Edit .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
# NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username

npm run dev
```

### 4. Telegram Bot Setup

Create a bot with [@BotFather](https://t.me/botfather) and:
1. Set Web App URL: `https://your-domain.com`
2. Configure inline button to launch Mini App
3. Add bot token to `.env`

## 📚 API Routes

### Authentication
- `POST /api/auth/login` - Validate initData and create session
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/me` - Get user profile

### Quiz
- `GET /api/quiz/questions` - Fetch questions (filtered by premium)
- `POST /api/quiz/session/start` - Create exam session
- `POST /api/quiz/session/:id/save-answer` - Auto-save answer
- `POST /api/quiz/session/:id/submit` - Submit exam
- `GET /api/quiz/session/:id` - Get session progress

### Paywall
- `GET /api/paywall/check` - Verify premium access
- `POST /api/paywall/upgrade` - Subscribe to premium

### Analytics
- `GET /api/analytics/overview` - Overall performance stats
- `GET /api/analytics/subject/:subject` - Subject-specific analytics

## 🔐 Security Features

1. **Telegram Validation** - HMAC-SHA256 verification of initData
2. **JWT Authentication** - Stateless session tokens
3. **Premium Verification** - Backend checks before serving content
4. **CORS Protection** - Restricted to frontend domain
5. **Input Validation** - Sanitization of all inputs

## 📊 Database Schema

### Users Table
```sql
telegram_id (BIGINT) - Primary key
username, first_name, last_name
is_premium (BOOLEAN), premium_until (TIMESTAMP)
```

### Questions Table
```sql
id (UUID)
subject, topic
question_text, options (JSONB)
correct_option_index, explanation
is_free (BOOLEAN)
```

### Exam Sessions
```sql
id (UUID), user_id (BIGINT)
exam_type, current_answers (JSONB) - State persistence
score, total_questions
is_completed, time_limit_seconds
```

### Performance Analytics
```sql
user_id, subject
total_attempted, total_correct
accuracy_percentage, last_attempted
```

## 🎨 Frontend Features

### Responsive Design
- Mobile-first Tailwind CSS
- Safe area handling for notch devices
- Bottom nav bar for Telegram compatibility

### User Experience
- Real-time answer saving (no data loss)
- Smooth animations and transitions
- Haptic feedback on interactions
- Native Telegram buttons integration
- Loading states and error handling

### State Management
- React Context API for auth, payments, analytics
- Custom hooks for API calls
- Optimistic UI updates

## 🤖 Telegram Bot Commands

```
/start   - Open mini app
/help    - Show features and support info
/premium - Upgrade to premium
/stats   - View quiz statistics
```

## 💳 Payment Integration

Currently supports:
- ✅ In-app upgrade UI
- ⏳ Stripe integration (ready to implement)
- ⏳ PayPal integration (ready to implement)

Edit `packages/frontend/components/providers/PaymentProvider.tsx` to add payment gateway.

## 📈 Performance Optimization

- Image optimization with Next.js Image
- Code splitting and lazy loading
- Prisma client optimization
- Database indexes on frequently queried fields
- Connection pooling ready for Supabase

## 🚢 Deployment

### Vercel (Frontend)
```bash
vercel deploy
```

### Railway / Render (Backend)
```bash
# Connect GitHub repo and deploy
```

### Database
```bash
# Deploy to Supabase
supabase db push
```

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
TELEGRAM_BOT_TOKEN=...
JWT_SECRET=...
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
```

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Deep dive into architecture
- **[API Documentation](./API.md)** - Complete API reference

## 🔄 Next Steps

1. ✅ Core platform setup - DONE
2. ✅ Authentication system - DONE
3. ✅ Quiz engine - DONE
4. ✅ Analytics dashboard - DONE
5. ⏳ Payment gateway integration
6. ⏳ Admin dashboard
7. ⏳ Question bank import
8. ⏳ Email notifications
9. ⏳ Multiplayer mode

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - See LICENSE.md

## 📞 Support

- 📧 Email: support@aceifaboru.com
- 💬 Telegram: [@aceifaboru_bot](https://t.me/aceifaboru_bot)

---

**Ready to launch?** Follow the [Quick Start](#-quick-start) guide above to get running in 10 minutes!

Built with ❤️ for exam preparation
