<#
.SYNOPSIS
  Lightweight codebase analysis that writes JSON summary to .copilot/analysis
#>

param(
    [AllowNull()][AllowEmptyString()][string] $OutputDir
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path "$PSScriptRoot\..\..").ProviderPath
if (-not $OutputDir -or [string]::IsNullOrWhiteSpace($OutputDir)) { $OutputDir = Join-Path $ProjectRoot '.copilot\analysis' }
if (-not (Test-Path -LiteralPath $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null }

function Get-FileLineCount([string] $Path) { try { return @(Get-Content -LiteralPath $Path -ErrorAction SilentlyContinue).Count } catch { return 0 } }

$keyDirs = @('src','test','tests','examples','config','snapshots','.copilot')
$structure = @()
$totalFiles = 0
$totalLines = 0
foreach ($d in $keyDirs) {
    $p = Join-Path $ProjectRoot $d
    if (-not (Test-Path -LiteralPath $p)) { continue }
    $files = Get-ChildItem -LiteralPath $p -Recurse -File -ErrorAction SilentlyContinue
    $fileCount = (@($files).Count)
    $lineSum = 0
    foreach ($f in $files) { $lineSum += (Get-FileLineCount $f.FullName) }
    $sizeKB = 0
    try { $sizeKB = [Math]::Round(((@($files) | Measure-Object -Property Length -Sum).Sum / 1KB), 2) } catch { $sizeKB = 0 }
    $structure += [pscustomobject]@{ Directory = $d; Path = $p; Files = $fileCount; Lines = $lineSum; SizeKB = $sizeKB }
    $totalFiles += $fileCount
    $totalLines += $lineSum
}

$report = [pscustomobject]@{
    GeneratedAt = (Get-Date).ToString('o')
    ProjectRoot = $ProjectRoot
    TotalFiles = $totalFiles
    TotalLines = $totalLines
    Directories = $structure
}

$out = Join-Path $OutputDir 'codebase-analysis.json'
$report | ConvertTo-Json -Depth 6 | Out-File -FilePath $out -Encoding UTF8
Write-Output "Wrote: $out"

exit 0
