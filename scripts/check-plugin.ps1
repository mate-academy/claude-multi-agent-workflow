#Requires -Version 5.1
<#
.SYNOPSIS
    Fast local checks for the api-quality plugin.

.DESCRIPTION
    Runs the checks that are quick enough to do often:

      1. Structural  - the repo grader plus the CLI's own manifest validation
      2. Load        - starts a session with --plugin-dir and confirms all four
                       components appear under the api-quality: namespace
      3. Hook        - drives hooks/lint-changed.js through its real payloads

    It does NOT run the full audit workflow. That spawns three subagents, takes
    minutes, and costs tokens - run it by hand when you want it:

      claude --plugin-dir . --permission-mode acceptEdits ``
        --allowedTools "Read Grep Glob Write Edit Bash Task" ``
        -p "/api-quality:audit course-api/"

.PARAMETER SkipLoad
    Skip check 2. That check starts a real Claude session, so it takes ~30s and
    costs tokens; checks 1 and 3 are instant and free.

.EXAMPLE
    .\scripts\check-plugin.ps1

.EXAMPLE
    .\scripts\check-plugin.ps1 -SkipLoad

.NOTES
    Exit code 0 if everything passed, 1 if anything failed.
#>
[CmdletBinding()]
param(
    [switch]$SkipLoad
)

$ErrorActionPreference = 'Continue'

$root = Split-Path -Parent $PSScriptRoot
$script:Passed = 0
$script:Failed = 0
$script:Skipped = 0

function Write-Section([string]$Title) {
    Write-Host ''
    Write-Host "== $Title " -ForegroundColor Cyan -NoNewline
    Write-Host ('=' * [Math]::Max(0, 58 - $Title.Length)) -ForegroundColor Cyan
}

function Add-Pass([string]$Name, [string]$Detail) {
    $script:Passed++
    Write-Host '  PASS ' -ForegroundColor Green -NoNewline
    Write-Host $Name -NoNewline
    if ($Detail) { Write-Host "  ($Detail)" -ForegroundColor DarkGray } else { Write-Host '' }
}

function Add-Fail([string]$Name, [string]$Detail) {
    $script:Failed++
    Write-Host '  FAIL ' -ForegroundColor Red -NoNewline
    Write-Host $Name -NoNewline
    if ($Detail) { Write-Host "  ($Detail)" -ForegroundColor Yellow } else { Write-Host '' }
}

function Add-Skip([string]$Name, [string]$Detail) {
    $script:Skipped++
    Write-Host '  SKIP ' -ForegroundColor DarkYellow -NoNewline
    Write-Host $Name -NoNewline
    if ($Detail) { Write-Host "  ($Detail)" -ForegroundColor DarkGray } else { Write-Host '' }
}

# Feed a hook payload to lint-changed.js and return its exit code.
# The payload is built with ConvertTo-Json on purpose: Windows paths are full of
# backslashes, JSON needs them doubled, and a hand-written string that gets this
# wrong makes the hook bail on "file not found" with exit 0 - which is
# indistinguishable from a genuine pass. Never hand-write this JSON.
function Invoke-Hook {
    param(
        [string]$FilePath,
        [string]$RawStdin
    )

    $hookScript = Join-Path $root 'hooks\lint-changed.js'

    if ($PSBoundParameters.ContainsKey('RawStdin')) {
        $payload = $RawStdin
    }
    else {
        $payload = @{
            tool_name  = 'Edit'
            tool_input = @{ file_path = $FilePath }
        } | ConvertTo-Json -Compress
    }

    $payload | & node $hookScript 2>$null | Out-Null
    return $LASTEXITCODE
}

function Test-HookCase {
    param(
        [string]$Name,
        [int]$Expected,
        [string]$FilePath,
        [string]$RawStdin
    )

    if ($PSBoundParameters.ContainsKey('RawStdin')) {
        $actual = Invoke-Hook -RawStdin $RawStdin
    }
    else {
        $actual = Invoke-Hook -FilePath $FilePath
    }

    if ($actual -eq $Expected) {
        Add-Pass $Name "exit $actual"
    }
    else {
        Add-Fail $Name "exit $actual, expected $Expected"
    }
}

Push-Location $root
try {
    Write-Host ''
    Write-Host 'api-quality plugin checks' -ForegroundColor White
    Write-Host $root -ForegroundColor DarkGray

    # --- Prerequisites -----------------------------------------------------
    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if (-not $nodeCmd) {
        Write-Host ''
        Write-Host 'node is not on PATH - cannot run any checks.' -ForegroundColor Red
        exit 1
    }
    $claudeCmd = Get-Command claude -ErrorAction SilentlyContinue

    # --- 1. Structural -----------------------------------------------------
    Write-Section 'Structural'

    & node (Join-Path $root '.github\scripts\validate-plugin.js') | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Add-Pass 'repo grader (validate-plugin.js)'
    }
    else {
        Add-Fail 'repo grader (validate-plugin.js)' 'run it directly to see which item is missing'
    }

    if ($claudeCmd) {
        & claude plugin validate . | Out-Null
        if ($LASTEXITCODE -eq 0) { Add-Pass 'claude plugin validate (plugin.json)' }
        else { Add-Fail 'claude plugin validate (plugin.json)' }

        & claude plugin validate (Join-Path $root '.claude-plugin\marketplace.json') | Out-Null
        if ($LASTEXITCODE -eq 0) { Add-Pass 'claude plugin validate (marketplace.json)' }
        else { Add-Fail 'claude plugin validate (marketplace.json)' }
    }
    else {
        Add-Skip 'claude plugin validate' 'claude CLI not on PATH'
    }

    # plugin.json and marketplace.json must agree on the name, or the install id breaks.
    try {
        $manifest = Get-Content (Join-Path $root '.claude-plugin\plugin.json') -Raw | ConvertFrom-Json
        $market = Get-Content (Join-Path $root '.claude-plugin\marketplace.json') -Raw | ConvertFrom-Json
        $entry = $market.plugins | Where-Object { $_.name -eq $manifest.name }
        if ($entry -and $entry.source) {
            Add-Pass 'manifest names agree' "$($manifest.name)@$($market.name)"
        }
        elseif ($entry) {
            Add-Fail 'manifest names agree' 'marketplace entry has no "source"'
        }
        else {
            Add-Fail 'manifest names agree' "no marketplace entry named '$($manifest.name)'"
        }
    }
    catch {
        Add-Fail 'manifest names agree' $_.Exception.Message
    }

    # Component folders belong at the root; only manifests live in .claude-plugin/.
    $misplaced = @()
    foreach ($dir in @('commands', 'agents', 'skills', 'hooks')) {
        if (Test-Path (Join-Path $root ".claude-plugin\$dir")) { $misplaced += $dir }
    }
    if ($misplaced.Count -eq 0) {
        Add-Pass 'component folders at root'
    }
    else {
        Add-Fail 'component folders at root' "inside .claude-plugin/: $($misplaced -join ', ')"
    }

    # --- 2. Load -----------------------------------------------------------
    Write-Section 'Load'

    if ($SkipLoad) {
        Add-Skip 'plugin loads via --plugin-dir' '-SkipLoad was passed'
    }
    elseif (-not $claudeCmd) {
        Add-Skip 'plugin loads via --plugin-dir' 'claude CLI not on PATH'
    }
    else {
        Write-Host '  (starting a session, ~30s)' -ForegroundColor DarkGray
        $prompt = 'List the namespaced names of everything the api-quality plugin provides in this session. Names only, no tools, no commentary.'
        $reply = & claude --plugin-dir . -p $prompt

        if ($reply) { $text = ($reply -join "`n") } else { $text = '' }
        $expected = @(
            'api-quality:api-reviewer',
            'api-quality:api-test-writer',
            'api-quality:audit',
            'api-quality:api-conventions'
        )
        $missing = @($expected | Where-Object { $text -notlike "*$_*" })

        if ($missing.Count -eq 0) {
            Add-Pass 'all 4 components load' 'agents, command, skill'
        }
        else {
            Add-Fail 'all 4 components load' "missing: $($missing -join ', ')"
        }
    }

    # --- 3. Hook -----------------------------------------------------------
    Write-Section 'Hook'

    $eslintEntry = Join-Path $root 'course-api\node_modules\eslint\bin\eslint.js'
    $depsInstalled = Test-Path $eslintEntry

    # Quiet paths: the hook must stay out of the way and never crash.
    Test-HookCase -Name 'clean file stays silent' -Expected 0 `
        -FilePath (Join-Path $root 'course-api\routes\users.js')
    Test-HookCase -Name 'non-JS file ignored' -Expected 0 `
        -FilePath (Join-Path $root 'README.md')
    Test-HookCase -Name 'JS outside course-api ignored' -Expected 0 `
        -FilePath (Join-Path $root '.github\scripts\validate-plugin.js')
    Test-HookCase -Name 'garbage stdin does not crash' -Expected 0 -RawStdin 'not json at all'
    Test-HookCase -Name 'empty stdin does not crash' -Expected 0 -RawStdin ''
    Test-HookCase -Name 'missing file_path handled' -Expected 0 `
        -RawStdin '{"tool_name":"Edit","tool_input":{}}'

    # The one that actually matters: a lint-dirty file must block with exit 2.
    if (-not $depsInstalled) {
        Add-Skip 'lint-dirty file blocks (exit 2)' 'run: cd course-api; npm install'
    }
    else {
        $tempFile = Join-Path $root 'course-api\routes\_hookcheck.js'
        try {
            # WriteAllText gives UTF-8 with no BOM, which is what ESLint expects.
            [System.IO.File]::WriteAllText($tempFile, "const unused = 1;`nfoo(`n")
            Test-HookCase -Name 'lint-dirty file blocks (exit 2)' -Expected 2 -FilePath $tempFile
        }
        finally {
            if (Test-Path $tempFile) { Remove-Item $tempFile -Force }
        }
    }

    # --- Summary -----------------------------------------------------------
    Write-Section 'Summary'
    Write-Host "  passed  $script:Passed" -ForegroundColor Green
    if ($script:Skipped -gt 0) { Write-Host "  skipped $script:Skipped" -ForegroundColor DarkYellow }
    if ($script:Failed -gt 0) {
        Write-Host "  failed  $script:Failed" -ForegroundColor Red
        Write-Host ''
        exit 1
    }
    Write-Host '  failed  0'
    Write-Host ''
    Write-Host '  All checks passed.' -ForegroundColor Green
    Write-Host ''
    exit 0
}
finally {
    Pop-Location
}
