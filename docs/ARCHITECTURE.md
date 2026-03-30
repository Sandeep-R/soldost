# Soldost — Architecture & Design Decisions

This document outlines the technical architecture, design patterns, and key decisions for Soldost.

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                    WhatsApp (User Interface)         │
│         3-person group: Learner + Teacher + Bot      │
│         Bot = a spare SIM registered on regular WA   │
└──────────────────────────┬──────────────────────────┘
                           │
                           │ WhatsApp Web protocol (WebSocket)
                           │
                           ▼
┌──────────────────────────────────────────────────────┐
│                  Railway (~$5/mo)                     │
│              Single Node.js application               │
│                                                       │
│  ┌──────────────────────────────────────────────────┐│
│  │  Baileys (WhatsApp Web Client)                   ││
│  │  - Maintains persistent WebSocket to WA servers  ││
│  │  - Receives group messages, sends replies         ││
│  │  - Session auth persisted (scan QR once)          ││
│  └──────────────────────────┬───────────────────────┘│
│                              │                        │
│  ┌──────────────────────────┴───────────────────────┐│
│  │  Learning Loop Engine (State Machine)            ││
│  │  - Routes incoming messages to correct loop step  ││
│  │  - State-based inference (next message = step)    ││
│  │  - Manages loop completion and streak updates     ││
│  └──────────────────────────┬───────────────────────┘│
│                              │                        │
│  ┌─────────────┐  ┌─────────┴────┐  ┌─────────────┐ │
│  │  LLM Service │  │  Scheduler   │  │  Next.js    │ │
│  │  (Anthropic  │  │  (node-cron  │  │  Dashboard  │ │
│  │   Claude)    │  │   for daily  │  │  (SSR/RSC)  │ │
│  │              │  │   delivery & │  │             │ │
│  │              │  │   reminders) │  │             │ │
│  └─────────────┘  └──────────────┘  └─────────────┘ │
└──────────────────────────┬───────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────┐
│                  Supabase (Backend)                   │
│                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  PostgreSQL  │  │  Supabase    │  │  Row-Level  │ │
│  │  Database    │  │  Auth        │  │  Security   │ │
│  │  (All data   │  │  (Phone OTP  │  │  (Dashboard │ │
│  │   models)    │  │   for dash)  │  │   scoping)  │ │
│  └─────────────┘  └──────────────┘  └─────────────┘ │
│                                                       │
│  ┌─────────────┐                                     │
│  │  Realtime    │                                     │
│  │  (Live       │                                     │
│  │   dashboard  │                                     │
│  │   updates)   │                                     │
│  └─────────────┘                                     │
└──────────────────────────────────────────────────────┘
```

## Stack Overview

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Hosting** | Railway (~$5/mo) | Single persistent deployment for Baileys bot + Next.js dashboard + scheduler. Auto-deploys from GitHub. |
| **WhatsApp Connectivity** | Baileys (unofficial WhatsApp Web) | Real group participation (not Business API). No approval needed, no per-message costs. Multi-device support. |
| **Database** | Supabase (PostgreSQL) | Managed Postgres with built-in auth, realtime subscriptions, RLS policies. Free tier sufficient for MVP. |
| **Dashboard** | Next.js (App Router) | Server components for data-heavy pages. Runs alongside bot in single process on Railway. |
| **Authentication** | Supabase Phone OTP | Dashboard login via phone number—aligns with WhatsApp phone identity. |
| **Scheduling** | node-cron (in-process) | Simple, no external services needed. Idempotent design prevents duplicate deliveries. |
| **LLM Provider** | Anthropic Claude (Sonnet) | Strong multilingual support, good transliteration handling, cost-effective. Abstracted behind provider interface for swappability. |
| **Realtime Updates** | Supabase Realtime | Subscribe to database changes for live dashboard updates. |
| **Cost (MVP)** | ~$6/mo | Railway $5 + LLM evaluation calls ~$1 + others free. |

## Core Architecture Decisions

### 1. Single-Process Design

**Decision**: Run Baileys bot + Next.js dashboard + node-cron scheduler in one Node.js process on Railway.

**Rationale**:
- Baileys requires a persistent WebSocket connection (can't be stateless)
- Scheduler needs to run continuously (not serverless)
- MVP scale doesn't require multi-service complexity
- Simpler deployment and debugging

**Trade-off**: Limited horizontal scaling. Solution: Split into separate Railway services post-MVP if needed.

### 2. Persistent Session Management (Baileys)

**Decision**: Store Baileys session credentials in `/app/data/baileys` persistent volume on Railway.

**Rationale**:
- QR code scan happens once, session persists across restarts
- Multi-device support means phone can go offline after linking
- Prevents re-authentication friction on every deploy

**Backup strategy**: Also backup session to Supabase so a human can recover if volume is lost.

### 3. State Machine for Learning Loop

**Decision**: Learning loop state stored in Supabase (`learning_loops` table), routed by simple state checks.

**Rationale**:
- Source of truth is database, not in-memory
- Survives server restarts
- Easy to debug and audit
- Room to evolve to XState pattern later if needed

**Pattern**: `IDLE` → `AWAITING_SENTENCE` → `AWAITING_TEACHER_REPLY` → ... → `COMPLETED`

### 4. Two-Tier LLM Evaluation

**Decision**: Cheap/fast intent classification before expensive full evaluation.

**Rationale**:
- Users chat naturally in group; avoid parsing every message with LLM
- Tier 1 (Haiku or minimal prompt): "Is this a learning loop response?" (~0.0001 cost)
- Tier 2 (Sonnet): Full evaluation if Tier 1 → loop response
- Pre-filters skip LLM entirely for stickers, images, wrong user

**Result**: ~3x cost savings on LLM calls vs. naïve approach.

### 5. Roman Script Only

**Decision**: All text (words, sentences, feedback, dashboard) rendered in Roman/Latin script exclusively.

**Rationale**:
- Platform independent (all devices use ASCII/Latin)
- User-friendly for learners typing on English keyboards
- Consistent with spec requirement
- Allows phonetic transliteration of any script

**Implementation**:
- Word bank stores `word_text_roman` as primary (no `word_text_native` field)
- LLM prompts include: "Always respond in Roman/Latin script only"  
- Frontend always renders Roman text; never native script
- Informal/casual transliteration (phonetic, not strict ISO standard)

### 6. LLM Provider Abstraction

**Decision**: All LLM calls route through a provider-agnostic `LLMService` interface.

**Rationale**:
- Easy to swap providers (Anthropic → OpenAI, etc.)
- Consistent token counting, cost logging, error handling
- No scattered LLM calls throughout codebase

**Pattern**:
```typescript
interface LLMProvider {
  evaluateTranslation(...)
  correctGrammar(...)
  isLearningLoopResponse(...)
}
```

**Configuration**: Via environment variables (`LLM_PROVIDER`, `LLM_MODEL`, `LLM_API_KEY`)

## Data Model

### Core Tables

**users** — Authenticated users with WhatsApp identity
**groups** — 3-person learning pairs (1 learner + 1 teacher)
**words** — Word bank for all languages/difficulties
**daily_word_sets** — 3 words delivered each day per group
**learning_loops** — Daily learning session state machine
**learner_sentences** — Learner's practice sentence (step 2)
**teacher_replies** — Teacher's conversational reply (step 3)
**translation_attempts** — Learner's translation + bot evaluation (step 4)
**learner_replies** — Learner's reply in target language (step 6)
**streaks** — Daily streak tracking per group

### Row-Level Security (RLS)

All tables have RLS enabled. Users can only access groups they belong to (learner_id or teacher_id). Policies cascade through foreign keys so users automatically see related learning data.

## Learning Loop State Machine

```
IDLE (group created, onboarding complete)
  ↓
AWAITING_SENTENCE (bot sent 3 words, waiting for learner sentence)
  • Pre-filter: ignore messages from teacher, stickers, etc.
  • Intent check: Is this a sentence attempt? (LLM Tier 1)
  • Validation: Does sentence use ≥1 of the 3 words?
  • Optional: Grammar feedback (LLM Tier 2)
  ↓
AWAITING_TEACHER_REPLY (learner submitted, waiting for teacher response)
  • Reminder if ≥4 hours pass without teacher reply
  • Teacher sends conversational reply in target language
  ↓
AWAITING_TRANSLATION (teacher replied, learner translates to base language)
  • Learner provides meaning/translation of teacher's reply
  • Option: Re-attempt if wrong (up to 3 times default)
  ↓ (after correct/partial translation)
AWAITING_LEARNER_REPLY (learner replies in target language)
  • Learner attempts conversational response in target language
  ↓
EVALUATING_REPLY (bot checks grammar/structure)
  • LLM evaluates for errors
  • Bot provides correction or confirmation
  ↓
COMPLETED (loop finished, streak incremented)
  • Streak updated in `streaks` table
  • Milestone notification if streak = 7, 30, 100, etc.
  • End-of-day confirmation message
  ↓
IDLE (next day, loop repeats)
```

## Message Routing & Intent Detection

```
Incoming WhatsApp Message
  ↓
[Pre-Filter] Media, reactions, stickers?
  → Log & ignore (no LLM call)
  ↓ (plain text)
[Context Check] Is sender expected for current loop state?
  → If teacher expected but learner sent → ask for clarification
  ↓ (correct sender)
[Tier 1 LLM] Intent classification (cheap)
  → Is this a learning loop response or casual chat?
  → Prompt: "Given the current loop state and message, classify: LOOP or CASUAL"
  ↓ (CASUAL)
  → Log message, optionally send friendly acknowledgment
  ↓ (LOOP)
[Tier 2 LLM + Handler] Full evaluation
  → Route to appropriate step handler (sentence, translation, reply)
  → Evaluate, provide feedback, update state
  ↓
Update `learning_loops` state in Supabase
  ↓
Send WhatsApp response
```

## Scheduling: Daily Word Delivery

```
1️⃣ node-cron runs every minute (in-process)
   
2️⃣ Dispatcher query:
   SELECT * FROM groups 
   WHERE daily_delivery_time <= NOW() 
   AND is_active = true 
   AND NOT delivered_today
   
3️⃣ For each matched group:
   • Select 3 words (noun, verb, adj) filtered by difficulty
   • Avoid words from last 30 days (query daily_word_sets history)
   • Insert DailyWordSet record
   • Format word card message
   • Send via Baileys
   • Mark delivered_today flag
   
4️⃣ Idempotency check (avoid duplicates):
   Always verify "not delivered_today" before sending
   Safe to call multiple times
   
❌ Future: Migrate to Supabase pg_cron for per-group precision
   (Currently adequate; node-cron runs every group through check)
```

## API Routes Strategy

**Learning Loop**: Managed via Baileys WebSocket (messages), not HTTP routes
**Dashboard**: Query Supabase directly via Supabase JS client (RLS enforced)
**Health Check**: `GET /api/health` for Railway monitoring
**Webhooks**: `POST /api/webhooks/whatsapp` (stub for future pg_cron integration)

No proprietary API needed; trust Supabase's security model and RLS policies.

## Cost Model

**Monthly Estimate (MVP)**:
- Railway: $5 (Hobby plan, persistent compute)
- Supabase: $0 (free tier adequate)
- Anthropic Claude Sonnet: ~$1 (3 evals/group/day, low volume)
- Spare SIM: ~₹50 one-time
- **Total**: ~$6/month

**Cost Drivers**:
- LLM evaluations: ~1500-2000 calls/month per active group @ $0.003-0.01 per call
- Can reduce by 3x with intent classification (avoids parsing every message)

## Security Model

**Authentication**:
- Supabase Phone OTP (SMS-based)
- Links WhatsApp phone number to dashboard identity
- JWT tokens for session

**Authorization**:
- Row-Level Security (RLS) on all tables
- Database-level enforcement (not app-level)
- Users see only groups they belong to

**Data Privacy**:
- No sensitive data in WhatsApp (bot doesn't expose secrets)
- HTTPS/TLS for all Supabase connections
- Encrypted credentials on disk (Baileys session)

## Observability & Logging

**Logging**:
- Pino for structured JSON logs
- Log level configurable (debug, info, warn, error)
- LLM calls logged to `llm_calls_log` table for cost tracking

**Monitoring (Future)**:
- Sentry for error tracking
- Datadog/CloudWatch for performance metrics
- Dashboard: Manual weekly check of logs and error rates

## Scalability Notes

**Current (MVP)**: Single Railway dyno, all-in-one process

**Phase 2 (if needed)**:
- Split Baileys bot to separate Railway service (can scale replicas)
- Keep scheduler in main process or move to separate dyno
- Separate Next.js dashboard service
- All share Supabase (scales separately)

**Phase 3 (future)**:
- Use Railway job runtime for one-off batch tasks (word reseeding, etc.)
- Implement message queue (Bull + Redis) for large volumes
- Multi-provider LLM fallback (if Anthropic unavailable)

## Trade-offs & Constraints

| Decision | Benefit | Constraint |
|----------|---------|-----------|
| **Baileys (unofficial)** | No approval needed, costs $0 | WhatsApp can ban connections; session may expire |
| **Roman script only** | Platform agnostic, simple | Might lose nuance vs. native script learning |
| **Single-process** | Simple, no inter-service complexity | Vertical scaling limits; all components restart together |
| **Informal transliteration** | User-friendly, fast typing | Not ISO-compliant; may conflict with academic standards |
| **node-cron** | Zero external dependencies | All groups re-checked every minute (minor overhead) |
| **LLM abstraction** | Easy provider swap | Extra abstraction layer (minimal perf cost) |

---

**Next**: Read `docs/TRANSLITERATION.md` for Tamil romanization specifics.
