# Soldost — A WhatsApp Language Learning App

🚀 **A revolutionary language learning app for pairs: one teacher, one learner, powered by AI.**

---

## What is Soldost?

Soldost is a WhatsApp-native application that turns language learning into a daily ritual. A bot orchestrates structured learning loops where:

1. **Learner** receives 3 target-language words daily
2. **Learner** constructs a sentence using the words
3. **Teacher** replies conversationally in the target language
4. **Learner** translates the teacher's message
5. **Bot** evaluates the translation
6. **Learner** replies in the target language
7. **Bot** corrects grammar and confirms

All interactions happen in a WhatsApp group. Progress is tracked on a web dashboard. Streaks keep learners motivated.

---

## Key Features (MVP)

✅ **WhatsApp-native interface** — No app to install, works with existing WhatsApp group  
✅ **AI-powered evaluation** — Claude evaluates translations and grammar  
✅ **Daily streak tracking** — Motivates consistent practice  
✅ **Learning history dashboard** — See all past loops and progress  
✅ **Roman-script only** — All content in transliterated text for easy typing  
✅ **Smart reminders** — Nudges learner and teacher to stay on track  

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **WhatsApp Integration** | Baileys (unofficial Web protocol) | Real group participation, no approval needed, $0 cost |
| **Backend & Database** | Supabase (PostgreSQL) + Node.js | Managed database, auth, realtime, RLS policies |
| **Dashboard** | Next.js (App Router) | Server components, fast data loading |
| **AI Engine** | Anthropic Claude (Sonnet) | Multilingual, good transliteration, cost-effective |
| **Hosting** | Railway | Persistent compute for Baileys bot (~$5/mo) |
| **Scheduling** | node-cron | In-process, no external dependencies |

---

## Project Structure

```
soldost/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   ├── (dashboard)/              # Dashboard views (learner + teacher)
│   ├── api/                      # API routes
│   └── server.ts                 # Entry point (bot + cron + next.js)
│
├── lib/                          # Shared utilities
│   ├── config/                   # env, logging
│   ├── llm/                      # LLM abstraction & types
│   ├── supabase/                 # Supabase client + types
│   ├── transliteration/          # Tamil romanization
│   └── whatsapp/                 # Baileys helpers
│
├── services/                     # Business logic
│   ├── llm-service.ts            # LLM facade & provider factory
│   ├── bailey-client.ts          # Bot initialization
│   ├── message-handler.ts        # Incoming message routing
│   ├── learning-loop-engine.ts   # State machine coordinator
│   ├── scheduler.ts              # Daily word delivery
│   └── group-onboarding.ts       # Group setup flow
│
├── db/
│   ├── migrations/               # Supabase SQL migrations
│   └── seeds/                    # Word bank seed data
│
├── supabase/                     # Supabase config
│   ├── migrations/               # Schema definitions
│   └── config.toml               # Supabase CLI config
│
├── docs/                         # Documentation
│   ├── SETUP.md                  # Local dev setup
│   ├── ARCHITECTURE.md           # System design
│   ├── TRANSLITERATION.md        # Tamil romanization rules
│   └── CONTRIBUTING.md           # Contributing guide
│
└── package.json                  # Dependencies
```

---

## Quick Start

### For Local Development

```bash
# 1. Clone & install
git clone https://github.com/yourusername/soldost.git
cd soldost
npm install

# 2. Setup environment
cp .env.example .env.local
# Fill in Supabase URL, Anthropic key, WhatsApp numbers

# 3. Initialize database
supabase link --project-ref <your-ref>
supabase db push
npm run db:seed

# 4. Start dev server
npm run dev
# ✅ Bot ready at http://localhost:3000
# 📱 Scan QR code in console to link WhatsApp
```

See [docs/SETUP.md](docs/SETUP.md) for detailed steps.

### For Production Deployment

```bash
# 1. Create Railway project
# 2. Link GitHub repository for auto-deploy
# 3. Set environment variables in Railway secrets
# 4. Push to main branch
# 🚀 App auto-deploys to Railway
```

---

## Development Timeline (MVP)

**Timeline**: 6-8 weeks with 2-3 developers

| Phase | Duration | Focus |
|-------|----------|-------|
| **Phase 1-2** | Week 1 | Project setup, database schema, word bank |
| **Phase 3-4** | Week 2 | LLM service, transliteration utils |
| **Phase 5-6** | Week 2-3 | Baileys bot, learning loop engine |
| **Phase 7** | Week 4-5 | Next.js dashboard (parallel with Phase 6) |
| **Phase 8-9** | Week 5 | API routes, server config |
| **Phase 10** | Week 6 | Testing & QA |
| **Phase 11** | Week 6 | Documentation & deployment |
| **Phase 12** | Week 6-7 | Beta testing & iteration |

---

## Key Decisions

### Roman Script Only

**All text** (words, sentences, feedback, dashboard) is rendered in **Roman/Latin script exclusively**. No native script anywhere.

**Why**: Platform independence, easier keyboard input for learners, consistent transliteration.

**How**: Word bank stores `word_text_roman` only. LLM prompts enforce Roman output.

### Single-Process Architecture

**Baileys bot + Next.js dashboard + node-cron scheduler** run in one Node.js process on Railway.

**Why**: Baileys requires persistent WebSocket connection (can't be serverless). Simpler deployment.

**Limitation**: Vertical scaling only. If needed post-MVP, split into separate Railway services.

### LLM Provider Abstraction

**All LLM calls** route through a provider-agnostic interface. Swap providers (Anthropic ↔ OpenAI) via config.

**Cost optimization**: Two-tier evaluation (cheap intent classification before expensive grammar check).

### Learning Loop State Machine

**State stored in Supabase**, survives server restarts. Routed by simple state checks, room to evolve to XState later.

---

## Communication & Conventions

### Code Style

- **TypeScript strict mode**: No implicit any
- **Prettier**: Auto-formatted on commit (config: `.prettierrc`)
- **ESLint**: Checked on build
- **Naming**: camelCase for variables/functions, PascalCase for classes/types

### Git Workflow

1. Create feature branch: `git checkout -b feat/llm-service`
2. Commit with type: `git commit -m "feat: implement Claude adapter"`
3. Push and open PR
4. Merge after review

### PR Naming Convention

- `feat: add feature`
- `fix: resolve bug`
- `docs: update documentation`
- `refactor: improve code structure`
- `test: add test coverage`

### Database Migrations

```bash
# Create new migration
supabase migration new migration_name

# Edit supabase/migrations/xxxxxxx_migration_name.sql
supabase db push
```

---

## Monitoring & Observability

**Logging**: Structured JSON logs via Pino, configurable log level

**LLM Cost Tracking**: All LLM calls logged to `llm_calls_log` table

**Health Check**: `GET /api/health` for Railway monitoring

**Future**: Sentry for error tracking, Datadog for metrics

---

## Support & Documentation

- **Setup**: [docs/SETUP.md](docs/SETUP.md)
- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Transliteration**: [docs/TRANSLITERATION.md](docs/TRANSLITERATION.md)
- **Contributing**: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)

---

## Roadmap (Post-MVP)

🔮 **Phase 2 (Future)**:
- Multi-group support per user
- Spaced repetition & smart word resurfacing
- Pronunciation practice (voice/audio)
- Teacher rating & feedback system

🎮 **Phase 3 (Future)**:
- Gamification (XP, badges, leaderboards)
- Multi-learner groups (1 teacher, N learners)
- Mobile app (native iOS/Android)

💰 **Phase 4 (Future)**:
- Payment/subscription model
- Premium features (custom word lists, advanced analytics)
- White-label version for educators

---

## Cost Estimate (MVP)

- **Railway**: $5/mo (persistent compute)
- **Supabase**: $0 (free tier)
- **Anthropic Claude**: ~$1/mo (low volume)
- **Spare SIM**: ~₹50 one-time
- **Total**: ~$6/month

---

## License

MIT — Free to use and modify.

---

## Team

👥 **Built by**: Sandeep Ramachandran & team  
📧 **Contact**: [your-email@example.com](mailto:your-email@example.com)  
🐦 **Twitter**: [@yourhandle](https://twitter.com/yourhandle)

---

**Ready to contribute?** See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) to get started.

---

*Last updated: 30 March 2026*
