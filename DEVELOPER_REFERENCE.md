# Soldost — Developer Quick Reference

**Quick navigation for common tasks**

---

## 🚀 Quick Start (5 min)

```bash
# Setup
git clone https://github.com/yourusername/soldost.git
cd soldost
npm install
cp .env.example .env.local
# Edit .env.local with your credentials

# Initialize database
supabase link --project-ref <your-ref>
supabase db push
npm run db:seed

# Run
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure at a Glance

```
app/                    # Next.js App Router
├── (auth)/LoginPage    # Phone OTP login
├── (dashboard)/        # Learner/teacher views
├── api/                # API routes
└── server.ts           # Entry point (Baileys + scheduler)

lib/                    # Shared utilities
├── config/env.ts       # Environment validation (Zod)
├── config/logger.ts    # Pino logging
├── llm/types.ts        # LLM provider interface
├── supabase/           # Client + types
└── transliteration/    # Tamil utils

services/               # Business logic
├── llm-service.ts      # LLM facade
├── learning-loop-engine.ts  # State machine
└── scheduler.ts        # Daily tasks

db/                     # Database
├── migrations/         # SQL schema
└── seeds/             # Word bank data

docs/                   # Documentation
├── SETUP.md            # Local dev setup
├── ARCHITECTURE.md     # System design
└── CONTRIBUTING.md     # Code standards

supabase/               # Supabase config
└── migrations/         # Schema definitions
```

---

## 🔄 Common Workflows

### Add a New Environment Variable

1. Add to `.env.example`:
   ```
   MY_NEW_VAR=default_value
   ```

2. Update `lib/config/env.ts`:
   ```typescript
   MY_NEW_VAR: z.string().default('default_value'),
   ```

3. Use in code:
   ```typescript
   import { env } from '@/lib/config/env';
   console.log(env.MY_NEW_VAR);
   ```

### Create a Database Migration

```bash
supabase migration new add_new_feature
# Edit supabase/migrations/xxxxxxx_add_new_feature.sql
supabase db push
```

### Regenerate TypeScript Types from Database

```bash
supabase gen types typescript --schema public > lib/supabase/types.ts
npm run type-check
```

### Add a New Page to Dashboard

1. Create file: `app/(dashboard)/my-page/page.tsx`
2. Query Supabase (server component):
   ```typescript
   import { createClient } from '@/lib/supabase/server';
   
   export default async function MyPage() {
     const supabase = await createClient();
     const { data } = await supabase
       .from('your_table')
       .select('*');
     return <div>{JSON.stringify(data)}</div>;
   }
   ```

### Test a Service

```bash
npm run test -- services/my-service.test.ts --watch
```

### View Database in Supabase Studio

```bash
supabase studio  # or visit https://app.supabase.com/projects/your-ref
```

---

## 📚 Key Patterns

### LLM Provider Pattern (Phase 3)

```typescript
// Interface
interface LLMProvider {
  evaluateTranslation(...): Promise<TranslationEvaluation>;
  correctGrammar(...): Promise<GrammarCorrection>;
}

// Implementation
class AnthropicAdapter implements LLMProvider { ... }

// Usage
const provider = createLLMProvider('anthropic');
const result = await provider.evaluateTranslation(...);
```

### State Machine Pattern (Phase 6)

```typescript
// States: 'idle' → 'awaiting_sentence' → 'awaiting_teacher_reply' → ...
// Stored in Supabase: learning_loops.status

// Process message:
const loop = await supabase
  .from('learning_loops')
  .select('status')
  .eq('loop_id', id);

// Route based on status:
switch(loop.status) {
  case 'pending_sentence': return handleLearnerSentence(...);
  case 'pending_teacher_reply': return handleTeacherReply(...);
  // ...
}

// Transition:
await supabase
  .from('learning_loops')
  .update({ status: 'awaiting_translation' })
  .eq('loop_id', id);
```

### Supabase Query with RLS

```typescript
// Server component/action
const supabase = await createClient();

// RLS automatically filters based on auth.uid()
const { data } = await supabase
  .from('groups')
  .select('*')
  .eq('learner_id', userId);  // Only sees their groups

// RLS policy enforces:
// CREATE POLICY ... WHERE learner_id = (SELECT ... WHERE auth_id = auth.uid())
```

### Error Handling Pattern

```typescript
try {
  const result = await llmService.evaluateTranslation(...);
  logger.info('Evaluation complete');
  return result;
} catch (error) {
  logger.error({ error }, 'Evaluation failed');
  // Graceful degradation
  return { result: 'error', feedback: 'Service unavailable' };
}
```

---

## 🧪 Testing Quick Start

### Run All Tests
```bash
npm run test
```

### Watch Mode (while coding)
```bash
npm run test -- --watch
```

### Coverage Report
```bash
npm run test -- --coverage
```

### Test a Specific File
```bash
npm run test -- services/llm-service.test.ts
```

### Test Structure
```typescript
import { describe, it, expect, vi } from 'vitest';

describe('MyService', () => {
  it('should do something', async () => {
    const result = await myService.doSomething();
    expect(result).toBe('expected');
  });

  it('should handle errors', async () => {
    const error = new Error('Test error');
    expect(() => throw error).toThrow('Test error');
  });
});
```

---

## 🐛 Debugging

### Enable Debug Logging
```bash
LOG_LEVEL=debug npm run dev
```

### Attach Node Debugger
```bash
node --inspect app/server.ts
# Visit chrome://inspect in Chrome
```

### Check Baileys QR in Console
```bash
npm run dev 2>&1 | grep -i qr
```

### View Realtime Database Updates
```bash
supabase studio
# Go to Realtime section
```

---

## 🎯 Commit Conventions

```bash
# Feature
git commit -m "feat: implement LLM evaluation"

# Bug fix
git commit -m "fix: handle Baileys session expiry"

# Documentation
git commit -m "docs: add Tamil transliteration guide"

# Refactor
git commit -m "refactor: extract message parser to util"

# Test
git commit -m "test: add integration tests for loop engine"

# Chore
git commit -m "chore: update dependencies"
```

---

## 📋 Phase Checklist Template

Copy for each phase sprint:

```markdown
## Phase X: [Phase Name]

### Setup
- [ ] Assigned to: [Developer Name]
- [ ] Started: [Date]
- [ ] Target completion: [Date]

### Implementation
- [ ] Task 1
  - [ ] Subtask 1a
  - [ ] Subtask 1b
- [ ] Task 2
  - [ ] Subtask 2a

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual E2E test
- [ ] Coverage > 70%

### Documentation
- [ ] Code commented
- [ ] README updated
- [ ] Troubleshooting doc if needed

### Review
- [ ] PR created
- [ ] Approved by [Reviewer]
- [ ] Merged to main

### Deployment
- [ ] Deployed to staging
- [ ] Verified on production
- [ ] Rollback plan documented
```

---

## 🚨 Common Issues & Fixes

### Issue: "Cannot find module '@supabase/supabase-js'"
**Fix**: `npm install` and verify Node version >= 20

### Issue: Baileys QR not showing
**Fix**: Check `LOG_LEVEL=debug` output, ensure port 3000 is free

### Issue: Type errors after schema change
**Fix**: Run `supabase gen types typescript --schema public > lib/supabase/types.ts`

### Issue: RLS policy blocking queries
**Fix**: Check policy logic in Supabase studio, verify `auth.uid()` is set

### Issue: Hot reload not working
**Fix**: Restart dev server, check file watcher limits on Mac: `ulimit -n 65536`

---

## 📞 Getting Help

1. **GitHub Issues**: Report bugs, ask questions
2. **Slack/Discord**: Quick questions, blockers
3. **Documentation**: Check `docs/` first
4. **Code comments**: Ask in PRs

---

## 🔗 Useful Links

- **Anthropic Claude Integration**: [Docs](https://docs.anthropic.com)
- **Supabase Guide**: [Docs](https://supabase.com/docs)
- **Next.js App Router**: [Docs](https://nextjs.org/docs/app)
- **Baileys GitHub**: [whiskey.so](https://whiskey.so)
- **node-cron**: [GitHub](https://github.com/kelektiv/node-cron)

---

**Last updated: 30 March 2026**

*Need something added to this reference? Submit a PR!*
