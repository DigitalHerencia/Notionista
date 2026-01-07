---
description: 'Pull request creation and maintenance best practices'
applyTo: '**'
---

# Pull Request Guidelines

Comprehensive guidelines for creating, maintaining, and reviewing pull requests in the Notionista repository.

## Before Creating a PR

### Pre-Flight Checklist

- [ ] All commits follow [Conventional Commits](commit.instructions.md) format
- [ ] Code passes all quality checks locally:

  ```bash
  pnpm lint && pnpm format && pnpm typecheck && pnpm test:coverage && pnpm build
  ```

- [ ] Changes are tested thoroughly (unit, integration, manual)
- [ ] Documentation is updated (code comments, README, API docs)
- [ ] Breaking changes are documented with migration guide
- [ ] Related issue exists and is linked

### Branch Naming

Use descriptive branch names following this pattern:

```text
<type>/<issue-number>-<short-description>
```

**Examples:**

- `feat/42-compound-query-filters`
- `fix/87-network-timeout-handling`
- `docs/123-api-reference-update`
- `refactor/56-extract-base-repository`

## Creating a Pull Request

### PR Title

Follow Conventional Commits format:

```text
<type>[optional scope]: <description>
```

**Good Examples:**

- `feat(query): add support for compound filters`
- `fix(mcp): handle network timeout errors gracefully`
- `docs: add API reference for query builder`
- `refactor(domain): extract repository base class`

**Bad Examples:**

- ❌ `Update code` (too vague)
- ❌ `Fix bug` (not specific)
- ❌ `WIP` (should not create PR for incomplete work)

### PR Description

Use the provided [PR template](../../pull_request_template.md) and fill out all sections:

1. **Executive Summary** - 2-3 sentences explaining what and why
2. **Related Issue** - Link using `Closes #`, `Fixes #`, or `Resolves #`
3. **Type of Change** - Check all applicable boxes
4. **Requirements & Design** - Reference spec docs if using spec-driven workflow
5. **Changes Made** - Detailed list of modifications
6. **Technical Details** - Components affected, dependencies, breaking changes
7. **Testing** - Strategy, coverage, manual test steps
8. **Code Quality** - Self-review checklist and static analysis results
9. **Documentation** - List all documentation updates
10. **Security** - Address security implications
11. **Checklist** - Final verification before review

### Required Information

Every PR must include:

- **Clear description** of what changed and why
- **Issue reference** linking to the original request
- **Test coverage** demonstrating the changes work
- **Breaking change notice** if applicable
- **Migration guide** for breaking changes
- **Screenshots/demos** for UI or output changes

## PR Lifecycle

### 1. Draft Phase

Create as draft PR if:

- Work is incomplete but you want early feedback
- You need CI to run to validate approach
- You want to discuss implementation before completing

**Mark as draft:**

```text
[DRAFT] feat(query): add compound filters
```

Or use GitHub's "Create draft pull request" button.

### 2. Ready for Review

When ready for review:

1. **Self-review**: Review your own diff thoroughly
2. **Update PR description**: Ensure all sections are complete
3. **Verify CI passes**: All checks must be green
4. **Request reviewers**: Assign appropriate team members
5. **Convert from draft**: If previously in draft state

### 3. Review Phase

**As PR author:**

- Respond to comments promptly
- Make requested changes in new commits (don't force push during review)
- Re-request review after addressing feedback
- Be open to suggestions and alternative approaches
- Ask clarifying questions if feedback is unclear

**Handling feedback:**

- ✅ Thank reviewers for their time and insights
- ✅ Discuss trade-offs respectfully
- ✅ Update code based on valid concerns
- ✅ Explain your reasoning for controversial decisions
- ❌ Dismiss feedback without discussion
- ❌ Take criticism personally
- ❌ Force push during active review

### 4. Approval & Merge

Before merging:

- [ ] All reviewer comments are addressed or resolved
- [ ] All CI checks pass (lint, format, typecheck, test, build)
- [ ] At least one approval from maintainer
- [ ] No unresolved merge conflicts
- [ ] PR description is up-to-date

**Merge strategy:**

- **Squash and merge** (default) - For feature branches with multiple commits
- **Rebase and merge** - For clean, atomic commits that should be preserved
- **Merge commit** - For large features or releases

**After merging:**

1. Delete the feature branch
2. Verify deployment/release if applicable
3. Update related issues with resolution notes
4. Monitor for any issues in production

## PR Best Practices

### Size and Scope

- **Keep PRs focused** - One logical change per PR
- **Limit size** - Aim for <400 lines changed (excluding generated files)
- **Break up large changes** - Split into multiple PRs with clear dependencies
- **Avoid scope creep** - Don't add unrelated changes

### Code Quality

- **Write clean code** - Follow project style guide
- **Add comments** - Explain complex logic and design decisions
- **No debug code** - Remove console.log, commented code, TODOs
- **Type safety** - Avoid `any`, use specific types
- **Error handling** - Handle errors gracefully with clear messages

### Testing

- **Test thoroughly** - Unit, integration, and manual testing
- **High coverage** - Aim for 90%+ test coverage
- **Test edge cases** - Empty input, null values, boundaries
- **Test errors** - Verify error conditions are handled correctly

### Documentation

- **Update docs** - Keep documentation in sync with code
- **Code comments** - Explain "why", not "what"
- **API docs** - Document public interfaces with TSDoc
- **Examples** - Add or update examples in `examples/`

### Commit Hygiene

- **Atomic commits** - One logical change per commit
- **Good messages** - Follow [Commit Guidelines](commit.instructions.md)
- **Clean history** - Rebase to clean up before review
- **No merge commits** - Rebase on main instead of merging

## Common Scenarios

### Updating with Latest Main

```bash
# Fetch latest changes
git fetch origin main

# Rebase your branch
git rebase origin/main

# Force push if already pushed (only before review or with team agreement)
git push --force-with-lease
```

### Addressing Review Comments

```bash
# Make requested changes
# ... edit files ...

# Commit changes
git add .
git commit -m "refactor: address review feedback"

# Push changes
git push origin feat/42-compound-filters

# Re-request review in GitHub UI
```

### Resolving Merge Conflicts

```bash
# Update from main
git fetch origin main
git rebase origin/main

# Resolve conflicts in your editor
# ... fix conflicts ...

# Continue rebase
git add .
git rebase --continue

# Force push (only if already pushed)
git push --force-with-lease
```

### Squashing Commits

```bash
# Interactive rebase for last N commits
git rebase -i HEAD~N

# Mark commits to squash (s) or fixup (f)
# Save and close editor

# Force push (only if already pushed)
git push --force-with-lease
```

## PR Templates

### Feature PR Template

```markdown
## Executive Summary

This PR adds support for compound filters in the query builder, enabling
users to combine multiple conditions with AND/OR logic.

## Related Issue

Closes #42

## Type of Change

- [x] ✨ New feature

## Changes Made

- Add `and()` and `or()` methods to FilterBuilder
- Implement compound filter validation
- Add test suite for compound filters
- Update query builder documentation

## Testing

- 15 new unit tests covering all combinations
- Manual testing with real Notion databases
- Integration tests with MCP client
```

### Bug Fix PR Template

```markdown
## Executive Summary

Fixes network timeout errors that were crashing the MCP client by adding
proper error handling and retry logic.

## Related Issue

Fixes #87

## Type of Change

- [x] 🐛 Bug fix

## Root Cause

The MCP client was not catching network timeout errors, causing unhandled
promise rejections.

## Solution

- Add timeout error handling in transport layer
- Implement exponential backoff retry strategy
- Add timeout configuration option

## Testing

- Added tests simulating network timeouts
- Verified retry logic with increasing delays
- Tested timeout configuration options
```

## CI/CD Integration

### Automated Checks

All PRs must pass:

- **ESLint** - Code style and quality
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Vitest** - Unit and integration tests
- **Coverage** - Test coverage thresholds
- **Build** - Successful compilation

### Status Badges

CI status is shown in PR:

- ✅ All checks passed - Ready to merge
- ⏳ Checks running - Wait for completion
- ❌ Checks failed - Fix issues before review

### Auto-Reviews

- **Copilot Code Review** - Automatically reviews code for issues
- **Dependency updates** - Dependabot PRs auto-reviewed
- **Test coverage** - Coverage reports posted as comments

## Copilot Integration

### Using Copilot for PRs

```bash
# Generate PR description
@workspace /new generate a comprehensive PR description for my changes

# Review before submitting
@workspace /new review my PR description for completeness

# Suggest improvements
@workspace /new suggest improvements to my PR based on best practices
```

### Copilot PR Features

- **Auto-complete** - Fills in PR template sections
- **Suggests reviewers** - Based on file ownership
- **Generates summaries** - From commit messages and diffs
- **Identifies risks** - Highlights potential issues

## References

- [GitHub PR Best Practices](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Contributing Guide](../../CONTRIBUTING.md)
- [Commit Guidelines](commit.instructions.md)
- [Code Review Guidelines](review.instructions.md)
