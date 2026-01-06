<#
.SYNOPSIS
  Quick dev-environment check for Notionista repository.

DESCRIPTION
  Verifies presence of key tools (PowerShell, Node, pnpm, git) and writes a JSON
  report to `.copilot/analysis/env-check.json`.

OUTPUTS
  JSON file: .copilot/analysis/env-check.json

#>

param()

Set-StrictMode -Version Latest

$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = (Resolve-Path "$PSScriptRoot\..\..").ProviderPath
$OutDir = Join-Path $RepoRoot '.copilot\analysis'
if (-not (Test-Path $OutDir)) { New-Item -Path $OutDir -ItemType Directory -Force | Out-Null }

function Command-Exists($cmd) {
    $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

function Get-Command-Info($cmd, $versionArgs) {
    if (Command-Exists $cmd) {
        try {
            $ver = & $cmd $versionArgs 2>$null
            $ver = ($ver -join "`n") -replace "\r|\n",""
        } catch {
            $ver = $null
        }
        return @{ found = $true; version = $ver }
    } else {
        return @{ found = $false; version = $null }
    }
}

$checks = [ordered]@{
    PowerShell = @{ found = $true; version = $PSVersionTable.PSVersion.ToString() }
    Node = Get-Command-Info -cmd 'node' -versionArgs '--version'
    pnpm = Get-Command-Info -cmd 'pnpm' -versionArgs '--version'
    git = Get-Command-Info -cmd 'git' -versionArgs '--version'
}

$ok = ($checks.Node.found -and $checks.pnpm.found -and $checks.git.found)

$report = [PSCustomObject]@{
    timestamp = (Get-Date).ToString('o')
    repositoryRoot = $RepoRoot
    checks = $checks
    ok = $ok
}

$outFile = Join-Path $OutDir 'env-check.json'
$report | ConvertTo-Json -Depth 6 | Out-File -FilePath $outFile -Encoding UTF8
Write-Output "Wrote environment report to: $outFile"

if ($ok) { exit 0 } else { exit 1 }
<#
.SYNOPSIS
    Validates the development environment for Notionista (Notion MCP TypeScript Library).
.DESCRIPTION
    Checks required tools, configurations, and project structure to ensure the dev
    environment is ready for TypeScript library development and testing.
    Designed to run from the repo's .copilot/scripts folder.
.OUTPUTS
    Exits with code 0 when all checks pass, otherwise 1.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Repo root is parent of ".copilot"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

function Write-Result {
    param(
        [Parameter(Mandatory)] [bool] $Ok,
        [Parameter(Mandatory)] [string] $Label,
        [string] $Details,
        [string] $Severity = "FAIL"
    )

    if ($Ok) {
        Write-Host ("  [✓]  {0}" -f $Label) -ForegroundColor Green
        if ($Details) { Write-Host ("        {0}" -f $Details) -ForegroundColor DarkGray }
    } else {
        Write-Host ("  [{0}] {1}" -f $Severity, $Label) -ForegroundColor $(if ($Severity -eq "WARN") { "Yellow" } else { "Red" })
        if ($Details) { Write-Host ("        {0}" -f $Details) -ForegroundColor DarkGray }
    }
}

function Test-Command {
    param(
        [Parameter(Mandatory)] [string] $Command,
        [Parameter(Mandatory)] [string] $DisplayName,
        [string[]] $VersionArgs = @("--version")
    )

    try {
        $cmd = Get-Command $Command -ErrorAction Stop
        $versionText = $null

        # Best-effort version capture (don’t fail the whole check if version args differ)
        try {
            $versionText = & $cmd.Source @VersionArgs 2>$null | Select-Object -First 1
        } catch {
            $versionText = $null
        }

        Write-Result -Ok $true -Label $DisplayName -Details ($versionText ?? $cmd.Source)
        return $true
    } catch {
        Write-Result -Ok $false -Label $DisplayName -Details "Not found on PATH (command: $Command)"
        return $false
    }
}

function Test-File {
    param(
        [Parameter(Mandatory)] [string] $Path,
        [Parameter(Mandatory)] [string] $DisplayName,
        [bool] $Optional = $false
    )

    $exists = Test-Path -LiteralPath $Path
    $severity = if ($Optional) { "WARN" } else { "FAIL" }
    Write-Result -Ok $exists -Label $DisplayName -Details $Path -Severity $severity
    return $exists
}

function Test-Directory {
    param(
        [Parameter(Mandatory)] [string] $Path,
        [Parameter(Mandatory)] [string] $DisplayName
    )

    $exists = Test-Path -LiteralPath $Path -PathType Container
    Write-Result -Ok $exists -Label $DisplayName -Details $Path
    return $exists
}

Write-Host ""
Write-Host "Notionista: Development Environment Check" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ("ProjectRoot: {0}" -f $ProjectRoot) -ForegroundColor DarkGray
Write-Host ""

$passed = 0
$failed = 0
$warnings = 0

Write-Host "Required Tools:" -ForegroundColor Yellow
@(
    @{ Cmd = "node"; Name = "Node.js" },
    @{ Cmd = "npm";  Name = "npm" },
    @{ Cmd = "npx";  Name = "npx" },
    @{ Cmd = "git";  Name = "Git" }
) | ForEach-Object {
    if (Test-Command -Command $_.Cmd -DisplayName $_.Name) { $passed++ } else { $failed++ }
}

Write-Host ""
Write-Host "Required Files:" -ForegroundColor Yellow
@(
    @{ Path = (Join-Path $ProjectRoot "package.json");      Name = "package.json" },
    @{ Path = (Join-Path $ProjectRoot "tsconfig.json");     Name = "tsconfig.json" },
    @{ Path = (Join-Path $ProjectRoot "tsup.config.ts");    Name = "tsup.config.ts (bundler)" },
    @{ Path = (Join-Path $ProjectRoot "vitest.config.ts");  Name = "vitest.config.ts (test runner)" },
    @{ Path = (Join-Path $ProjectRoot "README.md");         Name = "README.md" }
) | ForEach-Object {
    if (Test-File -Path $_.Path -DisplayName $_.Name) { $passed++ } else { $failed++ }
}

Write-Host ""
Write-Host "Project Structure (src/):" -ForegroundColor Yellow
@(
    @{ Path = (Join-Path $ProjectRoot "src"); Name = "src (main source)" },
    @{ Path = (Join-Path $ProjectRoot "src\core"); Name = "src/core (config, types, errors)" },
    @{ Path = (Join-Path $ProjectRoot "src\domain"); Name = "src/domain (entities, repositories)" },
    @{ Path = (Join-Path $ProjectRoot "src\mcp"); Name = "src/mcp (client, transport, tools)" },
    @{ Path = (Join-Path $ProjectRoot "src\query"); Name = "src/query (query builder)" },
    @{ Path = (Join-Path $ProjectRoot "src\safety"); Name = "src/safety (validation, diff, proposals)" },
    @{ Path = (Join-Path $ProjectRoot "src\schemas"); Name = "src/schemas (data schemas)" },
    @{ Path = (Join-Path $ProjectRoot "src\workflows"); Name = "src/workflows (sprint, standup, etc)" }
) | ForEach-Object {
    if (Test-Directory -Path $_.Path -DisplayName $_.Name) { $passed++ } else { $failed++ }
}

Write-Host ""
Write-Host "Test & Example Directories:" -ForegroundColor Yellow
@(
    @{ Path = (Join-Path $ProjectRoot "test"); Name = "test (unit tests)" },
    @{ Path = (Join-Path $ProjectRoot "examples"); Name = "examples (usage examples)" }
) | ForEach-Object {
    $item = $_
    if (Test-Directory -Path $item.Path -DisplayName $item.Name) { $passed++ } else { $failed++ }
}

Write-Host ""
Write-Host "Optional Package Managers:" -ForegroundColor Yellow
@(
    @{ Cmd = "pnpm"; Name = "pnpm" },
    @{ Cmd = "yarn"; Name = "yarn" }
) | ForEach-Object {
    $item = $_
    try {
        $cmd = Get-Command $item.Cmd -ErrorAction Stop
        $version = & $cmd.Source --version 2>$null | Select-Object -First 1
        Write-Result -Ok $true -Label $item.Name -Details $version
        $passed++
    } catch {
        Write-Result -Ok $true -Label $item.Name -Details "Not installed (optional)" -Severity "WARN"
        $warnings++
    }
}

Write-Host ""
Write-Host "TypeScript Tools:" -ForegroundColor Yellow
if (Test-Command -Command "tsc" -DisplayName "TypeScript Compiler") { $passed++ } else { $failed++ }

Write-Host ""
Write-Host "Environment & Configuration (Optional):" -ForegroundColor Yellow
@(
    @{ Path = (Join-Path $ProjectRoot ".env"); Name = ".env (Notion API token)" },
    @{ Path = (Join-Path $ProjectRoot ".env.local"); Name = ".env.local (local overrides)" },
    @{ Path = (Join-Path $ProjectRoot "config\databases.json"); Name = "config/databases.json (Notion DB IDs)" }
) | ForEach-Object {
    $exists = Test-Path -LiteralPath $_.Path
    if ($exists) {
        Write-Result -Ok $true -Label $_.Name -Details $_.Path
        $passed++
    } else {
        Write-Result -Ok $false -Label $_.Name -Details "Optional (configure Notion access)" -Severity "WARN"
        $warnings++
    }
}

Write-Host ""
Write-Host "Dependencies Installation:" -ForegroundColor Yellow
$nodeModules = Join-Path $ProjectRoot "node_modules"
if (Test-Path -LiteralPath $nodeModules) {
    Write-Result -Ok $true -Label "node_modules" -Details $nodeModules
    $passed++
} else {
    Write-Result -Ok $false -Label "node_modules" -Details "Run: npm install"
    $failed++
}

Write-Host ""
Write-Host "Snapshots & Data (Optional):" -ForegroundColor Yellow
$snapshots = Join-Path $ProjectRoot "snapshots"
if (Test-Path -LiteralPath $snapshots) {
    Write-Result -Ok $true -Label "snapshots/" -Details "Notion export data available"
    $passed++
} else {
    Write-Result -Ok $false -Label "snapshots/" -Details "Optional (for testing/reference)" -Severity "WARN"
    $warnings++
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host ("  Passed:  {0}" -f $passed) -ForegroundColor Green
Write-Host ("  Warnings: {0}" -f $warnings) -ForegroundColor $(if ($warnings -gt 0) { "Yellow" } else { "Green" })
Write-Host ("  Failed:  {0}" -f $failed) -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })

if ($failed -eq 0) {
    Write-Host ""
    Write-Host "✓ Environment ready for development." -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "✗ Environment has issues. Fix failures above and re-run." -ForegroundColor Red
exit 1
