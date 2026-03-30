# Soldost — Setup & Installation Guide

Welcome to Soldost! This guide will walk you through setting up the project locally and preparing for development or deployment.

## Prerequisites

- **Node.js** ≥ 20.0.0
- **npm 10+** or **yarn 4+**
- **Spare WhatsApp number** (for bot testing)
- **Anthropic API account** with API key (~$5 monthly budget recommended)
- **Supabase account** (free tier sufficient for MVP)
- **Railway account** (for production deployment)
- **Git** for version control

## Local Development Setup

### 1. Clone Repository and Install Dependencies

```bash
git clone https://github.com/yourusername/soldost.git
cd soldost
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` and provide:

- **Supabase credentials**: Get from `https://app.supabase.com/projects`
- **Anthropic API key**: Get from `https://console.anthropic.com/account/keys`
- **WhatsApp numbers**: Your test phone numbers (learner, teacher, bot)
- **Timezone**: Set to your timezone (e.g., `Asia/Kolkata`)

### 3. Create Supabase Project

```bash
# Login to Supabase CLI
supabase login

# Link to your project (or create new)
supabase link --project-ref your-project-ref

# OR create a local Supabase instance for development
supabase start
```

### 4. Initialize Database Schema

Run migrations to set up all tables:

```bash
# Push migrations to your Supabase project
supabase push

# OR for local Supabase:
supabase db push
```

### 5. Seed Word Bank (Tamil)

```bash
npm run db:seed
```

This loads ~500 Tamil words across difficulty levels into the database.

### 6. Generate TypeScript Types

```bash
supabase gen types typescript --schema public > lib/supabase/types.ts
```

### 7. Start Development Server

```bash
npm run dev
```

The app will be available at:
- **Dashboard**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Supabase Studio** (if local): http://localhost:54323
- **Realtime Webhooks**: http://localhost:3000/webhooks

## WhatsApp Bot Setup (Testing)

### Step 1: Register a Spare WhatsApp Number

1. Get a spare SIM card (any prepaid ~₹50-100)
2. Register on WhatsApp normally (not WhatsApp Business)
3. Note the full phone number (with country code, e.g., +91XXXXXXXXXX)

### Step 2: Link Bot to Phone Number

On first run, Baileys will display a QR code in the terminal or console:

```
Scan this QR code to link WhatsApp:
[QR CODE IMAGE]
```

Use your WhatsApp app on the phone number you registered -> Settings -> Linked Devices -> Link a Device -> Scan this QR code with your phone's main WhatsApp.

The session will persist in `data/baileys/` directory.

### Step 3: Create Test WhatsApp Group

1. Create a WhatsApp group with 3 people:
   - **Learner** (test phone number)
   - **Teacher** (another test phone number)
   - **Bot** (the spare phone number you registered)

2. Start a learning session by sending `/start` in the group, or the bot will auto-detect and initiate onboarding.

## Environment Variables Reference

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| NEXT_PUBLIC_SUPABASE_URL | Yes | https://xxx.supabase.co | From Supabase project settings |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes | eyJxxx... | Public key for browser clients |
| SUPABASE_SERVICE_KEY | Yes | eyJxxx... | Secret key for server-side calls |
| ANTHROPIC_API_KEY | Yes | sk-ant-xxx | From console.anthropic.com |
| LLM_PROVIDER | No | anthropic | Default: anthropic |
| LLM_MODEL | No | claude-3-5-sonnet-20241022 | Default Sonnet model |
| WHATSAPP_SESSION_NAME | No | soldost-bot | Session identifier for Baileys |
| BOT_PHONE_NUMBER | Dev only | +91... | Bot number |
| NODE_ENV | No | development | development \| production |
| PORT | No | 3000 | Server port |
| TIMEZONE | No | Asia/Kolkata | Scheduler timezone |
| LOG_LEVEL | No | info | debug \| info \| warn \| error |
| ENABLE_BAILEYS_BOT | No | true | Enable WhatsApp bot |
| ENABLE_SCHEDULER | No | true | Enable daily scheduler |
| ENABLE_DASHBOARD | No | true | Enable Next.js dashboard |

## Troubleshooting

### Issue: "Cannot find module '@supabase/supabase-js'"

**Solution**: Run `npm install` again, or check if Node version is ≥ 20.

### Issue: Baileys QR code not showing

**Solution**:

1. Check console output: `npm run dev 2>&1 | grep -i qr`
2. Ensure `ENABLE_BAILEYS_BOT=true` in `.env.local`
3. Check if port 3000 is blocked: `lsof -i :3000`

### Issue: "Invalid phone number format"

**Solution**: Ensure phone numbers include country code (e.g., `+919876543210` for India, not just `9876543210`)

### Issue: "Supabase connection refused"

**Solution**:

- If using cloud: Check SUPABASE_URL and SUPABASE_ANON_KEY are correct
- If using local: Run `supabase start` first

### Issue: WhatsApp QR session expires

**Solution**: Restart the app (`npm run dev`). Baileys will show a new QR code. Multi-device support means the phone can be offline after initial linking.

## Database Management

### View/Manage Data

```bash
# Open Supabase Studio (local)
supabase studio

# OR visit cloud studio: https://app.supabase.com/projects/your-ref

# Reset database (WARNING: deletes all data)
npm run db:reset
```

### Create New Migration

```bash
supabase migration new migration_name
# Edit supabase/migrations/xxxxxxx_migration_name.sql
supabase db push
```

## Type Safety

Keep TypeScript types in sync with your database:

```bash
# After schema changes:
npm run db:push
npm run type-check
supabase gen types typescript --schema public > lib/supabase/types.ts
```

## Next Steps

- **Read docs/ARCHITECTURE.md** to understand system design
- **Read docs/TRANSLITERATION.md** for Tamil romanization rules
- **Check services/ directory** for bot, scheduler, and LLM code
- **Run tests**: `npm run test`
- **Format code**: `npm run format`

## Support & Issues

- **Documentation**: See `docs/` directory
- **GitHub Issues**: Report bugs in the repository
- **Slack/Discord**: Ask team questions in project chat

---

**Ready to code?** Start with Phase 3 (LLM Service) to build the AI backbone of the app.
