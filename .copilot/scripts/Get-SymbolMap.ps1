<#
.SYNOPSIS
  Generate a symbol map (exports index) for Notionista TypeScript library.

.DESCRIPTION
  Scans src/ directories and extracts exported symbols with line numbers and kinds.
  Output is JSON and written to `.copilot/symbol-map.json` by default.
#>

param(
    [AllowNull()][AllowEmptyString()][string] $OutputPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path "$PSScriptRoot\..\..").ProviderPath
if (-not $PSBoundParameters.ContainsKey('OutputPath') -or [string]::IsNullOrWhiteSpace($OutputPath)) {
    $OutputPath = Join-Path $ProjectRoot '.copilot\symbol-map.json'
}

function Ensure-Directory([string] $Path) { if (-not (Test-Path -LiteralPath $Path)) { New-Item -ItemType Directory -Path $Path -Force | Out-Null } }

function Get-ExportsFromFile([string] $FilePath) {
    # Ensure we always work with an array-like collection
    $raw = Get-Content -LiteralPath $FilePath -ErrorAction SilentlyContinue
    if ($null -eq $raw) { return New-Object System.Collections.Generic.List[object] }
    $lines = @($raw)
    $exports = New-Object System.Collections.Generic.List[object]

    $patterns = @(
        @{ Kind = 'function';  Regex = [regex]'^\s*export\s+(?:async\s+)?function\s+(?<name>[A-Za-z_]\w*)\b' },
        @{ Kind = 'const';     Regex = [regex]'^\s*export\s+(?:const|let|var)\s+(?<name>[A-Za-z_]\w*)\b' },
        @{ Kind = 'class';     Regex = [regex]'^\s*export\s+class\s+(?<name>[A-Za-z_]\w*)\b' },
        @{ Kind = 'interface'; Regex = [regex]'^\s*export\s+interface\s+(?<name>[A-Za-z_]\w*)\b' },
        @{ Kind = 'type';      Regex = [regex]'^\s*export\s+type\s+(?<name>[A-Za-z_]\w*)\b' },
        @{ Kind = 'enum';      Regex = [regex]'^\s*export\s+enum\s+(?<name>[A-Za-z_]\w*)\b' },
        @{ Kind = 'default';   Regex = [regex]'^\s*export\s+default\b' }
    )

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        foreach ($p in $patterns) {
            $m = $p.Regex.Match($line)
            if (-not $m.Success) { continue }
            $name = if ($p.Kind -eq 'default') { 'default' } else { $m.Groups['name'].Value }
            $exports.Add([pscustomobject]@{ Name = $name; Kind = $p.Kind; Line = $i + 1 })
            break
        }
    }

    return $exports
}

Write-Host 'Scanning for exported symbols (Notionista)...' -ForegroundColor Cyan
Write-Host ('Root: {0}' -f $ProjectRoot) -ForegroundColor DarkGray

$scanDirs = @('src\core','src\domain','src\mcp','src\query','src\safety','src\schemas','src\workflows')

$allSymbols = [ordered]@{
    GeneratedAt = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    Categories  = [ordered]@{ Core=@(); Domain=@(); MCP=@(); Query=@(); Safety=@(); Schemas=@(); Workflows=@(); Utilities=@() }
    Symbols = @{}
}

foreach ($dir in $scanDirs) {
    $fullPath = Join-Path $ProjectRoot $dir
    if (-not (Test-Path -LiteralPath $fullPath)) { continue }
    Get-ChildItem -LiteralPath $fullPath -Recurse -File -Include *.ts,*.tsx -ErrorAction SilentlyContinue | ForEach-Object {
        $filePath = $_.FullName
        Write-Host ('Processing: {0}' -f $filePath) -ForegroundColor DarkGray
        try {
            $exports = Get-ExportsFromFile -FilePath $filePath
        } catch {
            Write-Warning ("Failed to parse exports from: {0} — {1}" -f $filePath, $_.Exception.Message)
            return
        }
        if (-not $exports -or $exports.Count -eq 0) { return }
        $relative = ($filePath.Substring($ProjectRoot.Length)).TrimStart('\','/') -replace '\\','/'
        $key = './' + $relative
        $allSymbols.Symbols[$key] = $exports
    }
}

# Categorize
foreach ($file in $allSymbols.Symbols.Keys) {
    $exports = $allSymbols.Symbols[$file]
    $isCoreModule = $file -like './src/core/*'
    $isDomainModule = $file -like './src/domain/*'
    $isMcpModule = $file -like './src/mcp/*'
    $isQueryModule = $file -like './src/query/*'
    $isSafetyModule = $file -like './src/safety/*'
    $isSchemasModule = $file -like './src/schemas/*'
    $isWorkflowsModule = $file -like './src/workflows/*'
    $isMainIndex = $file -eq './src/index.ts'
    foreach ($sym in $exports) {
        $entry = [pscustomobject]@{ File = $file; Name = $sym.Name; Kind = $sym.Kind; Line = $sym.Line }
        if ($isCoreModule -or $isMainIndex) { $allSymbols.Categories.Core += $entry }
        if ($isDomainModule) { $allSymbols.Categories.Domain += $entry }
        if ($isMcpModule) { $allSymbols.Categories.MCP += $entry }
        if ($isQueryModule) { $allSymbols.Categories.Query += $entry }
        if ($isSafetyModule) { $allSymbols.Categories.Safety += $entry }
        if ($isSchemasModule) { $allSymbols.Categories.Schemas += $entry }
        if ($isWorkflowsModule) { $allSymbols.Categories.Workflows += $entry }
        if (-not ($isCoreModule -or $isDomainModule -or $isMcpModule -or $isQueryModule -or $isSafetyModule -or $isSchemasModule -or $isWorkflowsModule)) { $allSymbols.Categories.Utilities += $entry }
    }
}

Ensure-Directory (Split-Path -Parent $OutputPath)
$allSymbols | ConvertTo-Json -Depth 12 | Out-File -LiteralPath $OutputPath -Encoding utf8

Write-Host ('Symbol map saved: {0}' -f $OutputPath) -ForegroundColor Green
Write-Host ('  Files indexed:  {0}' -f $allSymbols.Symbols.Keys.Count) -ForegroundColor DarkGray
Write-Host ('  Core:           {0}' -f $allSymbols.Categories.Core.Count) -ForegroundColor DarkGray
Write-Host ('  Domain:         {0}' -f $allSymbols.Categories.Domain.Count) -ForegroundColor DarkGray
Write-Host ('  MCP:            {0}' -f $allSymbols.Categories.MCP.Count) -ForegroundColor DarkGray
Write-Host ('  Query:          {0}' -f $allSymbols.Categories.Query.Count) -ForegroundColor DarkGray
Write-Host ('  Safety:         {0}' -f $allSymbols.Categories.Safety.Count) -ForegroundColor DarkGray
Write-Host ('  Schemas:        {0}' -f $allSymbols.Categories.Schemas.Count) -ForegroundColor DarkGray
Write-Host ('  Workflows:      {0}' -f $allSymbols.Categories.Workflows.Count) -ForegroundColor DarkGray
Write-Host ('  Utilities:      {0}' -f $allSymbols.Categories.Utilities.Count) -ForegroundColor DarkGray
