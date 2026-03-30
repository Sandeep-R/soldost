# Soldost — Planning Specification

## 1. Product Overview

**Product Name:** Soldost
**One-liner:** A WhatsApp-native language learning app for pairs — one teacher, one learner — powered by an AI bot that orchestrates daily structured learning loops.

**Core Concept:** A WhatsApp bot is added to a group with two people: a language teacher (proficient speaker) and a language learner. The bot orchestrates a daily learning ritual involving vocabulary delivery, sentence construction, conversational exchange, translation, and correction — creating a structured, streak-based learning experience grounded in real human interaction.

**Critical Constraint — Roman Script Only:** All text in the app — bot messages, word cards, learner sentences, teacher replies, corrections, dashboard content — must be in Roman/Latin script exclusively. No native/non-Latin script is ever displayed or stored as the primary representation. All target language content is transliterated into Roman script. This applies across WhatsApp messages and the web dashboard.

---

## 2. Users & Roles

### 2.1 Learner
- The person learning a new language.
- Receives daily vocabulary from the bot.
- Constructs sentences, attempts translations, and replies in the target language.
- Has access to a dashboard showing their full learning history.

### 2.2 Teacher
- A person proficient/native in the target language the learner is trying to learn.
- Responds to the learner's sentences in the target language, providing natural conversational replies.
- Has access to a dashboard showing the learner's progress and all learning loops.

### 2.3 Bot
- A WhatsApp bot that lives in the 3-person group chat.
- Orchestrates the daily learning loop (vocabulary delivery, turn management, corrections, streak tracking).
- Acts as the AI backbone: correcting translations, validating sentence usage, and storing all learning data.

---

## 3. Core User Flow — The Daily Learning Loop

The learning loop is the atomic unit of the product. One completed loop = one day's streak maintained.

### Step-by-step flow:

```
Step 1: BOT sends 3 words to the group
        → 1 Noun, 1 Verb, 1 Adjective
        → Each word includes: transliterated word in Roman script (NEVER in native script), meaning in learner's language, part of speech label
        → ALL text throughout the app is in Roman/Latin script only — no native script anywhere

Step 2: LEARNER constructs one sentence using at least one of the 3 words
        → Sentence is written in the target language but in Roman/Latin script (transliterated)
        → Bot validates that at least one of the day's words is used

Step 3: TEACHER replies to the learner's sentence in the target language
        → This is a natural conversational reply, not a correction
        → The reply should be contextually relevant to what the learner wrote

Step 4: LEARNER reads the teacher's reply and provides the meaning/translation
        → Learner writes what they understand the teacher's reply to mean (in their own language)

Step 5: BOT evaluates the learner's translation
        → If correct: confirms and moves to Step 6
        → If partially correct: provides correction with explanation
        → If incorrect: provides the correct meaning with explanation
        → Learner may re-attempt until the meaning is understood

Step 6: LEARNER replies to the teacher's message in the target language
        → This is the learner's attempt to respond conversationally in the target language

Step 7: BOT evaluates the learner's reply
        → Corrects grammar, vocabulary, sentence structure as needed
        → Provides the corrected version if errors exist
        → Explains what was wrong and why

Step 8: LOOP COMPLETE → Day streak incremented
        → Bot sends a confirmation message to the group
        → All data from this loop is saved
```

### Loop Completion Criteria
A loop is considered complete when ALL of the following have occurred:
1. Bot delivered 3 words
2. Learner constructed a sentence using at least one word
3. Teacher replied in the target language
4. Learner provided a translation of the teacher's reply
5. Bot evaluated the translation
6. Learner replied in the target language
7. Bot evaluated the reply

### Edge Cases to Handle
- **Teacher doesn't reply within X hours:** Bot sends a reminder to the teacher.
- **Learner doesn't start within X hours of word delivery:** Bot sends a nudge to the learner.
- **Loop started but not completed by end of day:** Define whether partial loops count, or if the streak breaks.
- **Multiple sentences by the learner:** Decide if the learner can practice more than once per day (extra credit vs. required).
- **Teacher corrects the learner directly (outside the bot flow):** Bot should still track its own evaluation independently.
- **Out-of-order messages:** The bot should handle messages that arrive in unexpected order gracefully.

---

## 4. Feature Requirements

### 4.1 WhatsApp Bot (Primary Interface)

#### 4.1.1 Group Setup & Onboarding
- Bot can be added to a WhatsApp group.
- On joining, the bot identifies the two human participants.
- Onboarding flow to configure:
  - Which user is the learner and which is the teacher.
  - What language is being learned (target language).
  - What is the learner's native/base language.
  - Preferred daily word delivery time (timezone-aware).
  - Difficulty level preference (beginner / intermediate / advanced) — affects word selection complexity.

#### 4.1.2 Daily Vocabulary Delivery
- Bot sends exactly 3 words per day at the configured time.
- Word categories: 1 noun, 1 verb, 1 adjective.
- Word card format should include:
  - Word in Roman/Latin script (transliterated — never in native script)
  - Meaning in the learner's base language (also in Roman script)
  - Part of speech label
  - Example usage sentence in Roman script (optional, configurable)
- **Script rule:** Even if the target language uses a non-Latin script (e.g., Hindi, Tamil, Japanese, Arabic), all words and sentences are represented exclusively in Roman transliteration.
- Words should be contextually progressive — avoid repeating words already learned, and optionally increase difficulty over time.
- Word selection should draw from a curated word bank appropriate to the target language and difficulty level.

#### 4.1.3 Sentence Validation
- When the learner sends a sentence, the bot should:
  - Confirm that at least one of the day's 3 words is used.
  - If no word is used, prompt the learner to include one.
  - Optionally: flag grammatical issues in the learner's sentence (configurable — some teachers may want raw attempts).

#### 4.1.4 Translation Evaluation
- When the learner provides a translation of the teacher's reply:
  - Bot compares the learner's translation against an AI-generated reference translation.
  - Provides feedback: correct, partially correct, or incorrect.
  - If incorrect, provides the correct meaning and a brief explanation.
  - Allows re-attempts.

#### 4.1.5 Reply Evaluation
- When the learner replies in the target language:
  - Bot evaluates grammar, vocabulary usage, and sentence structure.
  - Provides corrected version if errors exist.
  - Explains errors concisely.

#### 4.1.6 Streak Tracking
- Maintain a daily streak counter per learner.
- Streak increments only when a full learning loop is completed.
- Bot announces streak milestones (e.g., 7 days, 30 days, 100 days).
- Define streak break rules (e.g., loop must complete by midnight in the learner's timezone).

#### 4.1.7 Reminders & Nudges
- Configurable reminder if the learner hasn't started by a set time.
- Configurable reminder if the teacher hasn't replied within X hours of the learner's sentence.
- End-of-day warning if the loop is incomplete.

### 4.2 Learning History & Word Bank

#### 4.2.1 Word History
- Every word delivered is stored with:
  - Date delivered
  - Word, transliteration, meaning, part of speech
  - Whether it was used in the learner's sentence that day
  - Associated learning loop ID

#### 4.2.2 Sentence & Conversation History
- Every learning loop is stored as a complete record:
  - Loop ID, date, completion status
  - The 3 words delivered
  - Learner's sentence
  - Teacher's reply
  - Learner's translation attempt(s) and bot's evaluation(s)
  - Learner's target-language reply and bot's correction(s)
  - Timestamps for each step

#### 4.2.3 Spaced Repetition / Review (Future Consideration)
- Optionally resurface older words in new daily deliveries for reinforcement.
- Flag words the learner struggled with (used incorrectly, needed correction) for more frequent review.

### 4.3 Dashboard (Web Application)

#### 4.3.1 Access
- Accessible via web browser (mobile-responsive).
- Both the learner and teacher can log in and view the dashboard.
- Authentication linked to their WhatsApp identity or a separate login.

#### 4.3.2 Dashboard Views

**For the Learner:**
- Current streak count and streak history (calendar view).
- Total words learned (with searchable/filterable word bank).
- Full history of all learning loops — expandable to see full conversation.
- Progress metrics: words learned per week, loop completion rate, accuracy trends.
- Bookmarked / starred words for personal review.

**For the Teacher:**
- Learner's streak and progress overview.
- Full history of all learning loops.
- Insights: common error patterns, areas where the learner struggles.

**Shared View:**
- Timeline of all learning loops.
- Ability to click into any loop and see the full conversation thread.

---

## 5. Technical Architecture (High-Level)

### 5.1 System Components

**Stack:** Railway (hosting — bot + dashboard) + Supabase (database, auth) + Baileys (WhatsApp) + Anthropic API (LLM)

```
┌─────────────────────────────────────────────────────────┐
│                    WhatsApp (User Interface)             │
│         3-person group: Learner + Teacher + Bot          │
│         Bot = a spare SIM registered on regular WA       │
└──────────────────────────┬──────────────────────────────┘
                           │
                           │ WhatsApp Web protocol (WebSocket)
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                  Railway (~$5/mo)                         │
│              Single Node.js application                   │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐│
│  │  Baileys (WhatsApp Web Client)                       ││
│  │  - Maintains persistent WebSocket to WA servers      ││
│  │  - Receives group messages, sends replies             ││
│  │  - Session auth persisted (scan QR once)              ││
│  └──────────────────────────┬───────────────────────────┘│
│                              │                            │
│  ┌──────────────────────────┴───────────────────────────┐│
│  │  Learning Loop Engine (State Machine)                ││
│  │  - Routes incoming messages to correct loop step      ││
│  │  - State-based inference (next message = next step)   ││
│  │  - Manages loop completion and streak updates          ││
│  └──────────────────────────┬───────────────────────────┘│
│                              │                            │
│  ┌─────────────┐  ┌─────────┴────┐  ┌─────────────────┐│
│  │  LLM Service │  │  Scheduler   │  │  Next.js        ││
│  │  (Anthropic  │  │  (node-cron  │  │  Dashboard      ││
│  │   Claude,    │  │   for daily  │  │  (SSR/RSC,      ││
│  │   swappable) │  │   delivery & │  │   loop history, ││
│  │              │  │   reminders) │  │   word bank)    ││
│  └─────────────┘  └──────────────┘  └─────────────────┘│
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                  Supabase (Backend Services)              │
│                                                           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  PostgreSQL  │  │  Supabase    │  │  Row-Level      │ │
│  │  Database    │  │  Auth        │  │  Security       │ │
│  │  (All data   │  │  (Phone OTP  │  │  (Dashboard     │ │
│  │   models)    │  │   for dash)  │  │   scoping)      │ │
│  └─────────────┘  └──────────────┘  └─────────────────┘ │
│                                                           │
│  ┌─────────────┐                                         │
│  │  Realtime    │                                         │
│  │  (Live       │                                         │
│  │   dashboard  │                                         │
│  │   updates)   │                                         │
│  └─────────────┘                                         │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Stack Decisions

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Hosting** | **Railway** (~$5/mo Hobby plan) | Single deployment for the entire app: Baileys bot process, Next.js dashboard, and scheduled tasks all run in one Node.js application. Railway provides persistent compute (required for Baileys' WebSocket connection), auto-deploys from GitHub, and includes logs/monitoring. No need for a separate hosting provider for the dashboard. |
| **WhatsApp connectivity** | **Baileys** (unofficial, open-source WhatsApp Web library) | Connects to WhatsApp via the Web protocol using a spare phone number registered on regular WhatsApp (not Business). Enables real group participation — the bot is a genuine group member. No Meta business verification, no API approval, no per-message costs. QR code scan once to link; session persists across restarts. Multi-device support means the phone can be offline after initial link. |
| **Database** | **Supabase (PostgreSQL)** | Relational model fits the structured data (loops, words, users, groups). Supabase provides managed Postgres with built-in auth, row-level security, realtime subscriptions. Free tier is sufficient for MVP. |
| **Authentication** | **Supabase Auth (Phone OTP)** | Dashboard login via phone number OTP — aligns naturally with WhatsApp phone identity. No separate email/password system needed for MVP. |
| **Dashboard framework** | **Next.js (App Router)** | Server components for data-heavy pages (loop history, word bank). Runs on Railway alongside the bot process in the same app. |
| **Scheduling** | **node-cron (in-process)** | Since the app runs as a persistent process on Railway, scheduled tasks (daily word delivery, reminders, nudges) are simple in-process timers using node-cron. No external scheduler needed. The scheduler queries Supabase for groups whose delivery time has arrived (timezone-aware) and triggers word delivery. Must be idempotent — always check if delivery already happened today before sending. |
| **Realtime dashboard** | **Supabase Realtime** | Subscribe to learning loop state changes so the dashboard updates live as a loop progresses in WhatsApp. |
| **Row-level security** | **Supabase RLS policies** | Dashboard data scoping enforced at the DB level — users can only query groups they belong to. Eliminates app-level auth bugs. |
| **LLM for evaluation** | **Anthropic Claude (Sonnet) as default, behind a provider-agnostic abstraction layer** | Default provider: Claude Sonnet via Anthropic API (console.anthropic.com) — strong multilingual capability, good transliteration handling, cost-effective at low volume. **Architecture requirement:** All LLM calls must go through an abstraction layer (e.g., a unified `LLMService` interface) so the provider can be swapped (to OpenAI, open-source, etc.) by changing config/env variables without code changes. The abstraction should standardize: model selection, prompt formatting, response parsing, and error handling. |

### 5.2.1 Architecture Notes & Constraints

**Single-process architecture:** The entire app runs as one Node.js process on Railway: Baileys maintains a persistent WebSocket connection to WhatsApp servers, Next.js serves the dashboard, node-cron handles scheduled tasks, and the learning loop engine processes incoming messages. This is simpler than a multi-service architecture and sufficient for MVP scale.

**Baileys session management:** Baileys authenticates by scanning a QR code once, then persists the session credentials to disk. On Railway, these credentials should be stored in a persistent volume or backed up to Supabase so they survive redeployments. If the session is invalidated (rare — happens if the linked device is inactive for ~14 days or manually unlinked), a QR code re-scan is needed. Baileys handles reconnection automatically on transient disconnects.

**WhatsApp number setup:** Get a spare SIM card (any prepaid SIM works, ~₹50-100). Register it on regular WhatsApp (not WhatsApp Business — not required). Link Baileys to this number via QR code scan. Add this number to the learning group. The bot appears as a normal group member.

**Message-to-loop-step routing:** The bot uses a combination of state tracking and LLM-powered intent detection to map incoming messages to learning loop steps.

*State tracking:* The current loop state is stored in Supabase (e.g., `awaiting_sentence`, `awaiting_teacher_reply`, `awaiting_translation`, `awaiting_learner_reply`). The bot knows which user (learner or teacher) is expected to act next.

*Intent detection (LLM):* Every incoming message from the expected user goes through a lightweight LLM classification call to determine if it's a learning loop response or casual chat. This lets users chat naturally in the group without worrying about accidentally triggering the bot.

*Two-tier LLM approach to minimize cost/latency:*
1. **Tier 1 — Intent classification (cheap, fast):** A short, low-cost LLM call (e.g., Claude Haiku or a minimal Sonnet prompt) classifies the message: "Is this a learning loop response or casual chat?" Input: the message text + current loop state + expected step. Output: `loop` or `casual`. This call should be fast (<1s) and cost fractions of a cent.
2. **Tier 2 — Full evaluation (only if Tier 1 returns `loop`):** The standard Sonnet-based evaluation (sentence validation, translation check, grammar correction) runs only on messages classified as loop-relevant.

*Pre-filter (skip LLM entirely):* Messages that are obviously not loop responses — stickers, images without captions, voice notes, reactions, messages from the wrong user (e.g., teacher messages when awaiting learner input) — should be filtered out before reaching the LLM classification step. This avoids unnecessary API calls.

*Fallback:* If the classification is ambiguous, err on the side of processing (treat as loop response). A wrong classification that gets corrected by the evaluation step is a better UX than ignoring a genuine attempt.

**Scheduling approach for timezone-aware delivery:**

*MVP: node-cron in-process polling* — Simple, no external dependencies.
1. node-cron runs a dispatcher function every minute inside the app process.
2. Dispatcher queries Supabase: `SELECT * FROM groups WHERE daily_delivery_time <= NOW() AND NOT already_delivered_today AND is_active = true`.
3. For each matched group, trigger word delivery via Baileys.
4. Mark the group as delivered for that day.
5. **Critical:** The dispatcher must be idempotent — safe to call multiple times without duplicate deliveries. Always check `already_delivered_today` before sending.

*Scale migration: Supabase pg_cron per group* — More efficient, zero wasted invocations.
1. When a group is created or updates its delivery time, register a pg_cron job in Supabase for that group's specific delivery time.
2. pg_cron calls a webhook endpoint on the Railway app, triggering delivery for that specific group.
3. Migration path: the dispatcher function remains the same; only the trigger source changes. Both can coexist during migration since the dispatcher is idempotent.

**Supabase Realtime for dashboard:** Subscribe to `learning_loops` and `translation_attempts` tables so the dashboard reflects loop progress in near-real-time without polling.

**Supabase Auth linkage:** On first dashboard login, the user authenticates via phone OTP (Supabase Auth). The phone number is matched to their `User` record (which was created during WhatsApp onboarding). This links their WhatsApp identity to their dashboard identity without requiring a separate account.

**LLM provider abstraction:** All LLM calls (sentence validation, translation evaluation, grammar correction) must be routed through a provider-agnostic `LLMService` layer. This service should expose a standard interface (e.g., `evaluateTranslation()`, `correctGrammar()`) and handle provider-specific details (API format, auth, response parsing) internally. Switching from Claude to another provider should require only config changes (env vars for API key, model name, base URL) — no changes to the learning loop engine or bot logic. The LLM service config should be stored in environment variables:
- `LLM_PROVIDER` (e.g., "anthropic", "openai")
- `LLM_MODEL` (e.g., "claude-sonnet-4-20250514", "gpt-4o")
- `LLM_API_KEY`
- `LLM_BASE_URL` (optional, for custom endpoints or proxies like Portkey)

**Estimated monthly cost (MVP):**
- Railway Hobby plan: ~$5/mo
- Supabase Free tier: $0
- Anthropic API (Claude Sonnet, ~3 evaluations/group/day): < $1/mo at low volume
- Spare SIM card: one-time ~₹50-100
- **Total: ~$6/mo**

### 5.3 Data Model (Entity Overview for ERD Generation)

#### Core Entities

**User**
- user_id (PK)
- whatsapp_phone_number (unique)
- display_name
- base_language (the language they speak natively)
- timezone
- created_at
- updated_at

**Group**
- group_id (PK)
- whatsapp_group_id (unique)
- learner_id (FK → User)
- teacher_id (FK → User)
- target_language (the language being learned)
- base_language (the language explanations are given in)
- difficulty_level (beginner / intermediate / advanced)
- daily_delivery_time (time, timezone-aware)
- is_active (boolean)
- created_at
- updated_at

**Word**
- word_id (PK)
- language
- word_text_roman (Roman/Latin script transliteration — this is the PRIMARY and ONLY representation; no native script field)
- meaning (in base language, also in Roman script)
- part_of_speech (noun / verb / adjective)
- difficulty_level
- created_at

**DailyWordSet**
- daily_word_set_id (PK)
- group_id (FK → Group)
- date
- noun_word_id (FK → Word)
- verb_word_id (FK → Word)
- adjective_word_id (FK → Word)
- delivered_at (timestamp)
- whatsapp_message_id (for reference)

**LearningLoop**
- loop_id (PK)
- group_id (FK → Group)
- daily_word_set_id (FK → DailyWordSet)
- date
- status (pending_sentence / pending_teacher_reply / pending_translation / pending_learner_reply / completed / expired)
- streak_counted (boolean)
- started_at
- completed_at

**LearnerSentence**
- learner_sentence_id (PK)
- loop_id (FK → LearningLoop)
- sentence_text
- words_used (array of word_ids used from the daily set)
- bot_grammar_feedback (nullable — text)
- whatsapp_message_id
- created_at

**TeacherReply**
- teacher_reply_id (PK)
- loop_id (FK → LearningLoop)
- reply_text (in target language)
- whatsapp_message_id
- created_at

**TranslationAttempt**
- translation_attempt_id (PK)
- loop_id (FK → LearningLoop)
- attempt_number
- learner_translation_text
- bot_reference_translation
- evaluation_result (correct / partially_correct / incorrect)
- bot_feedback_text
- whatsapp_message_id
- created_at

**LearnerReply**
- learner_reply_id (PK)
- loop_id (FK → LearningLoop)
- reply_text (in target language)
- bot_corrected_text (nullable)
- bot_feedback_text (nullable)
- has_errors (boolean)
- whatsapp_message_id
- created_at

**Streak**
- streak_id (PK)
- group_id (FK → Group)
- current_streak (integer)
- longest_streak (integer)
- last_completed_date
- updated_at

#### Relationships Summary
- A **User** can be a learner in multiple Groups and a teacher in multiple Groups.
- A **Group** has exactly 1 learner and 1 teacher.
- A **Group** has many DailyWordSets (one per day).
- A **DailyWordSet** has exactly 3 Words (noun, verb, adjective).
- A **DailyWordSet** has exactly 1 LearningLoop.
- A **LearningLoop** has 1 LearnerSentence, 1 TeacherReply, 1+ TranslationAttempts, 1 LearnerReply.
- A **Group** has 1 Streak record.

---

## 6. State Machine — Learning Loop

The learning loop follows a strict state machine to ensure proper sequencing:

```
[IDLE]
  │
  ▼ (Scheduled time reached)
[WORDS_DELIVERED]
  │
  ▼ (Learner sends sentence with valid word)
[AWAITING_TEACHER_REPLY]
  │
  ▼ (Teacher replies in target language)
[AWAITING_TRANSLATION]
  │
  ▼ (Learner provides translation)
[EVALUATING_TRANSLATION]
  │
  ├── (Correct) ──────────────────────────────┐
  ├── (Partially correct — feedback given) ───┤
  └── (Incorrect — feedback given) ──► [AWAITING_TRANSLATION] (re-attempt)
                                              │
                                              ▼
                                   [AWAITING_LEARNER_REPLY]
                                              │
                                              ▼ (Learner replies in target language)
                                   [EVALUATING_REPLY]
                                              │
                                              ▼ (Bot provides correction/confirmation)
                                   [LOOP_COMPLETE]
                                              │
                                              ▼
                                   [STREAK_UPDATED]
```

---

## 7. Non-Functional Requirements

### 7.1 Performance
- Bot should respond to messages within 3–5 seconds.
- Dashboard should load within 2 seconds.

### 7.2 Scalability
- Design for multi-group support from day one (one user could be in multiple learning pairs).
- Word bank should be extensible per language.

### 7.3 Reliability
- Message delivery must be reliable — use WhatsApp message acknowledgment.
- Learning loop state should be persistent and recoverable (no data loss on server restart).

### 7.4 Privacy & Data
- All conversation data is stored with user consent.
- Users can request data export or deletion.
- Dashboard access is scoped — users can only see groups they belong to.

### 7.5 Internationalization & Script Policy
- The system must support any language pair (e.g., English→Tamil, Spanish→Japanese).
- **Roman script only:** All content — words, sentences, corrections, dashboard text — is rendered exclusively in Roman/Latin script. Native scripts (Devanagari, Tamil, Arabic, Kanji, etc.) are never used anywhere in the product.
- Bot messages (instructions, feedback framing) should be in the learner's base language, in Roman script.
- Word bank must store all words in Roman transliteration as the primary (and only) text representation.
- LLM prompts must be instructed to always output transliterated Roman script, never native script.
- Transliteration conventions should be consistent per language (e.g., standardized romanization for Hindi, Tamil, Japanese, Arabic, etc.). Define or adopt a transliteration standard per supported language.

---

## 8. MVP Scope (Suggested)

### In Scope for V1
- Single group support (1 learner + 1 teacher + bot).
- Daily 3-word delivery (noun, verb, adjective).
- Full learning loop (all 7 steps).
- Bot evaluation using LLM (translation check + grammar correction).
- Streak tracking (daily).
- Learning history stored in database.
- Basic web dashboard (loop history, word bank, streak display).
- Support for one language pair initially (choose based on testing — e.g., English→Hindi or English→Tamil).

### Out of Scope for V1 (Future)
- Multiple groups per user.
- Spaced repetition / smart word resurfacing.
- Gamification (XP, leaderboards, badges).
- Voice messages / pronunciation practice.
- Teacher rating / feedback on teaching quality.
- Multi-learner groups (1 teacher, N learners).
- Mobile app (native).
- Payment / subscription model.
- Word bank curation UI for teachers.

---

## 9. Open Questions for Planning Agent

These are decisions that should be resolved during PRD and ERD generation:

1. **Word bank sourcing:** ✅ RESOLVED — Pre-built word lists, seeded in the database. Curate frequency-ranked word lists per supported language upfront.
2. **Loop expiry:** What happens if a loop isn't completed by midnight? Does the streak break immediately, or is there a grace period?
3. **Re-attempt limits:** Should translation attempts have a max retry count, or unlimited?
4. **Bot personality:** Should the bot have a configurable tone (encouraging, neutral, strict)?
5. **Teacher verification:** How does the system verify that the teacher is actually proficient? Is it trust-based for MVP?
6. **WhatsApp template messages:** ✅ RESOLVED — Not applicable. Using Baileys (WhatsApp Web protocol), not the Business API. No template approval needed — the bot sends regular messages like any group member.
7. **Dashboard auth:** ✅ RESOLVED — Supabase Auth with phone OTP, linked to WhatsApp phone number.
8. **Multi-language word bank:** How are word banks structured for different target languages? Is it one global table with a language column, or separate banks per language?
9. **Message formatting:** WhatsApp supports limited formatting (bold, italic, monospace, lists). Define the exact message format for word cards, evaluations, and corrections.
10. **Timezone handling:** How to handle cases where the learner and teacher are in different timezones? Whose timezone drives the daily delivery?
11. **Transliteration standard:** Roman-script-only is mandated, but which romanization convention per language? (e.g., ISO 15919, ITRANS, Hunterian, or informal/phonetic for Hindi/Tamil). This affects word matching — the bot needs to recognize a learner's typed word against the delivered word even if transliteration varies slightly (e.g., "sundara" vs "sundhara"). Define a standard per supported language, or build fuzzy matching.
12. **Group lifecycle:** What happens when a pair wants to stop learning? Can they pause and resume? Does leaving/deleting the WhatsApp group auto-deactivate the bot? Can the same two people restart with a different language pair?
13. **Bot onboarding trigger:** How does onboarding begin? Does the bot auto-detect it's been added to a group and initiate? Does someone send a command like `/start`? Who initiates — learner, teacher, or either?
14. **Teacher reply validation:** The learner's output is validated by the bot, but what about the teacher's reply? If the teacher sends something grammatically incorrect or overly complex for the learner's level, does the bot flag it? Or is the teacher fully trusted for MVP?
15. **Out-of-context messages:** ✅ RESOLVED — LLM-powered intent detection on every message. Two-tier approach: cheap/fast classification call (loop vs. casual) followed by full evaluation only for loop-relevant messages. Pre-filter skips LLM entirely for obvious non-responses (stickers, media, wrong user). See Architecture Notes for details.
16. **Word difficulty progression:** Difficulty levels exist (beginner/intermediate/advanced), but is progression automatic (bot promotes after N successful loops) or manual (user changes the setting)? What criteria trigger a level change?
17. **Multiple loops per day:** Can a learner complete more than one loop per day for extra practice? If so, does only the first count for the streak, or do extras earn bonus credit? Does the teacher need to participate in every extra loop?
18. **Data deletion scope:** Users can request data deletion, but conversations also exist in WhatsApp (outside your control). What is the scope of deletion — just the Supabase database records? Should the bot also delete its messages in the WhatsApp group (if the API supports it)?

---

## 10. Glossary

| Term | Definition |
|------|-----------|
| **Learning Loop** | One complete cycle of the daily learning exercise (word delivery → sentence → teacher reply → translation → learner reply → corrections). The atomic unit of learning. |
| **Target Language** | The language the learner is trying to learn. |
| **Base Language** | The language the learner already speaks; used for explanations and translations. |
| **Daily Word Set** | The 3 words (noun, verb, adjective) delivered by the bot each day. |
| **Streak** | Consecutive days of completed learning loops. |
| **Teacher** | The proficient/native speaker who provides conversational replies in the target language. |
| **Learner** | The person acquiring the target language. |
| **Bot** | The AI-powered WhatsApp participant that orchestrates the loop, evaluates, and corrects. |
