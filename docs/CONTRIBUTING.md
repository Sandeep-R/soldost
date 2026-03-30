# Contributing to Soldost

Thank you for contributing to Soldost! This guide will help you get started.

## Development Setup

See [docs/SETUP.md](../docs/SETUP.md) for full local development instructions.

## Code Style & Standards

### TypeScript

- **Strict mode**: All TypeScript files must pass `tsc --noEmit` in strict mode
- **No implicit any**: Explicitly type all parameters and return values
- **Use types over interfaces** for exports (more flexible)
- **Path aliases**: Use `@/lib`, `@/services`, etc. instead of relative paths

### Formatting

```bash
# Auto-format code
npm run format

# Check linting
npm run lint

# Check TypeScript
npm run type-check
```

### Naming Conventions

- **Files**: kebab-case (`learning-loop.ts`, `anthropic-adapter.ts`)
- **Folders**: kebab-case (`lib/llm/`, `services/`)
- **Classes/Types**: PascalCase (`LearningLoopEngine`, `LLMProvider`)
- **Functions/Variables**: camelCase (`evaluateTranslation`, `groupId`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `DEFAULT_MODEL`)

### Imports

```typescript
// ❌ Avoid relative paths
import { LLMService } from '../../../services/llm-service';

// ✅ Use path aliases
import { LLMService } from '@/services/llm-service';
```

## Commit Workflow

### 1. Create Feature Branch

```bash
git checkout -b feat/your-feature-name
```

**Branch naming**: `feat/`, `fix/`, `docs/`, `refactor/`, `test/`

### 2. Make Changes

```bash
# Work on feature
# Run tests and linting
npm run test
npm run lint
npm run type-check
```

### 3. Commit with Type

```bash
git commit -m "feat: add LLM evaluation service"
git commit -m "fix: handle Baileys session expiry"
git commit -m "docs: update setup guide"
```

**Commit types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring (no logic change)
- `test`: Add/update tests
- `chore`: Dependency updates, config changes

### 4. Push & Open PR

```bash
git push origin feat/your-feature-name
```

Create PR on GitHub with:
- **Title**: Concise feature description
- **Description**: What changed and why
- **Related Issues**: `Closes #123`

### 5. Review & Merge

- Address review feedback
- Ensure CI passes (linting, types, tests)
- Squash commits if requested
- Merge via "Squash and Merge"

## Testing

### Run Tests

```bash
npm run test                 # Run all tests
npm run test -- --watch     # Watch mode
npm run test:ui             # UI dashboard
```

### Test Structure

```typescript
// tests/services/llm-service.test.ts
import { describe, it, expect } from 'vitest';
import { LLMService } from '@/services/llm-service';

describe('LLMService', () => {
  it('should evaluate correct translation', async () => {
    const result = await llmService.evaluateTranslation(
      'Story',
      'Kathai',
      'Tamil',
      'English'
    );
    expect(result.result).toBe('correct');
  });
});
```

### Coverage Target

Aim for **70%+ coverage** on:
- Services (high priority)
- Utils/helpers (medium priority)
- API routes (medium priority)

Dashboard components: lower priority (integration tests in E2E)

## Database Migrations

### Create Migration

```bash
supabase migration new add_new_table

# Edit supabase/migrations/xxxxxxx_add_new_table.sql
supabase db push
```

### Guidelines

- ✅ Always include `CREATE`/`ALTER` with `IF [NOT] EXISTS`
- ✅ Add comments for complex logic
- ✅ Include rollback strategy in message
- ✅ Test locally before pushing

## Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows style guide (run `npm run format`)
- [ ] Tests added/updated and pass (`npm run test`)
- [ ] TypeScript passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation updated if needed
- [ ] Commit messages follow convention
- [ ] Branch is up-to-date with `main`

## Working on Phases

### Phase Assignment Example

**Phase 3: LLM Service** (owner: Dev A)

```typescript
// lib/llm/anthropic-adapter.ts
// services/llm-service.ts

// Checklist:
// [ ] Implement LLMProvider interface
// [ ] Add Anthropic SDK integration
// [ ] Add token counting
// [ ] Add error handling + retries
// [ ] Write unit tests
// [ ] Add cost logging
```

### Parallel Work

Multiple developers can work on different phases:

- **Developer A**: Phase 5 (Baileys bot)
- **Developer B**: Phase 7 (Dashboard)
- **Developer C**: Phase 3-4 (LLM + Transliteration)

Just ensure:
1. Dependencies are clear (e.g., Phase 6 depends on Phase 5 output)
2. Weekly syncs to unblock issues
3. No merge conflicts on shared files (lib/config, package.json)

## Documentation

Update docs when:
- [ ] Adding a new service / major feature
- [ ] Changing architecture / design decision
- [ ] Adding environment variables
- [ ] Troubleshooting a common issue

**Doc files**:
- `docs/SETUP.md` — Local development setup
- `docs/ARCHITECTURE.md` — System design
- `docs/TRANSLITERATION.md` — Tamil romanization
- `docs/API.md` — API reference (future)
- `docs/TROUBLESHOOTING.md` — Common issues

## Code Review Process

### As Author

1. Keep PRs focused (one feature per PR)
2. Add context in PR description
3. Ask for help on blockers
4. Respond to comments promptly

### As Reviewer

1. Skim the changes first
2. Check logic, not style (style enforced by linting)
3. Ask questions if unclear
4. Approve with suggestions vs. "Request Changes"
5. Check that author addressed feedback before approving

## Common Tasks

### Updating Dependencies

```bash
npm update                    # Check updates
npm install package@latest   # Install specific version
npm run type-check           # Verify types still work
git commit -m "chore: upgrade dependencies"
```

### Debugging

```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Attach debugger
node --inspect app/server.ts
# Visit chrome://inspect to debug
```

### Database Inspection

```bash
supabase studio             # Open local studio
# OR visit cloud: https://app.supabase.com/projects/your-ref
```

## Asking for Help

- **Slack/Discord**: Quick questions, blockers
- **GitHub Issues**: Bugs, feature requests
- **PR Comments**: Code review discussions
- **Weekly Sync**: High-level progress, architecture questions

## Release Process (Future)

1. Create release branch: `release/v0.2.0`
2. Update `package.json` version
3. Update `CHANGELOG.md`
4. Create tag: `git tag v0.2.0`
5. Push and create PR to `main`
6. Merge and GitHub creates release

---

## Questions?

- Check [docs/](../docs/) first
- Ask in team chat
- Open an issue: "Q: How do I...?"

---

**Happy coding!** 🚀
