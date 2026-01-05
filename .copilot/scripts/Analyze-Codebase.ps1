<#
.SYNOPSIS
    Comprehensive codebase analysis for AI onboarding.
.DESCRIPTION
    Produces:
      - codebase-analysis.json (structured)
      - codebase-analysis.md   (human-readable)
.PARAMETER OutputDir
    Output directory root. Default: <repo>/.copilot
.PARAMETER Format
    json | markdown | both
#>

param(
    [AllowNull()]
    [AllowEmptyString()]
    [string] $OutputDir,

    [ValidateSet("json","markdown","both")]
    [string] $Format = "both"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

if (-not $OutputDir -or [string]::IsNullOrWhiteSpace($OutputDir)) {
    # output root = <repo>/.copilot (not nested)
    $OutputDir = Join-Path $ProjectRoot ".copilot"
}

function Ensure-Directory([string] $Path) {
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Get-RelativePath([string] $FullPath) {
    $rp = (Resolve-Path -LiteralPath $FullPath).Path.Substring($ProjectRoot.Length).TrimStart('\','/')
    return "./" + ($rp -replace '\\','/')
}

function Get-FileLineCount([string] $Path) {
    try { return (Get-Content -LiteralPath $Path).Count } catch { return 0 }
}

function Find-ServerActionsInFile([string] $Path) {
    $lines = Get-Content -LiteralPath $Path
    $actions = New-Object System.Collections.Generic.List[object]

    # Heuristic: exported function/const likely server action in lib/actions
    $re = [regex]'^\s*export\s+(?:async\s+)?function\s+(?<name>[A-Za-z_]\w*)\b|^\s*export\s+const\s+(?<name2>[A-Za-z_]\w*)\s*='

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $m = $re.Match($lines[$i])
        if (-not $m.Success) { continue }

        $name = $m.Groups["name"].Value
        if ([string]::IsNullOrWhiteSpace($name)) { $name = $m.Groups["name2"].Value }
        if ([string]::IsNullOrWhiteSpace($name)) { continue }

        $actions.Add([pscustomobject]@{
            Name = $name
            Line = $i + 1
        })
    }

    return $actions
}

function Parse-PrismaModels([string] $SchemaPath) {
    if (-not (Test-Path -LiteralPath $SchemaPath)) { return @() }

    $lines = Get-Content -LiteralPath $SchemaPath
    $models = New-Object System.Collections.Generic.List[object]
    $current = $null
    $inModel = $false

    foreach ($line in $lines) {
        if ($line -match '^\s*model\s+([A-Za-z_]\w*)\s*\{') {
            $current = [ordered]@{ Name = $Matches[1]; Fields = @() }
            $inModel = $true
            continue
        }

        if ($inModel -and $line -match '^\s*\}') {
            $models.Add([pscustomobject]$current)
            $current = $null
            $inModel = $false
            continue
        }

        if ($inModel) {
            # field line: <name> <type> ...
            if ($line -match '^\s*([A-Za-z_]\w*)\s+([A-Za-z_]\w*(?:\[\])?|\w+\??)\b') {
                $fieldName = $Matches[1]
                $fieldType = $Matches[2]
                # Skip block attributes and comments
                if ($fieldName -in @("@@id","@@index","@@unique") -or $fieldName.StartsWith("@@") -or $fieldName.StartsWith("//")) { continue }
                if ($fieldName.StartsWith("@")) { continue }

                $current.Fields += [pscustomobject]@{ Name = $fieldName; Type = $fieldType }
            }
        }
    }

    return $models
}

Ensure-Directory $OutputDir

Write-Host "Analyzing codebase..." -ForegroundColor Cyan
Write-Host ("Root: {0}" -f $ProjectRoot) -ForegroundColor DarkGray
Write-Host ("Out:  {0}" -f $OutputDir) -ForegroundColor DarkGray

# Key directories (best-effort)
$keyDirs = @("app","components","lib","prisma","tests","types","public","scripts",".copilot")
$structure = [ordered]@{
    ProjectRoot = $ProjectRoot
    Timestamp   = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    Directories = @()
    FileStats   = [ordered]@{ TotalFiles = 0; TotalLines = 0 }
}

foreach ($d in $keyDirs) {
    $p = Join-Path $ProjectRoot $d
    if (-not (Test-Path -LiteralPath $p)) { continue }

    $files = Get-ChildItem -LiteralPath $p -Recurse -File -ErrorAction SilentlyContinue
    $lineSum = 0
    foreach ($f in $files) { $lineSum += (Get-FileLineCount $f.FullName) }

    $structure.Directories += [pscustomobject]@{
        Name  = $d
        Path  = $p
        Files = $files.Count
        Lines = $lineSum
        SizeKB = [Math]::Round(($files | Measure-Object -Property Length -Sum).Sum / 1KB, 2)
    }

    $structure.FileStats.TotalFiles += $files.Count
    $structure.FileStats.TotalLines += $lineSum
}

# Dependencies
$deps = [ordered]@{
    Production  = @()
    Development = @()
    Scripts     = @()
}

$packageJsonPath = Join-Path $ProjectRoot "package.json"
if (Test-Path -LiteralPath $packageJsonPath) {
    $pkg = Get-Content -LiteralPath $packageJsonPath -Raw | ConvertFrom-Json
    if ($pkg.dependencies) { $deps.Production = @($pkg.dependencies.psobject.Properties | ForEach-Object { @{ Name=$_.Name; Version=$_.Value } }) }
    if ($pkg.devDependencies) { $deps.Development = @($pkg.devDependencies.psobject.Properties | ForEach-Object { @{ Name=$_.Name; Version=$_.Value } }) }
    if ($pkg.scripts) { $deps.Scripts = @($pkg.scripts.psobject.Properties | ForEach-Object { @{ Name=$_.Name; Command=$_.Value } }) }
}

# Routes
$routes = New-Object System.Collections.Generic.List[object]
$appDir = Join-Path $ProjectRoot "app"
if (Test-Path -LiteralPath $appDir) {
    Get-ChildItem -LiteralPath $appDir -Recurse -File -Filter "page.tsx" -ErrorAction SilentlyContinue | ForEach-Object {
        $rel = $_.FullName.Substring($appDir.Length).TrimStart('\')
        $route = "/" + (($rel -replace '\\','/') -replace '/page\.tsx$','')
        if ($route -eq "/") { $route = "/" }

        $isDynamic = $route -match '\[.+?\]'
        # Heuristic: public if under sign-in/sign-up/share or root; otherwise protected
        $isPublic = $route -match '^/(?:$|sign-in|sign-up|share)'
        $routes.Add([pscustomobject]@{
            Route    = $route
            IsPublic = [bool]$isPublic
            Dynamic  = [bool]$isDynamic
            File     = (Get-RelativePath $_.FullName)
        })
    }
}

# Server actions
$serverActions = New-Object System.Collections.Generic.List[object]
$actionsDir = Join-Path $ProjectRoot "lib\actions"
if (Test-Path -LiteralPath $actionsDir) {
    Get-ChildItem -LiteralPath $actionsDir -Recurse -File -Include *.ts -ErrorAction SilentlyContinue | ForEach-Object {
        $actions = Find-ServerActionsInFile $_.FullName
        $serverActions.Add([pscustomobject]@{
            File    = (Get-RelativePath $_.FullName)
            Lines   = (Get-FileLineCount $_.FullName)
            Actions = $actions
        })
    }
}

# Components by domain (top-level folder under components)
$components = [ordered]@{}
$componentsDir = Join-Path $ProjectRoot "components"
if (Test-Path -LiteralPath $componentsDir) {
    Get-ChildItem -LiteralPath $componentsDir -Directory -ErrorAction SilentlyContinue | ForEach-Object {
        $domain = $_.Name
        $files = Get-ChildItem -LiteralPath $_.FullName -Recurse -File -Include *.tsx, *.ts -ErrorAction SilentlyContinue
        $lineSum = 0
        foreach ($f in $files) { $lineSum += (Get-FileLineCount $f.FullName) }

        $components[$domain] = [pscustomobject]@{
            Files = $files.Count
            Lines = $lineSum
            FileList = @($files | ForEach-Object { (Get-RelativePath $_.FullName) })
        }
    }
}

# Types
$types = New-Object System.Collections.Generic.List[object]
$typesDir = Join-Path $ProjectRoot "types"
if (Test-Path -LiteralPath $typesDir) {
    Get-ChildItem -LiteralPath $typesDir -Recurse -File -Include *.ts -ErrorAction SilentlyContinue | ForEach-Object {
        $types.Add([pscustomobject]@{
            File  = (Get-RelativePath $_.FullName)
            Lines = (Get-FileLineCount $_.FullName)
        })
    }
}

# Tests
$tests = [ordered]@{
    Unit = @()
    E2E  = @()
}
$testsDir = Join-Path $ProjectRoot "tests"
if (Test-Path -LiteralPath $testsDir) {
    Get-ChildItem -LiteralPath $testsDir -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
        $rp = Get-RelativePath $_.FullName
        $isE2E = $rp -match '(?:/e2e/|\.e2e\.|playwright|cypress)'
        $bucket = if ($isE2E) { "E2E" } else { "Unit" }
        $tests[$bucket] += [pscustomobject]@{ File = $rp; Lines = (Get-FileLineCount $_.FullName) }
    }
}

# Prisma models
$schemaPath = Join-Path $ProjectRoot "prisma\schema.prisma"
$prismaModels = Parse-PrismaModels -SchemaPath $schemaPath

# Assemble report
$report = [ordered]@{
    Metadata = [ordered]@{
        ProjectRoot = $ProjectRoot
        GeneratedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    }
    Structure     = $structure
    Dependencies  = $deps
    Routes        = $routes
    ServerActions = $serverActions
    Components    = $components
    Types         = $types
    Tests         = $tests
    PrismaModels  = $prismaModels
}

# Output JSON
if ($Format -in @("json","both")) {
    $jsonPath = Join-Path $OutputDir "codebase-analysis.json"
    $report | ConvertTo-Json -Depth 12 | Out-File -LiteralPath $jsonPath -Encoding utf8
    Write-Host ("Wrote: {0}" -f $jsonPath) -ForegroundColor Green
}

# Output Markdown (minimal, predictable formatting)
if ($Format -in @("markdown","both")) {
    $mdPath = Join-Path $OutputDir "codebase-analysis.md"

    $routeCount = $routes.Count
    $publicCount = @($routes | Where-Object { $_.IsPublic }).Count
    $protectedCount = $routeCount - $publicCount

    $serverActionsCount = 0
    foreach ($f in $serverActions) { $serverActionsCount += $f.Actions.Count }

    $unitTestsCount = $tests.Unit.Count
    $e2eTestsCount = $tests.E2E.Count

    $prodDepsCount = @($deps.Production).Count
    $devDepsCount = @($deps.Development).Count

    $prismaModelCount = @($prismaModels).Count

    $md = New-Object System.Text.StringBuilder
    [void]$md.AppendLine("# Codebase Analysis Report")
    [void]$md.AppendLine()
    [void]$md.AppendLine("> Generated: $($report.Metadata.GeneratedAt)")
    [void]$md.AppendLine("> ProjectRoot: $($report.Metadata.ProjectRoot)")
    [void]$md.AppendLine()
    [void]$md.AppendLine("## Project Statistics")
    [void]$md.AppendLine()
    [void]$md.AppendLine("| Metric | Value |")
    [void]$md.AppendLine("|---|---:|")
    [void]$md.AppendLine("| Total Routes | $routeCount |")
    [void]$md.AppendLine("| Public Routes | $publicCount |")
    [void]$md.AppendLine("| Protected Routes (heuristic) | $protectedCount |")
    [void]$md.AppendLine("| Server Actions (heuristic) | $serverActionsCount |")
    [void]$md.AppendLine("| Prisma Models | $prismaModelCount |")
    [void]$md.AppendLine("| Unit Test Files | $unitTestsCount |")
    [void]$md.AppendLine("| E2E Test Files | $e2eTestsCount |")
    [void]$md.AppendLine("| Production Deps | $prodDepsCount |")
    [void]$md.AppendLine("| Dev Deps | $devDepsCount |")
    [void]$md.AppendLine()
    [void]$md.AppendLine("## Directory Structure")
    [void]$md.AppendLine()
    [void]$md.AppendLine("| Directory | Files | Lines | Size (KB) |")
    [void]$md.AppendLine("|---|---:|---:|---:|")
    foreach ($d in $structure.Directories) {
        [void]$md.AppendLine(("| `{0}` | {1} | {2} | {3} |" -f $d.Name, $d.Files, $d.Lines, $d.SizeKB))
    }
    [void]$md.AppendLine()
    [void]$md.AppendLine("## Routes")
    [void]$md.AppendLine()
    [void]$md.AppendLine("| Route | Public | Dynamic | File |")
    [void]$md.AppendLine("|---|:---:|:---:|---|")
    foreach ($r in ($routes | Sort-Object Route)) {
        [void]$md.AppendLine(("| `{0}` | {1} | {2} | `{3}` |" -f $r.Route, ($(if ($r.IsPublic) { "Yes" } else { "No" })), ($(if ($r.Dynamic) { "Yes" } else { "No" })), $r.File))
    }
    [void]$md.AppendLine()
    [void]$md.AppendLine("## Server Actions (heuristic)")
    [void]$md.AppendLine()
    foreach ($f in $serverActions) {
        [void]$md.AppendLine(("### `{0}` ({1} lines)" -f $f.File, $f.Lines))
        if ($f.Actions.Count -eq 0) {
            [void]$md.AppendLine("- (none detected)")
        } else {
            foreach ($a in $f.Actions) {
                [void]$md.AppendLine(("- `{0}()` (line {1})" -f $a.Name, $a.Line))
            }
        }
        [void]$md.AppendLine()
    }

    [void]$md.AppendLine("## Prisma Models")
    [void]$md.AppendLine()
    foreach ($m in $prismaModels) {
        [void]$md.AppendLine(("### {0} ({1} fields)" -f $m.Name, $m.Fields.Count))
        foreach ($field in $m.Fields) {
            [void]$md.AppendLine(("- `{0}`: {1}" -f $field.Name, $field.Type))
        }
        [void]$md.AppendLine()
    }

    $md.ToString() | Out-File -LiteralPath $mdPath -Encoding utf8
    Write-Host ("Wrote: {0}" -f $mdPath) -ForegroundColor Green
}
