<#
.SYNOPSIS
    Master script to run all analysis and generate comprehensive reports
.DESCRIPTION
    Orchestrates all analysis scripts and generates a unified report
    optimized for AI agent onboarding.
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
╔══════════════════════════════════════════════════════════════╗
║             NOTIONISTA - AI AGENT ONBOARDING SYSTEM          ║
║                    Analysis Suite v1.0                       ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$startTime = Get-Date

# Run environment check
Write-Host "`n[1/4] Environment Validation" -ForegroundColor Magenta
& "$ScriptDir\Test-DevEnvironment.ps1"

# Run codebase analysis
Write-Host "`n[2/4] Codebase Structure Analysis" -ForegroundColor Magenta
& "$ScriptDir\Analyze-Codebase.ps1" -OutputDir $OutputDir -Format "both"

# Generate symbol map
Write-Host "`n[3/4] Symbol Map Generation" -ForegroundColor Magenta
& "$ScriptDir\Get-SymbolMap.ps1" -OutputPath (Join-Path $OutputDir "symbol-map.json")

# Build context chunks
Write-Host "`n[4/4] Context Chunk Generation" -ForegroundColor Magenta
& "$ScriptDir\Build-ContextChunks.ps1" -OutputDir $OutputDir -MaxChunkTokens 2000

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                    ANALYSIS COMPLETE                         ║
╠══════════════════════════════════════════════════════════════╣
║  Duration: $($duration.ToString                              ║           ║  ("mm\:ss"))                                                 ║
║  Output: $OutputDir                                          ║
║                                                              ║
║  Generated Artifacts:                                        ║
║  • codebase-analysis.json    - Full structure data           ║
║  • codebase-analysis.md      - Human-readable report         ║
║  • symbol-map.json           - Exported symbols index        ║
║  • context-chunks.json       - RAG-optimized chunks          ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green
