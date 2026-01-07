# GitHub Copilot Instructions & PR Template Configuration

This document summarizes the Copilot instruction files and PR template configuration completed on January 6, 2026.

## Files Created

### 1. Commit Message Instructions

**File:** `.github/instructions/commit.instructions.md`

- Comprehensive guide for Conventional Commits format
- Includes commit types, scopes, and formatting rules
- Examples for all common scenarios (features, fixes, breaking changes, etc.)
- Best practices and validation requirements
- Integrated with Git hooks and CI/CD validation

### 2. Pull Request Instructions

**File:** `.github/instructions/pull-request.instructions.md`

- Complete PR lifecycle guidance (draft → review → approval → merge)
- Branch naming conventions and PR title formatting
- Detailed template usage instructions
- Common scenarios and workflows (updating from main, resolving conflicts, etc.)
- CI/CD integration guidelines
- Copilot integration features

### 3. Code Review Instructions

**File:** `.github/instructions/review.instructions.md`

- Comprehensive code review guidelines for reviewers and authors
- Seven key review areas (functionality, design, quality, testing, performance, security, documentation)
- Constructive feedback patterns with examples
- Decision matrix for approval/changes/comments
- Special case handling (large PRs, hotfixes, dependency updates, refactoring)
- Review workflow and tools

### 4. Enhanced PR Template

**File:** `pull_request_template.md`

Comprehensive pull request template with sections for:

- Executive summary and issue linking
- Type of change classification (with emojis)
- Requirements & design references (spec-driven workflow integration)
- Detailed change descriptions
- Technical details (components, dependencies, breaking changes, performance)
- Testing strategy and coverage (unit, integration, manual, edge cases)
- Code quality self-review checklist
- Static analysis verification
- Documentation updates
- Security considerations
- Rollback and deployment planning
- Final verification checklist
- Review focus areas

## VS Code Settings Configuration

**File:** `.vscode/settings.json`

Added the following GitHub Copilot configurations:

### Code Generation Instructions

```json
"github.copilot.chat.codeGeneration.instructions": [
  { "file": ".github/instructions/commit.instructions.md" },
  { "file": ".github/instructions/pull-request.instructions.md" },
  { "file": ".github/instructions/review.instructions.md" },
  { "file": ".github/instructions/markdown.instructions.md" },
  { "file": ".github/instructions/powershell.instructions.md" },
  { "file": ".github/instructions/instructions.instructions.md" }
]
```

### Commit Message Generation

```json
"github.copilot.chat.commitMessageGeneration.instructions": [
  { "file": ".github/instructions/commit.instructions.md" }
]
```

### PR Description Generation

```json
"github.copilot.chat.pullRequestDescriptionGeneration.instructions": [
  { "file": ".github/instructions/pull-request.instructions.md" }
]
```

### Review Comment Generation

```json
"github.copilot.chat.reviewCommentGeneration.instructions": [
  { "file": ".github/instructions/review.instructions.md" }
]
```

### MCP Server Configuration

```json
"github.copilot.chat.mcpServers": {
  "Notion": "https://mcp.notion.com/mcp"
}
```

## Integration with Existing Standards

The new instruction files integrate seamlessly with:

- **Spec-Driven Workflow** (global.instructions.md) - References to requirements.md, design.md, and tasks.md
- **CONTRIBUTING.md** - Aligned with contribution guidelines and quality checks
- **Markdown Standards** (markdown.instructions.md) - All files follow markdown linting rules
- **Existing Templates** - Compatible with issue templates and project structure

## Conventional Commits Specification

All commit instructions follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Supported Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `perf`: Performance
- `test`: Tests
- `build`: Build system
- `ci`: CI/CD
- `chore`: Maintenance
- `revert`: Revert commit

### Supported Scopes

- `core` - Core SDK
- `mcp` - MCP client/transport
- `query` - Query builder
- `safety` - Safety layer
- `schemas` - Schema definitions
- `workflows` - Workflows
- `sync` - Snapshot/sync
- `domain` - Domain models
- `docs` - Documentation
- `deps` - Dependencies
- `config` - Configuration

## Usage

### Generating Commit Messages

When creating commits, Copilot will now:

1. Automatically format commit messages using Conventional Commits
2. Suggest appropriate types and scopes
3. Validate message format and length
4. Include issue references when applicable

**In VS Code:**

- Click the sparkle ✨ icon in the Source Control commit message box
- Copilot will generate a properly formatted commit message based on your changes

### Creating Pull Requests

When creating PRs, Copilot will:

1. Generate comprehensive PR descriptions following the template
2. Auto-fill sections based on commit history and changed files
3. Suggest reviewers based on file ownership
4. Identify potential risks and breaking changes

**In VS Code:**

- Use `@workspace /new generate a comprehensive PR description`
- Or let GitHub automatically generate the description using the template

### Code Reviews

When reviewing PRs, Copilot will:

1. Provide constructive feedback following review guidelines
2. Identify common issues (security, performance, style)
3. Suggest improvements with examples
4. Categorize feedback by severity (required, suggestion, observation)

**In VS Code:**

- Use GitHub Pull Requests extension
- Copilot will suggest review comments as you read the code

## Verification

To verify the setup:

```bash
# Check that instructions are valid
cat .github/instructions/commit.instructions.md
cat .github/instructions/pull-request.instructions.md
cat .github/instructions/review.instructions.md

# Verify settings
cat .vscode/settings.json | grep -A 20 "github.copilot.chat"

# Test commit message generation
git add .
# Click the sparkle icon in VS Code Source Control view
```

## Next Steps

1. **Enable Automatic Code Review** (Optional)
   - See `.copilot/docs/README.automatic-code-review.md`
   - Configure in repository settings or organization-wide

2. **Customize for Your Workflow**
   - Add team-specific scopes to commit.instructions.md
   - Modify PR template sections as needed
   - Add organization-specific review criteria

3. **Train Your Team**
   - Share these instructions with all contributors
   - Run a training session on Conventional Commits
   - Review the PR template and expectations

4. **Monitor Effectiveness**
   - Track PR review times
   - Measure commit message quality
   - Gather team feedback on the templates

## References

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [GitHub PR Best Practices](https://docs.github.com/en/pull-requests)
- [Code Review Guidelines](https://google.github.io/eng-practices/review/)
- [Contributing Guide](../../CONTRIBUTING.md)
- [Copilot Custom Instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)

## Troubleshooting

### Copilot not using instructions

1. Verify files exist in `.github/instructions/`
2. Check `.vscode/settings.json` for correct paths
3. Reload VS Code window (`Ctrl+Shift+P` → "Developer: Reload Window")
4. Ensure Copilot is enabled and authenticated

### Instructions not applying

1. Check that `applyTo` glob patterns are correct
2. Verify frontmatter YAML is valid
3. Check VS Code output panel for Copilot errors
4. Update Copilot extension to latest version

### PR template not showing

1. Verify `pull_request_template.md` is in repository root
2. Check GitHub repository settings
3. Create PR via GitHub web interface to see template
4. Clear browser cache if template doesn't update

---

**Last Updated:** January 6, 2026  
**Status:** ✅ Complete and Configured
