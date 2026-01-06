<#
.SYNOPSIS
  Build context chunks from repository text files for RAG-friendly consumption.

DESCRIPTION
  Reads source files and splits them into chunks of approx `ChunkSize` characters,
  emitting `context-chunks.json` with entries { file, chunkIndex, text }.

#>

param(
    [int] $MaxChunkTokens = 2000,
    [AllowNull()] [AllowEmptyString()] [string] $OutputDir = $null
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Script and project roots
$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

if (-not $OutputDir -or [string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $ProjectRoot ".copilot\analysis"
}

function Ensure-Directory([string] $Path) {
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

# Approx tokens = chars / 4 (quick heuristic)
$MaxChunkChars = [Math]::Max(800, $MaxChunkTokens * 4)

function New-Chunk {
    param(
        [Parameter(Mandatory)] [string] $File,
        [Parameter(Mandatory)] [string] $Category,
        [Parameter(Mandatory)] [int] $StartLine,
        [Parameter(Mandatory)] [int] $EndLine,
        [Parameter(Mandatory)] [string] $Content
    )

    $rel = Resolve-Path -LiteralPath $File | ForEach-Object {
        $_.Path.Substring($ProjectRoot.Length).TrimStart('\','/')
    }
    $pathKey = "./" + ($rel -replace '\\','/')

    # Stable-ish identifier
    $hash = (Get-FileHash -Algorithm SHA256 -InputStream ([IO.MemoryStream]::new([Text.Encoding]::UTF8.GetBytes($Content)))).Hash

    return [pscustomobject]@{
        path        = $pathKey
        category    = $Category
        startLine   = $StartLine
        endLine     = $EndLine
        chars       = $Content.Length
        approxTokens = [Math]::Round($Content.Length / 4, 0)
        sha256      = $hash
        content     = $Content
    }
}

function Split-FileIntoChunks {
    param(
        [Parameter(Mandatory)] [string] $FilePath,
        [Parameter(Mandatory)] [string] $Category
    )

    $lines = @()
    try {
        $lines = @(Get-Content -LiteralPath $FilePath -ErrorAction Stop)
    } catch {
        return @()
    }

    if ($lines.Count -eq 0) { return @() }

    $contentAll = ($lines -join "`n")
    if ($contentAll.Length -le $MaxChunkChars) {
        return @(New-Chunk -File $FilePath -Category $Category -StartLine 1 -EndLine $lines.Count -Content $contentAll)
    }

    $boundary = [regex]'^\s*(export\b|export\s+default\b|function\b|class\b|interface\b|type\b|const\b|async\s+function\b)\b'

    $chunks = New-Object System.Collections.Generic.List[object]
    $current = New-Object System.Text.StringBuilder
    $chunkStart = 1
    $lineNo = 0

    foreach ($line in $lines) {
        $lineNo++

        $wouldOverflow = ($current.Length + $line.Length + 1) -gt $MaxChunkChars
        $isBoundary = $boundary.IsMatch($line)

        if ($current.Length -gt 0 -and $wouldOverflow -and $isBoundary) {
            $chunkContent = $current.ToString().TrimEnd()
            $chunks.Add((New-Chunk -File $FilePath -Category $Category -StartLine $chunkStart -EndLine ($lineNo - 1) -Content $chunkContent))

            $current.Clear() | Out-Null
            $chunkStart = $lineNo
        }

        [void]$current.AppendLine($line)
    }

    if ($current.Length -gt 0) {
        $chunkContent = $current.ToString().TrimEnd()
        $chunks.Add((New-Chunk -File $FilePath -Category $Category -StartLine $chunkStart -EndLine $lines.Count -Content $chunkContent))
    }

    return $chunks
}

Write-Host "Building context chunks (Notionista)..." -ForegroundColor Cyan
Ensure-Directory $OutputDir

$all = [ordered]@{
    GeneratedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    ChunkSettings = [ordered]@{
        MaxTokens = $MaxChunkTokens
        MaxChars  = $MaxChunkChars
        TokenHeuristic = "approxTokens = chars / 4"
    }
    Chunks = @()
}

$targets = [ordered]@{
    "src\core\**\*.ts"      = "core"
    "src\domain\**\*.ts"    = "domain"
    "src\mcp\**\*.ts"       = "mcp"
    "src\query\**\*.ts"     = "query"
    "src\safety\**\*.ts"    = "safety"
    "src\schemas\**\*.ts"   = "schemas"
    "src\workflows\**\*.ts" = "workflows"
    "src\index.ts"          = "exports"
    "test\**\*.ts"          = "tests"
    "examples\*.ts"         = "examples"
}

foreach ($pattern in $targets.Keys) {
    $category = $targets[$pattern]
    $full = Join-Path $ProjectRoot $pattern

    $useRecurse = $pattern -like "*\**\*"

    if ($useRecurse) {
        $base = Join-Path $ProjectRoot ($pattern.Split("**")[0].TrimEnd('\'))
        $leaf = $pattern.Split("**")[-1].TrimStart('\')
        if (-not (Test-Path -LiteralPath $base)) { continue }

        Get-ChildItem -LiteralPath $base -Recurse -File -Filter $leaf -ErrorAction SilentlyContinue | ForEach-Object {
            $all.Chunks += Split-FileIntoChunks -FilePath $_.FullName -Category $category
        }
    } else {
        Get-ChildItem -Path $full -File -ErrorAction SilentlyContinue | ForEach-Object {
            $all.Chunks += Split-FileIntoChunks -FilePath $_.FullName -Category $category
        }
    }
}

$totalTokens = 0.0
$byCategory = @{}
foreach ($c in $all.Chunks) {
    $totalTokens += [double]$c.approxTokens
    if (-not $byCategory.ContainsKey($c.category)) {
        $byCategory[$c.category] = [pscustomobject]@{ category = $c.category; chunks = 0; approxTokens = 0.0 }
    }
    $byCategory[$c.category].chunks++
    $byCategory[$c.category].approxTokens += [double]$c.approxTokens
}

$all.Index = [ordered]@{
    TotalChunks = $all.Chunks.Count
    TotalTokens = $totalTokens
    ByCategory  = $byCategory.Values
}

$chunksPath = Join-Path $OutputDir "context-chunks.json"
$all | ConvertTo-Json -Depth 12 | Out-File -LiteralPath $chunksPath -Encoding utf8

Write-Host ("Context chunks saved: {0}" -f $chunksPath) -ForegroundColor Green
Write-Host ("  Total chunks: {0}" -f $all.Index.TotalChunks) -ForegroundColor DarkGray
Write-Host ("  Total tokens (approx): {0}" -f [Math]::Round($all.Index.TotalTokens, 0)) -ForegroundColor DarkGray
