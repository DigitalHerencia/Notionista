# 🧰 Context Scripts

Scripts for generating and validating context artifacts for AI-driven development. These scripts ensure GitHub Copilot and companion agents have accurate, up-to-date information about your repository.

## How to Use Context Scripts

**To Run Scripts:**

- Open a terminal in the repository root.
- Use the provided PowerShell commands to execute individual scripts or the orchestrator.
- Follow the recommended usage guidelines for each script.

**To Integrate with CI/CD:**

- Add the orchestrator script (`Run-AllAnalysis.ps1`) to your pipeline.
- Ensure the environment meets the prerequisites by running `Test-DevEnvironment.ps1`.

| Script                  | Description                                     | Output                                           | Recommended Usage                              |
| ----------------------- | ----------------------------------------------- | ------------------------------------------------ | ---------------------------------------------- |
| **Test-DevEnvironment** | Validates toolchain readiness.                  | Console report                                   | Before first run; after tool updates.          |
| **Analyze-Codebase**    | Extracts repository structure and dependencies. | `codebase-analysis.json`, `codebase-analysis.md` | After major changes to routes or dependencies. |
| **Get-SymbolMap**       | Indexes all exported symbols.                   | `symbol-map.json`                                | After refactoring or export changes.           |
| **Build-ContextChunks** | Creates RAG-friendly semantic code chunks.      | `context-chunks.json`                            | Before large Copilot tasks.                    |
| **Run-AllAnalysis**     | Orchestrates all scripts and validates output.  | All above + console status                       | Milestone checkpoints; CI/CD integration.      |

### Usage Examples

#### Running Individual Scripts

```powershell
# Validate development environment
powershell ./Test-DevEnvironment.ps1

# Analyze repository structure
powershell ./Analyze-Codebase.ps1

# Generate symbol map
powershell ./Get-SymbolMap.ps1

# Build context chunks
powershell ./Build-ContextChunks.ps1
```

#### Running All Scripts

```powershell
# Run all scripts in sequence
powershell ./Run-AllAnalysis.ps1
```

### Best Practices

- **Keep Artifacts Fresh**: Run scripts regularly to ensure artifacts reflect the latest repository state.
- **Validate Before Tasks**: Use `Run-AllAnalysis.ps1` to validate artifacts before major Copilot operations.
- **Integrate with CI/CD**: Automate script execution in your CI/CD pipeline to maintain up-to-date context.
