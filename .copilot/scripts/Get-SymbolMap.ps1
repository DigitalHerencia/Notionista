<#
.SYNOPSIS
    Generates a symbol map (exports index) for AI context.
.DESCRIPTION
    Scans key directories and extracts exported symbols with line numbers.
    Output is JSON and is intended for fast lookups / onboarding.
.PARAMETER OutputPath
    Output JSON file path. Default: <repo>/.copilot/onboarding/symbol-map.json
#>

param(
    [AllowNull()]
    [AllowEmptyString()]
    [string] $OutputPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not $PSBoundParameters.ContainsKey('OutputPath')) { $OutputPath = $null }

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

if (-not $OutputPath -or [string]::IsNullOrWhiteSpace($OutputPath)) {
    $OutputPath = Join-Path (Join-Path $ProjectRoot ".copilot") "symbol-map.json"
}

function Ensure-Directory([string] $Path) {
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Get-ExportsFromFile {
    param([Parameter(Mandatory)] [string] $FilePath)

    $lines = Get-Content -LiteralPath $FilePath
    $exports = New-Object System.Collections.Generic.List[object]

    # Note: keep regex conservative; aim for “good-enough” indexing, not a full TS parser.
    $patterns = @(
        @{ Kind = "function";   Regex = [regex]'^\s*export\s+(?:async\s+)?function\s+(?<name>[A-Za-z_]\w*)\b' },
        @{ Kind = "const";      Regex = [regex]'^\s*export\s+const\s+(?<name>[A-Za-z_]\w*)\b' },
        @{ Kind = "class";      Regex = [regex]'^\s*export\s+class\s+(?<name>[A-Za-z_]\w*)\b' },
        @{ Kind = "interface";  Regex = [regex]'^\s*export\s+interface\s+(?<name>[A-Za-z_]\w*)\b' },
        @{ Kind = "type";       Regex = [regex]'^\s*export\s+type\s+(?<name>[A-Za-z_]\w*)\b' },
        @{ Kind = "enum";       Regex = [regex]'^\s*export\s+enum\s+(?<name>[A-Za-z_]\w*)\b' },
        @{ Kind = "default";    Regex = [regex]'^\s*export\s+default\b' }
    )

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]

        foreach ($p in $patterns) {
            $m = $p.Regex.Match($line)
            if (-not $m.Success) { continue }

            $name = if ($p.Kind -eq "default") { "default" } else { $m.Groups["name"].Value }

            $exports.Add([pscustomobject]@{
                Name = $name
                Kind = $p.Kind
                Line = $i + 1
            })

            break
        }
    }

    return $exports
}

Write-Host ("Scanning for exported symbols (root: {0})..." -f $ProjectRoot) -ForegroundColor Cyan

$scanDirs = @(
    "lib\actions",
    "lib\fetchers",
    "lib\hooks",
    "lib",
    "types",
    "components"
)

$allSymbols = [ordered]@{
    GeneratedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    Categories  = [ordered]@{
        Hooks         = @()
        Types         = @()
        Components    = @()
        Functions     = @()
        ServerActions = @()
    }
    Symbols      = @{
    }
}

# Collect per-file exports
foreach ($dir in $scanDirs) {
    $fullPath = Join-Path $ProjectRoot $dir
    if (-not (Test-Path -LiteralPath $fullPath)) { continue }

    Get-ChildItem -LiteralPath $fullPath -Recurse -File -Include *.ts, *.tsx | ForEach-Object {
        $relative = Resolve-Path -LiteralPath $_.FullName | ForEach-Object {
            $_.Path.Substring($ProjectRoot.Length).TrimStart('\','/')
        }

        # Normalize to "./path" to match common tooling expectations
        $key = "./" + ($relative -replace '\\', '/')

        $exports = Get-ExportsFromFile -FilePath $_.FullName
        if ($exports.Count -eq 0) { return }

        $allSymbols.Symbols[$key] = $exports
    }
}

# Categorize
foreach ($file in $allSymbols.Symbols.Keys) {
    $exports = $allSymbols.Symbols[$file]
    $isHookPath = $file -like "./lib/hooks/*"
    $isActionPath = $file -like "./lib/actions/*"
    $isTypesPath = $file -like "./types/*"
    $isComponentPath = $file -like "./components/*"

    foreach ($sym in $exports) {
        $entry = [pscustomobject]@{
            File = $file
            Name = $sym.Name
            Kind = $sym.Kind
            Line = $sym.Line
        }

        if ($isActionPath) { $allSymbols.Categories.ServerActions += $entry }
        if ($isTypesPath -or $sym.Kind -in @("type","interface","enum")) { $allSymbols.Categories.Types += $entry }
        if ($isComponentPath) { $allSymbols.Categories.Components += $entry }
        if ($isHookPath -or ($sym.Name -like "use*")) { $allSymbols.Categories.Hooks += $entry }
        if ($sym.Kind -in @("function","const","class")) { $allSymbols.Categories.Functions += $entry }
    }
}

Ensure-Directory (Split-Path -Parent $OutputPath)

$allSymbols | ConvertTo-Json -Depth 12 | Out-File -LiteralPath $OutputPath -Encoding utf8

Write-Host ("Symbol map saved: {0}" -f $OutputPath) -ForegroundColor Green
Write-Host ("  Files indexed:  {0}" -f $allSymbols.Symbols.Keys.Count) -ForegroundColor DarkGray
Write-Host ("  ServerActions:  {0}" -f $allSymbols.Categories.ServerActions.Count) -ForegroundColor DarkGray
Write-Host ("  Types:          {0}" -f $allSymbols.Categories.Types.Count) -ForegroundColor DarkGray
Write-Host ("  Components:     {0}" -f $allSymbols.Categories.Components.Count) -ForegroundColor DarkGray
Write-Host ("  Hooks:          {0}" -f $allSymbols.Categories.Hooks.Count) -ForegroundColor DarkGray
