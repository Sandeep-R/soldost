# Soldost — Implementation Phases & Roadmap

This file provides a detailed breakdown of each implementation phase with specific tasks, checkpoints, and owner suggestions.

## Overview Timeline

```
Phase 1-2: Week 1      Setup & Database
Phase 3-4: Week 2      LLM & Transliteration
Phase 5-6: Week 2-3    Bot & Loop Engine (parallel)
Phase 7:   Week 4-5    Dashboard (parallel with Phase 6)
Phase 8-9: Week 5      APIs & Server
Phase 10:  Week 6      Testing
Phase 11:  Week 6      Docs & Deploy
Phase 12:  Week 6-7    Beta & Iterate
```

**For 2-3 person team with parallelization: 6-8 weeks to MVP**

---

## Phase 1: Project Setup & Infrastructure (Week 1)

**Owner**: 1 person (can be parallelized with 1.2-1.4)

### 1.1 Repository & Project Structure ✅ COMPLETED
- [x] Create GitHub repository
- [x] Initialize `package.json` with core dependencies
- [x] Create `.gitignore`, `.env.example`, config files
- [x] Setup TypeScript config (`tsconfig.json`)
- [x] Setup ESLint, Prettier, Next.js config

**Deliverables**:
- GitHub repo with clean structure
- All config files in place
- Team can run `npm install` without errors

### 1.2 Anthropic Account Setup
- **Action**: Create account at https://console.anthropic.com
- **Get**: API key with budget allocation (~$5/month)
- **Store**: In `.env.local` as `ANTHROPIC_API_KEY`
- **Verify**: Can make test API call

**Owner concern**: Budget setup, rate limits

### 1.3 Supabase Project Setup
- **Action**: Create Supabase project (free tier)
- **Config**: Enable phone SMS provider (Twilio or MessageBird)
- **Get**: Project URL, anon key, service role key
- **Store**: In `.env.local`
- **Generate**: TypeScript types with `supabase gen types typescript`

**Owner**: 1 person, ~45 min

### 1.4 Railway Project Setup
- **Action**: Create Railway project
- **Config**: Add environment variables as secrets
- **Mount**: Persistent volume at `/app/data/baileys` for Baileys session
- **Link**: GitHub repo for auto-deploy on push
- **Health check**: Configure Railway to ping `/api/health`

**Owner**: 1 person, ~30 min

**Checkpoint**: App structure ready, can run `npm run dev` locally

---

## Phase 2: Database Schema & Data Models (Week 1-2)

**Owner**: 1 person

### 2.1 Create Supabase Schema ✅ COMPLETED
SQL migration file with:
- [ ] 11 tables (users, groups, words, daily_word_sets, learning_loops, learner_sentences, teacher_replies, translation_attempts, learner_replies, streaks, llm_calls_log)
- [x] Foreign keys and constraints
- [x] Row-Level Security (RLS) policies
- [x] Indexes for performance
- [x] Auto-update triggers

**Execute**: `supabase db push`

**Test**: Verify all tables created, RLS policies working

### 2.2 Word Bank Seeding ✅ COMPLETED
- [x] Create `db/seeds/tamil-word-bank.sql` with ~500 Tamil words
- [ ] 50-70 beginner nouns, verbs, adjectives
- [ ] 100+ intermediate words
- [ ] 50+ advanced words
- [ ] All in Roman/Latin script (no native Tamil)
- [ ] Include meanings in English, part of speech, examples

**Execute**: `npm run db:seed`

**Test**: Query words table, verify count and format

### 2.3 Entity Relationships Validation
- [ ] Query and verify foreign key relationships work
- [ ] Test RLS policies (user can only see their groups)
- [ ] Simulate group creation flow

**Checkpoint**: Database ready, team can query data, RLS enforced

---

## Phase 3: LLM Service & Provider Abstraction (Week 2)

**Owner**: 1 person

### 3.1 LLM Interface Definition ✅ COMPLETED (as stubs)
- [x] Create `lib/llm/types.ts` with interface:
  - `evaluateTranslation()`
  - `correctGrammar()`
  - `generateReferenceMeaning()`
  - `isLearningLoopResponse()`
  - `countTokens()`

### 3.2 Anthropic Claude Adapter
- [ ] Create `lib/llm/anthropic-adapter.ts`
- [ ] Implement all interface methods
- [ ] Use `@anthropic-ai/sdk`
- [ ] Configure for Tamil language
- [ ] Enforce Roman-script-only in prompts
- [ ] Implement token counting
- [ ] Add retry logic (3 retries, exponential backoff)
- [ ] Add logging/telemetry

**Test cases**:
- [ ] Translate correct Tamil sentence → "correct" result
- [ ] Translate incorrect translation → "incorrect" with feedback
- [ ] Check grammar of learner sentence → returns corrected text or "no errors"
- [ ] Intent detection: distinguish loop response from casual chat

### 3.3 LLM Service Facade
- [ ] Create `services/llm-service.ts`
- [ ] Factory pattern to create providers based on `LLM_PROVIDER` env
- [ ] Unified error handling and logging
- [ ] Cache repeated translations
- [ ] Log all calls to Supabase `llm_calls_log` table
- [ ] Graceful degradation if LLM fails

**Test cases**:
- [ ] Can switch providers via env var (anthropic → openai)
- [ ] Cost logging works
- [ ] Error handling doesn't crash app
- [ ] Caching prevents duplicate API calls

### 3.4 Unit Tests
- [ ] Create `services/__tests__/llm-service.test.ts`
- [ ] Mock Anthropic SDK responses
- [ ] Test happy path and error scenarios
- [ ] Verify Roman-script enforcement in outputs

**Checkpoint**: LLM fully functional, all evaluations working, costs logged

---

## Phase 4: Transliteration & Tamil Utilities (Week 2)

**Owner**: 1 person (can overlap with Phase 3)

### 4.1 Tamil Transliteration Wrapper
- [ ] Create `lib/transliteration/tamil-utils.ts`
- [ ] Function `romanizeTamil(nativeTamilText): string`
  - Use `transliteration` NPM package
- [ ] Function `recognizeTamilWord(userInputRoman, expectedWordRoman): boolean`
  - Fuzzy matching for typos
  - Allow 1-2 character difference (use Levenshtein distance)
  - Handle common Tamil transliteration variations (e.g., "sundara" vs "sundhara")
- [ ] Caching for repeated romanizations

**Test cases**:
- [ ] Tamil script → Roman (e.g., கதை → "kathai")
- [ ] Typo tolerance: "kathai" ≈ "kattai" (allow)
- [ ] Fuzzy match threshold works

### 4.2 Tamil Constants & Rules
- [ ] Create `lib/constants/tamil.ts`
- [ ] Tamil character set validation
- [ ] Common translit variations map
- [ ] Phonetic rules for learning

**Test cases**:
- [ ] Learner types "katai" (missing 'h'), system recognizes it as "kathai"
- [ ] System validates Tamil words correctly

### 4.3 Unit Tests
- [ ] Create `lib/transliteration/__tests__/tamil-utils.test.ts`
- [ ] Test romanization edge cases
- [ ] Test fuzzy matching thresholds

**Checkpoint**: Tamil word matching working, typo tolerance tested

---

## Phase 5: Baileys WhatsApp Bot (Week 2-3)

**Owner**: 1-2 people (complex coordination)

### 5.1 Baileys Client Initialization
- [ ] Create `lib/whatsapp/baileys-client.ts`
- [ ] Initialize Baileys with persistent session store
- [ ] Session directory: `/app/data/baileys`
- [ ] Auto-reconnect logic (exponential backoff)
- [ ] Health check endpoint
- [ ] Error handling for credential expiry
- [ ] Log levels (debug in dev, info in prod)

**Test**: 
- [ ] QR code displays on first run
- [ ] Session persists across restarts
- [ ] Auto-reconnect works
- [ ] Can send message to test group

### 5.2 Message Handler & Routing
- [ ] Create `lib/whatsapp/message-handler.ts`
- [ ] Entry point: `handleIncomingMessage(msg)`
- [ ] Pre-filter: ignore stickers, reactions, media without text, old messages
- [ ] Context validation: is sender expected for current loop state?
- [ ] Tier 1 LLM: Intent classification (loop response vs casual)
- [ ] Route to learning loop engine if loop response
- [ ] Error handling per message type

**Test**:
- [ ] Bot ignores stickers/images
- [ ] Bot routes correct messages to loop engine
- [ ] Bot logs and ignores casual messages

### 5.3 Group Onboarding Flow
- [ ] Create `services/group-onboarding.ts`
- [ ] Trigger: Bot added to 3-person group
- [ ] Sequence (sequential messages):
  1. "Hi! I'm Soldost..."
  2. "Who is the learner?"
  3. "Who is the teacher?"
  4. "What language?"
  5. "Daily delivery time?"
  6. "Difficulty level?"
- [ ] State tracking: `groups.status = 'onboarding'`
- [ ] Validation: learner ≠ teacher, valid language, valid time
- [ ] Completion: create group, set `is_active = true`

**Test**:
- [ ] Onboarding flow completes successfully
- [ ] Group created in database
- [ ] Learner/teacher roles assigned correctly

### 5.4 Daily Word Delivery Scheduler
- [ ] Create `services/scheduler.ts` (stub in Phase 9, base structure here)
- [ ] node-cron runs every minute
- [ ] Query: groups with delivery time reached, not delivered today
- [ ] Word selection: 3 words (noun, verb, adj), avoid repeats, match difficulty
- [ ] Format to WhatsApp message
- [ ] Send via Baileys
- [ ] Mark delivered, log timestamp

**Test**:
- [ ] Words delivered at configured time
- [ ] No duplicate deliveries
- [ ] Correct difficulty level
- [ ] No repeats from last 30 days

### 5.5 Message Formatters
- [ ] Create `lib/whatsapp/formatters.ts`
- [ ] `formatWordCard()` — nicely formatted word card
- [ ] Standard formatting for all bot messages
- [ ] Use WhatsApp formatting (bold, lists, etc.)

**Example output**:
```
📚 *Your 3 words for today:*

1️⃣ *Kathai* (Story)
   • Part of speech: Noun
   • Example: "Athan ennum kathai romba vasthuppi."

2️⃣ *Sollun* (Says/tells)
   • Part of speech: Verb

3️⃣ *Sundaram* (Beautiful)
   • Part of speech: Adjective

→ Now construct a sentence...
```

**Checkpoint**: Bot fully operational, words delivered daily, onboarding works

---

## Phase 6: Learning Loop State Machine & Engine (Week 3-4)

**Owner**: 1 person (complex state management)

### 6.1 Learning Loop State Machine
- [ ] Create `lib/state-machine/learning-loop.machine.ts`
- [ ] Define states: `idle`, `awaiting_sentence`, `awaiting_teacher_reply`, `awaiting_translation`, `evaluating_translation`, `awaiting_learner_reply`, `evaluating_reply`, `completed`
- [ ] Context: loopId, groupId, learnerPhone, teacherPhone, dailyWords, state
- [ ] Events: `sentence_received`, `teacher_reply_received`, `translation_submitted`, etc.
- [ ] Guards: only learner sends sentence, only teacher replies, etc.
- [ ] Actions: persist state, send WhatsApp responses

### 6.2 Learning Loop Engine Implementation
- [ ] Create `services/learning-loop-engine.ts` (stub in Phase 6, full implementation here)
- [ ] Main method: `processMessage(message, sender_role, group_id, loop_id)`
- [ ] Step handlers:
  1. `handleLearnerSentence()` — validate word use, store, optional grammar feedback
  2. `handleTeacherReply()` — store reply, ask learner to translate
  3. `handleTranslationAttempt()` — evaluate, allow re-attempts
  4. `handleLearnerReply()` — check grammar, confirm or correct

**Test cases**:
- [ ] Full loop completes successfully (5-7 message exchanges)
- [ ] Grammar feedback provided correctly
- [ ] Translation evaluation accurate
- [ ] State persists across server restarts
- [ ] Out-of-order messages handled gracefully

### 6.3 Streak Management
- [ ] Create `lib/streak/streak-manager.ts`
- [ ] `completeLoop(groupId)` — increment current_streak, update longest, update last_completed_date
- [ ] `checkStreakBreak(groupId)` — if last_completed_date < today, reset current_streak
- [ ] Milestone notifications: 7, 30, 100, 365 day messages
- [ ] Grace period logic (e.g., complete by 3 AM next day)

**Test cases**:
- [ ] Streak increments on loop completion
- [ ] Streak breaks if missed day
- [ ] Milestone messages sent correct
- [ ] Longest streak tracked

### 6.4 Integration Tests
- [ ] Create `services/__tests__/learning-loop-engine.test.ts`
- [ ] Mock Supabase queries
- [ ] Simulate full loop: sentence → teacher reply → translation → learner reply
- [ ] Test edge cases: wrong user, re-attempts, missing steps

**Checkpoint**: Complete learning loop operational, streak tracking works, state persists

---

## Phase 7: Next.js Dashboard (Week 4-5)

**Owner**: 2 people (design + implementation, can happen in parallel with Phase 6)

### 7.1 Dashboard Authentication
- [ ] Create `app/(auth)/login/page.tsx`
- [ ] Phone number input form
- [ ] OTP submission form
- [ ] Link to Supabase phone OTP
- [ ] Redirect to `/dashboard` on success
- [ ] Remember authentication state

**Test**: Can login with valid phone number

### 7.2 Dashboard Layout & Navigation
- [ ] Create `app/(dashboard)/layout.tsx`
- [ ] Sidebar: Streak, Word Bank, History, Settings
- [ ] Header: Profile info, logout
- [ ] Responsive design (mobile + desktop)

### 7.3 Streak View
- [ ] Create `app/(dashboard)/streak/page.tsx`
- [ ] Display current streak + longest streak
- [ ] Calendar heatmap (90 days, green = completed)
- [ ] Milestone celebration if streak hit 10, 30, 100
- [ ] Data: query `streaks` + `learning_loops` for completed dates

**Components needed**:
- Streak counter card
- Calendar heatmap (can use library like `react-calendar-heatmap`)
- Milestone badge

### 7.4 Word Bank View
- [ ] Create `app/(dashboard)/words/page.tsx`
- [ ] Searchable/filterable table of all learner's words
- [ ] Columns: Word (Roman), Meaning, Part of speech, Difficulty, Date learned
- [ ] Filters: difficulty, part of speech, date range
- [ ] Star/bookmark functionality (store in simple `starred_words` table)
- [ ] Data: query `daily_word_sets` joined with `words`

**Components needed**:
- Search + filter controls
- Word table with pagination
- Star button per row

### 7.5 Learning Loop History
- [ ] Create `app/(dashboard)/history/page.tsx`
- [ ] Expandable timeline of all loops
- [ ] Loop card: date, status, streak count at that date
- [ ] Expand → see full conversation:
  - Words delivered
  - Learner's sentence + bot's feedback
  - Teacher's reply
  - Learner's translation + bot's evaluation
  - Learner's reply + bot's correction
- [ ] Data: query `learning_loops` with all related records

**Components needed**:
- Loop card (collapsed view)
- Loop detail modal/expandable panel
- Message thread display

### 7.6 Teacher Insights (Optional for MVP)
- [ ] Create `app/(dashboard)/teacher-insights/page.tsx` (visible only to teacher)
- [ ] Learner's overview: streak, total words, completion rate
- [ ] Common error patterns: most frequent mistakes, weak areas
- [ ] Data: aggregate from `translation_attempts`, `learner_replies`

### 7.7 Settings Page
- [ ] Create `app/(dashboard)/settings/page.tsx`
- [ ] View/edit: language pair, difficulty, delivery time
- [ ] Data export (JSON of all learning history)
- [ ] Delete account (grace period before hard-delete)

**Checkpoint**: Full dashboard functional, all views load, data displays correctly

---

## Phase 8: API Routes & Backend Integration (Week 5)

**Owner**: 1 person

### 8.1 Health Check Endpoint ✅ COMPLETED (in server.ts)
- [x] `GET /api/health` returns status + component health

### 8.2 Learning Loop API (Internal)
- [ ] `POST /api/learning-loop/message` — receive WhatsApp message
  - Extract sender, message, group info
  - Call learning loop engine
  - Return WhatsApp response

### 8.3 Webhook Stub
- [ ] Create `app/api/webhooks/whatsapp/route.ts`
- [ ] Stub for future Supabase pg_cron integration
- [ ] For now, accepts scheduled word delivery triggers

**Checkpoint**: API routes working, webhook structure in place

---

## Phase 9: Server Configuration & Entry Point (Week 5)

**Owner**: 1 person

### 9.1 Complete Scheduler Implementation
- [ ] Implement `services/scheduler.ts` fully
- [ ] node-cron every minute dispatcher
- [ ] Word delivery, reminders, streak checks
- [ ] Idempotent design (safe to run multiple times)
- [ ] Logging and telemetry

### 9.2 Application Entry Point
- [ ] Complete `app/server.ts`
- [ ] Initialize Baileys bot
- [ ] Start scheduler
- [ ] Mount Next.js handler
- [ ] Graceful shutdown

**Test**: App starts without errors, bot connects, scheduler runs

### 9.3 Build & Start Scripts
- [ ] `npm run dev` — dev mode with hot reload
- [ ] `npm run build` — production build
- [ ] `npm start` — run production build
- [ ] Verify no errors in build logs

**Checkpoint**: App fully deployable, all components integrated

---

## Phase 10: Testing & QA (Week 6)

**Owner**: 2-3 people (parallel)

### 10.1 Unit Tests
- [ ] LLM service (mocked API calls)
- [ ] Transliteration utils (Tamil word matching)
- [ ] Streak manager (streak logic)
- [ ] State machine transitions
- Target: 70%+ coverage on services

**Command**: `npm run test -- --run --coverage`

### 10.2 Integration Tests
- [ ] Full learning loop simulation (5-7 messages)
- [ ] Group onboarding flow
- [ ] Daily word delivery scheduler
- [ ] Streak calculation

**Test framework**: Vitest with mocked Supabase

### 10.3 Manual E2E Testing
- [ ] Create real WhatsApp group (your phone + test bot)
- [ ] Run full learning loop:
  1. Add bot to group
  2. Complete onboarding
  3. Receive words
  4. Submit sentence → teacher reply → translation → learner reply
  5. Verify bot evaluations + streak update
  6. Check dashboard reflects all data
- [ ] Test edge cases:
  - Wrong user messages (teacher when learner expected)
  - Incomplete loops (don't complete by midnight)
  - Typos in Tamil words
  - LLM latency (should be 3-5 sec)
  - Dashboard performance (should load < 2 sec)

### 10.4 Performance Testing
- [ ] LLM latency: target 3-5 sec per evaluation ✅
- [ ] Dashboard load time: target 2 sec ✅
- [ ] Bot message latency: target 1-2 sec acknowledgment ✅
- [ ] Load testing (optional): 10 concurrent groups

**Checkpoint**: All major features tested, edge cases handled, performance targets met

---

## Phase 11: Documentation & Deployment (Week 6)

**Owner**: 1 person

### 11.1 Documentation ✅ COMPLETED (mostly)
- [x] `docs/SETUP.md` — local dev setup + troubleshooting
- [x] `docs/ARCHITECTURE.md` — system design + decisions
- [x] `docs/CONTRIBUTING.md` — code standards + PR workflow
- [ ] `docs/TRANSLITERATION.md` — Tamil rules (expand)
- [ ] `docs/API.md` — endpoint reference
- [ ] GitHub README (how to run locally)

### 11.2 Environment Configuration
- [ ] Finalize all `.env.example` variables
- [ ] Document each variable's purpose
- [ ] Create Railway secrets
- [ ] Test production env var loading

### 11.3 Supabase Finalization
- [ ] Verify RLS policies are correct
- [ ] Set up phone SMS provider for OTP
- [ ] Test auth flow end-to-end
- [ ] Backup procedures documented

### 11.4 Deploy to Railway
- [ ] Link GitHub repo to Railway (auto-deploy on main push)
- [ ] Create persistent volume for Baileys session
- [ ] Set environment variables as secrets
- [ ] Run first deployment
- [ ] Monitor logs for errors
- [ ] Test `/api/health` endpoint

**Checkpoint**: App deployed to production, accessible at live URL

---

## Phase 12: Beta Testing & Iteration (Week 6-7)

**Owner**: Whole team

### 12.1 Real-World Testing
- [ ] Invite first pair (learner + teacher) to production group
- [ ] Run 2 weeks of live use
- [ ] Collect feedback: ease of use, bot accuracy, dashboard usability
- [ ] Track bugs and feature requests

### 12.2 Bug Fixes & Refinements
- [ ] Fix critical bugs (session expiry, evaluation errors)
- [ ] Refine LLM prompts based on output quality
- [ ] Adjust transliteration fuzzy matching thresholds
- [ ] Improve dashboard UX based on usage

### 12.3 Prepare for Next Cohort
- [ ] Document lessons learned
- [ ] Update setup guides with new troubleshooting
- [ ] Plan Phase 2 features (multi-group, spaced repetition)

**Checkpoint**: App stable, first users happy, ready for broader rollout

---

## Cross-Phase Considerations

### Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Database) ← prerequisite for all
    ↓
├─ Phase 3 (LLM) → Phase 6 (uses LLM)
├─ Phase 4 (Transliteration) → Phase 5 (uses for matching)
├─ Phase 5 (Bot) → Phase 6 (routes to loop engine)
├─ Phase 6 (Loop Engine) → Phase 7 (dashboard displays)
├─ Phase 7 (Dashboard)
│
└─ Phase 8-9 (APIs + Server) → Phase 11 (deployment)
    ↓
Phase 10 (Testing)
    ↓
Phase 11 (Docs + Deploy)
    ↓
Phase 12 (Beta)
```

### Parallelization Strategy

**Week 1-2 (Solo or 1 person)**:
- Developer A: Phase 1-2 (setup + database)

**Week 2 (Team of 2-3)**:
- Developer A: Phase 3 (LLM)
- Developer B: Phase 4 (Transliteration)
- Developer C: Phase 5 (Baileys bot prep)

**Week 2-3 (Team of 2-3)**:
- Developer A: Phase 5-6 (Baileys + loop engine)
- Developer B: Phase 7 (Dashboard)
- Developer C: Phase 4 finalization + Phase 6 support

**Week 5-6 (Full team)**:
- Developer A: Phase 8-9 (APIs + server)
- Developer B+C: Phase 10 (Testing + Phase 11 docs)

---

## Success Metrics (Define Before Starting)

- [ ] Bot responds to messages in < 5 sec
- [ ] Dashboard loads in < 2 sec
- [ ] 1 complete learning loop takes 5-10 min (multi-step)
- [ ] Streak tracking accurate (no off-by-one errors)
- [ ] Tamil word matching handles typos (1-2 char diff)
- [ ] Zero data loss on server restart
- [ ] All RLS policies prevent cross-group data leaks
- [ ] Team can onboard new developer in < 2 hours (via SETUP.md)

---

**Next**: Pick a phase, assign to team member, and start coding! 🚀
