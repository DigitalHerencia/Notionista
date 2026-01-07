---
description: 'Code review guidelines and best practices for reviewers and authors'
applyTo: '**'
---

# Code Review Guidelines

Comprehensive guidelines for conducting thorough, constructive, and efficient code reviews.

## Purpose of Code Review

Code review serves multiple purposes:

1. **Quality assurance** - Catch bugs, security issues, and performance problems
2. **Knowledge sharing** - Spread understanding across the team
3. **Standards enforcement** - Ensure consistency and best practices
4. **Mentoring** - Help developers grow and learn
5. **Risk mitigation** - Identify potential problems before production

## Reviewer Responsibilities

### Before Starting Review

- [ ] Understand the context (read linked issue, design docs)
- [ ] Check that PR description is complete
- [ ] Verify CI checks pass
- [ ] Allocate sufficient time (don't rush)
- [ ] Be in the right mindset (constructive, helpful)

### During Review

- [ ] Review the code thoroughly, not superficially
- [ ] Test the changes locally if needed
- [ ] Consider security implications
- [ ] Evaluate test coverage and quality
- [ ] Check documentation completeness
- [ ] Assess maintainability and readability

### After Review

- [ ] Provide clear, actionable feedback
- [ ] Approve when satisfied, or request changes
- [ ] Follow up on discussions
- [ ] Re-review after changes are made

## What to Review

### 1. Functionality

- **Correctness** - Does the code do what it's supposed to?
- **Edge cases** - Are boundary conditions handled?
- **Error handling** - Are errors caught and handled properly?
- **Requirements** - Does it satisfy the acceptance criteria?

**Questions to ask:**

- Does this solve the stated problem?
- What happens with invalid input?
- Are there any unhandled edge cases?
- Could this break existing functionality?

### 2. Design & Architecture

- **Modularity** - Is code properly organized into modules?
- **Separation of concerns** - Is each module focused?
- **Reusability** - Can this code be reused?
- **Extensibility** - Is it easy to extend in the future?
- **Patterns** - Are appropriate design patterns used?

**Questions to ask:**

- Does this fit the existing architecture?
- Are there better ways to structure this?
- Is this the right level of abstraction?
- Will this be easy to maintain?

### 3. Code Quality

- **Readability** - Is the code easy to understand?
- **Naming** - Are names descriptive and consistent?
- **Complexity** - Is the code unnecessarily complex?
- **Duplication** - Is there repeated code that should be extracted?
- **Style** - Does it follow project conventions?

**Questions to ask:**

- Can I understand this without extensive comments?
- Are variable/function names clear?
- Is there too much logic in one function?
- Could this be simpler?

### 4. Testing

- **Coverage** - Are all paths tested?
- **Quality** - Are tests meaningful and effective?
- **Edge cases** - Are boundary conditions tested?
- **Error cases** - Are error scenarios tested?
- **Maintainability** - Are tests easy to understand and maintain?

**Questions to ask:**

- What happens if this test is removed?
- Are there untested code paths?
- Do tests validate the right things?
- Are tests fragile or robust?

### 5. Performance

- **Efficiency** - Are there performance bottlenecks?
- **Memory usage** - Is memory used efficiently?
- **Scalability** - Will this work with large datasets?
- **Optimization** - Are there easy performance wins?

**Questions to ask:**

- Is this code efficient?
- What happens with 10x more data?
- Are there unnecessary loops or operations?
- Should we profile this?

### 6. Security

- **Input validation** - Is user input validated?
- **Authorization** - Are permissions checked?
- **Data exposure** - Could sensitive data leak?
- **Injection** - Are queries parameterized?
- **Dependencies** - Are dependencies secure?

**Questions to ask:**

- What's the worst case if this is exploited?
- Is input sanitized before use?
- Could this expose sensitive information?
- Are there known vulnerabilities in dependencies?

### 7. Documentation

- **Code comments** - Is complex logic explained?
- **API docs** - Are public interfaces documented?
- **Examples** - Are usage examples provided?
- **README** - Is user documentation updated?
- **Inline docs** - Do comments explain "why", not "what"?

**Questions to ask:**

- Can someone unfamiliar understand this?
- Are breaking changes documented?
- Is the public API clearly documented?
- Are examples up to date?

## How to Provide Feedback

### Tone and Approach

**DO:**

- ✅ Be respectful and professional
- ✅ Assume good intent
- ✅ Ask questions rather than make demands
- ✅ Explain the "why" behind suggestions
- ✅ Acknowledge good work
- ✅ Be specific and actionable
- ✅ Offer to discuss complex topics

**DON'T:**

- ❌ Be condescending or dismissive
- ❌ Assume incompetence
- ❌ Give vague feedback like "this is bad"
- ❌ Focus only on negatives
- ❌ Block PR for personal preferences
- ❌ Nitpick trivial issues

### Comment Types

Use clear labels to indicate severity:

- **🔴 Required** - Must be addressed before approval
- **🟡 Suggestion** - Nice to have, but optional
- **🟢 Observation** - Just an FYI, no action needed
- **💭 Question** - Asking for clarification
- **👍 Praise** - Acknowledging good work

### Example Comments

**Good examples:**

```markdown
🔴 Required: This could cause a null pointer exception if `data` is undefined.
Consider adding a null check or using optional chaining:

if (data?.items) { ... }
```

```markdown
🟡 Suggestion: This function is getting complex. Consider extracting the
validation logic into a separate function for better readability.
```

```markdown
💭 Question: Why did we choose to use a Map instead of an array here?
I'm curious about the trade-offs.
```

```markdown
👍 Praise: Great use of the Builder pattern here! This makes the API
much more intuitive.
```

**Bad examples:**

```markdown
❌ This is wrong.
```

```markdown
❌ Why didn't you just use a map here?
```

```markdown
❌ I wouldn't do it this way.
```

### Constructive Feedback Formula

1. **Observe** - State what you see
2. **Impact** - Explain the potential consequence
3. **Suggest** - Offer a specific alternative
4. **Explain** - Say why it's better

**Example:**

> I notice this function has 150 lines and handles multiple responsibilities.
> This makes it harder to test and maintain. Consider splitting it into smaller
> functions, each handling one concern. This would improve testability and make
> the code easier to understand.

## Review Workflow

### 1. Initial Review

```bash
# Check out the PR branch
git fetch origin
git checkout feat/42-compound-filters

# Install dependencies if needed
pnpm install

# Run tests
pnpm test

# Run the code locally
pnpm dev

# Try the changes manually
```

### 2. Review Checklist

- [ ] **Understand the change** - Read PR description and linked issues
- [ ] **Check CI status** - Ensure all automated checks pass
- [ ] **Review code** - Go through each file carefully
- [ ] **Test locally** - Run the code and verify it works
- [ ] **Check tests** - Review test coverage and quality
- [ ] **Review docs** - Ensure documentation is updated
- [ ] **Consider impact** - Think about broader implications
- [ ] **Provide feedback** - Leave comments on specific lines
- [ ] **Make decision** - Approve, request changes, or comment

### 3. Decision Matrix

| Situation                           | Action                    |
| ----------------------------------- | ------------------------- |
| No issues found                     | ✅ Approve                |
| Minor suggestions only              | ✅ Approve with comments  |
| Significant improvements needed     | 🔄 Request changes        |
| Requires discussion                 | 💬 Comment without status |
| Needs more information              | 💭 Ask questions          |
| Blocking issues (security, bugs)    | ⛔ Request changes        |
| Not qualified to review             | 👥 Assign another reviewer|
| Too large to review effectively     | 📦 Ask to split PR        |
| Unclear purpose or missing context  | 📋 Request more details   |
| Conflicts with architecture/design  | 🏗️ Escalate to lead       |

### 4. Approval Guidelines

Approve when:

- [ ] Code is correct and meets requirements
- [ ] No security, performance, or correctness issues
- [ ] Tests are adequate and passing
- [ ] Documentation is complete
- [ ] No blocking concerns remain
- [ ] Minor suggestions can be addressed later

Request changes when:

- [ ] Bugs or correctness issues exist
- [ ] Security vulnerabilities present
- [ ] Tests are missing or inadequate
- [ ] Breaking changes not properly handled
- [ ] Significant design concerns
- [ ] Documentation insufficient

## Review Priorities

Focus on issues in this order:

1. **🔴 Critical** - Bugs, security issues, data loss risks
2. **🟠 Important** - Performance problems, maintainability issues
3. **🟡 Moderate** - Code style, test improvements, docs
4. **🟢 Low** - Nitpicks, personal preferences

Don't block a PR for low-priority items. Approve with suggestions instead.

## Special Cases

### Large PRs

For PRs > 400 lines:

1. Ask author to split if possible
2. If not splittable, schedule dedicated review time
3. Review in multiple sessions
4. Focus on critical sections first
5. Consider pair programming session

### Emergency Fixes

For urgent hotfixes:

1. Prioritize correctness and risk assessment
2. Accept imperfect code if it solves the problem
3. Create follow-up issues for improvements
4. Document technical debt incurred
5. Plan time for proper fix later

### Dependency Updates

For dependency updates:

1. Check changelog for breaking changes
2. Review impact on existing code
3. Verify tests still pass
4. Check for known vulnerabilities
5. Test locally if significant update

### Refactoring PRs

For refactoring:

1. Verify behavior unchanged (tests pass)
2. Assess if code is actually improved
3. Check for unintended side effects
4. Ensure commits are atomic
5. Validate motivation and trade-offs

## Author Responsibilities

### Responding to Feedback

**DO:**

- ✅ Respond to all comments (even if just "Fixed")
- ✅ Ask questions if feedback is unclear
- ✅ Resolve conversations when addressed
- ✅ Explain your reasoning respectfully
- ✅ Thank reviewers for their time
- ✅ Be open to alternative approaches

**DON'T:**

- ❌ Ignore comments
- ❌ Get defensive
- ❌ Dismiss suggestions without consideration
- ❌ Force push during active review
- ❌ Mark conversations resolved without addressing them

### Making Changes

After receiving feedback:

```bash
# Make requested changes
# ... edit files ...

# Commit with clear message
git add .
git commit -m "refactor: extract validation logic per review"

# Push changes
git push origin feat/42-compound-filters

# Update PR description if needed
# Respond to comments in GitHub
# Re-request review
```

### When to Pushback

It's okay to disagree if:

- Suggestion conflicts with requirements
- Alternative approach has trade-offs reviewer didn't consider
- Feedback is based on personal preference, not standards
- Change would require significant rework with minimal benefit

When disagreeing:

1. Explain your reasoning clearly
2. Present trade-offs objectively
3. Suggest compromises if possible
4. Be willing to escalate to team lead if needed

## Automated Reviews

### Copilot Code Review

The repository uses automated Copilot code review:

- **Triggers**: Automatically on PR creation and updates
- **Focus**: Common issues, best practices, security
- **Integration**: Comments appear as suggestions
- **Benefits**: Catches issues before human review

**Responding to Copilot feedback:**

- Treat it like human feedback
- Fix legitimate issues
- Dismiss false positives with explanation
- Don't ignore or auto-dismiss

### CI Checks

Automated checks must pass:

- **Lint** - Code style compliance
- **Format** - Prettier formatting
- **Typecheck** - TypeScript errors
- **Tests** - All tests passing
- **Coverage** - Coverage thresholds met
- **Build** - Successful compilation

## Metrics and Goals

### Review Turnaround Time

- **Target**: First review within 24 hours
- **Maximum**: 48 hours for non-urgent PRs
- **Emergency fixes**: Within 2 hours

### Review Thoroughness

- **Average time**: 5-10 minutes per 100 lines
- **Minimum**: Don't rubber stamp
- **Maximum**: Don't over-analyze

### Approval Rate

- **Target**: 80% approved on first review (well-prepared PRs)
- **Expected**: Some iteration is normal and healthy

## Best Practices

### For Reviewers

1. **Review promptly** - Don't let PRs languish
2. **Be thorough but pragmatic** - Balance quality with speed
3. **Focus on important issues** - Don't nitpick
4. **Teach and explain** - Share knowledge
5. **Praise good work** - Positive feedback matters
6. **Test locally when needed** - Don't just read code

### For Authors

1. **Self-review first** - Catch obvious issues
2. **Keep PRs small** - Easier to review
3. **Write good descriptions** - Context helps reviewers
4. **Respond quickly** - Don't delay the process
5. **Be receptive** - View feedback as learning
6. **Test thoroughly** - Don't rely on reviewers to find bugs

### For Teams

1. **Review each other's code** - Share knowledge
2. **Rotate reviewers** - Spread expertise
3. **Establish standards** - Document conventions
4. **Discuss disagreements** - Learn from debates
5. **Celebrate good reviews** - Recognize effort
6. **Continuous improvement** - Refine process over time

## Tools and Resources

### Review Tools

- **GitHub PR interface** - Web-based review
- **VS Code** - Review in editor with extensions
- **CLI tools** - `gh pr checkout`, `git diff`
- **Copilot** - AI-assisted review

### VS Code Extensions

- **GitHub Pull Requests** - Review PRs in VS Code
- **GitLens** - Enhanced git integration
- **Copilot** - Code suggestions during review

### Commands

```bash
# Checkout PR for local testing
gh pr checkout 42

# View PR diff
gh pr diff 42

# View PR in browser
gh pr view 42 --web

# Leave review comment
gh pr comment 42 --body "LGTM! 🚀"

# Approve PR
gh pr review 42 --approve --body "Approved"

# Request changes
gh pr review 42 --request-changes --body "Please address..."
```

## References

- [GitHub Code Review Guide](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests)
- [Google Engineering Practices](https://google.github.io/eng-practices/review/)
- [Contributing Guide](../../CONTRIBUTING.md)
- [Pull Request Guidelines](pull-request.instructions.md)
