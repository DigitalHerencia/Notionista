<#
.SYNOPSIS
  Run the full analysis pipeline: Test environment, analyze codebase, generate symbol map and context chunks.

DESCRIPTION
  Executes `Test-DevEnvironment.ps1`, `Analyze-Codebase.ps1`, `Get-SymbolMap.ps1`, and `Build-ContextChunks.ps1` in order.
  Writes outputs into `.copilot/analysis/`.

#>

param()

Set-StrictMode -Version Latest

$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = (Resolve-Path "$PSScriptRoot\..\..").ProviderPath

function Run-Script($name) {
    $scriptPath = Join-Path $PSScriptRoot $name
    if (-not (Test-Path $scriptPath)) { Write-Error "Missing script: $scriptPath"; return $false }
    Write-Output "--- Running $name ---"
    & pwsh -NoProfile -ExecutionPolicy Bypass -File $scriptPath
    if ($LASTEXITCODE -ne 0) { Write-Error "$name failed with exit code $LASTEXITCODE"; return $false }
    return $true
}

$steps = @('Test-DevEnvironment.ps1','Analyze-Codebase.ps1','Get-SymbolMap.ps1','Build-ContextChunks.ps1')

foreach ($s in $steps) {
    $ok = Run-Script $s
    if (-not $ok) { Write-Error "Pipeline aborted at $s"; exit 2 }
}

Write-Output "All analysis steps completed. Check .copilot/analysis for artifacts."
exit 0
<#
.SYNOPSIS
    Master script to run all analysis and generate comprehensive reports.
.DESCRIPTION
    Orchestrates all analysis scripts for Notionista (Notion MCP TypeScript Library)
    and generates unified onboarding artifacts optimized for AI agent development.
.PARAMETER OutputDir
    Output directory for artifacts. Default: <repo>/.copilot
#>

param(
    [string]$OutputDir
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

if (-not $PSBoundParameters.ContainsKey('OutputDir') -or [string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $ProjectRoot ".copilot"
}

if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║              NOTIONISTA - LIBRARY ANALYSIS SUITE               ║
║        Notion MCP TypeScript Library | Analysis v1.0           ║
╚════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$startTime = Get-Date

# Run environment check
Write-Host "`n[1/4] Environment Validation" -ForegroundColor Magenta
& "$ScriptDir\Test-DevEnvironment.ps1"

# Run codebase analysis
Write-Host "`n[2/4] TypeScript Library Structure Analysis" -ForegroundColor Magenta
& "$ScriptDir\Analyze-Codebase.ps1" -OutputDir $OutputDir -Format "both"

# Generate symbol map
Write-Host "`n[3/4] Public API Symbol Index" -ForegroundColor Magenta
& "$ScriptDir\Get-SymbolMap.ps1" -OutputPath (Join-Path $OutputDir "symbol-map.json")

# Build context chunks
Write-Host "`n[4/4] RAG Context Chunk Generation" -ForegroundColor Magenta
& "$ScriptDir\Build-ContextChunks.ps1" -OutputDir $OutputDir -MaxChunkTokens 2000

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host @"

╔════════════════════════════════════════════════════════════════╗
║                 ANALYSIS COMPLETE - NOTIONISTA                 ║
╠════════════════════════════════════════════════════════════════╣
║  Duration:            $($duration.ToString("mm\:ss"))
║  Output Directory:    $OutputDir
║                                                                ║
║  Generated Artifacts:                                          ║
║  ✓ codebase-analysis.json    Library structure & modules      ║
║  ✓ codebase-analysis.md      Human-readable architecture      ║
║  ✓ symbol-map.json           Exported symbols by module       ║
║  ✓ context-chunks.json       RAG-optimized code chunks        ║
║                                                                ║
║  Ready for AI-assisted development!                           ║
╚════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green
