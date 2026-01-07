---
description: 'Commit message standards following Conventional Commits specification'
applyTo: '**'
---

# Commit Message Guidelines

Guidelines for creating clear, consistent, and meaningful commit messages following the Conventional Commits specification.

## Commit Message Format

Every commit message must follow this structure:

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Type

The type must be one of the following:

- **feat**: A new feature for the user
- **fix**: A bug fix for the user
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, whitespace, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes to build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Scope

Optional. Specifies the component or module affected:

- `core` - Core SDK functionality
- `mcp` - MCP client and transport
- `query` - Query builder
- `safety` - Safety layer (validation, diff, proposal)
- `schemas` - Schema definitions
- `workflows` - Workflow implementations
- `sync` - Snapshot and sync functionality
- `domain` - Domain models and repositories
- `docs` - Documentation changes
- `deps` - Dependency updates
- `config` - Configuration changes

### Description

- Use imperative mood: "add" not "added" or "adds"
- Don't capitalize first letter
- No period (.) at the end
- Maximum 72 characters
- Be specific and descriptive

### Body

Optional but recommended for non-trivial changes:

- Explain the motivation for the change
- Contrast with previous behavior
- Include rationale for design decisions
- Wrap at 72 characters

### Footer

Optional. Used for:

- **Breaking changes**: Start with `BREAKING CHANGE:` followed by description
- **Issue references**: `Closes #123`, `Fixes #456`, `Resolves #789`
- **Co-authors**: `Co-authored-by: Name <email@example.com>`

## Examples

### Simple Feature

```text
feat(query): add support for compound filters

Implement AND/OR logic for combining multiple filter conditions
in database queries. This enables more complex query patterns.

Closes #42
```

### Bug Fix

```text
fix(mcp): handle network timeout errors gracefully

Previously, network timeouts would crash the client. Now they
are caught and retried with exponential backoff.

Fixes #87
```

### Breaking Change

```text
feat(core)!: change NotionClient constructor API

BREAKING CHANGE: NotionClient now requires a config object
instead of individual parameters.

Before:
  new NotionClient(token, options)

After:
  new NotionClient({ token, ...options })

This provides better extensibility and clearer parameter names.

Closes #123
```

### Documentation

```text
docs(readme): add quick start guide

Include step-by-step instructions for first-time users to get
started with the SDK in under 5 minutes.
```

### Multiple Issues

```text
fix(safety): improve validation error messages

Make error messages more descriptive and actionable. Include
specific field names and expected formats in validation errors.

Fixes #45, #48, #52
```

### Refactoring

```text
refactor(domain): extract repository base class

Create abstract BaseRepository to reduce code duplication across
Team, Project, Task, and Meeting repositories.
```

## Best Practices

### DO

- ✅ Write clear, descriptive commit messages
- ✅ Use conventional commit format consistently
- ✅ Reference issue numbers when applicable
- ✅ Break large changes into focused commits
- ✅ Keep commits atomic (one logical change per commit)
- ✅ Test your changes before committing
- ✅ Use imperative mood in descriptions
- ✅ Explain "why" in the body, not just "what"

### DON'T

- ❌ Use vague messages like "fix stuff" or "update code"
- ❌ Combine unrelated changes in one commit
- ❌ Include work-in-progress or broken code
- ❌ Commit generated files (build outputs, node_modules)
- ❌ Include sensitive information (tokens, passwords)
- ❌ Use past tense ("fixed", "added")
- ❌ Exceed character limits (72 for description, 72 for body lines)
- ❌ Add trailing punctuation to description

## Commit Workflow

### Before Committing

```bash
# 1. Stage your changes
git add <files>

# 2. Run quality checks
pnpm lint && pnpm format && pnpm typecheck && pnpm test

# 3. Review your changes
git diff --staged

# 4. Commit with a good message
git commit
```

### Writing the Commit Message

1. **Start with type and scope**: Clearly identify what changed
2. **Write description**: Summarize the change in imperative mood
3. **Add body if needed**: Explain motivation and context
4. **Reference issues**: Link to related GitHub issues
5. **Note breaking changes**: Use `!` suffix or `BREAKING CHANGE:` footer

### Multiple Commits

For complex features, break work into logical commits:

```bash
# Commit 1: Add interface
git commit -m "feat(query): add FilterBuilder interface"

# Commit 2: Implement logic
git commit -m "feat(query): implement FilterBuilder class"

# Commit 3: Add tests
git commit -m "test(query): add FilterBuilder test suite"

# Commit 4: Update docs
git commit -m "docs(query): document FilterBuilder API"
```

## Common Patterns

### Dependency Updates

```text
build(deps): upgrade vitest to v1.2.0

Update to latest version for improved performance and new
assertion methods.
```

### CI/CD Changes

```text
ci: add test coverage reporting to GitHub Actions

Upload coverage reports to Codecov after test runs to track
code coverage trends over time.
```

### Performance Improvements

```text
perf(snapshot): optimize CSV parsing for large files

Use streaming parser instead of loading entire file into memory.
Reduces memory usage by 80% for files >10MB.

Closes #67
```

### Security Fixes

```text
fix(mcp): sanitize user input in query parameters

Prevent potential injection attacks by validating and escaping
all user-provided values before including in MCP requests.

Security: Closes #99
```

### Reverting Commits

```text
revert: "feat(query): add compound filters"

This reverts commit abc123def456.

Reverting due to performance regression in large datasets.
Issue #42 will be re-addressed with a different approach.
```

## Validation

Commit messages are validated in CI using:

- Conventional Commits parser
- Character limit checks
- Format validation
- Required fields verification

If your commit message doesn't follow the format, CI will fail.

## Tools

### Git Commit Template

Set up a commit message template:

```bash
git config commit.template .github/.gitmessage
```

### Commitlint

The project uses commitlint to enforce standards:

```bash
# Validate the last commit
pnpm exec commitlint --from HEAD~1 --to HEAD --verbose
```

### Git Hooks

Pre-commit hooks run automatically:

- Lint staged files
- Format code
- Run type checking
- Execute relevant tests

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Git Best Practices](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project)
