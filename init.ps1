$INSTALL_CMD = "corepack pnpm install"
$VERIFY_CMD = "corepack pnpm --filter @xmeta/web test"
$START_CMD = "corepack pnpm --filter @xmeta/web dev"

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$env:CI = "1"

function Get-PnpmPackageSpec {
    if (-not (Test-Path "package.json")) {
        return "pnpm"
    }

    $packageJson = Get-Content -Raw "package.json" | ConvertFrom-Json
    if ($packageJson.packageManager -and $packageJson.packageManager -like "pnpm@*") {
        return $packageJson.packageManager
    }

    return "pnpm"
}

function Invoke-ConfiguredCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Label,
        [Parameter(Mandatory = $true)]
        [string] $Command
    )

    if ([string]::IsNullOrWhiteSpace($Command)) {
        Write-Host ""
        Write-Host "==> $Label skipped: command is empty"
        return
    }

    Write-Host ""
    Write-Host "==> $Label"
    Write-Host "    $Command"

    $effectiveCommand = Resolve-ConfiguredCommand $Command
    if ($effectiveCommand -ne $Command) {
        Write-Host "    using: $effectiveCommand"
    }

    $global:LASTEXITCODE = 0
    Invoke-Expression $effectiveCommand

    if ($LASTEXITCODE -ne 0) {
        throw "$Label failed with exit code $LASTEXITCODE. Stop here and fix the baseline before adding new scope."
    }
}

function Resolve-ConfiguredCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Command
    )

    if ($Command -match "^\s*pnpm(\s|$)" -and -not (Get-Command "pnpm" -ErrorAction SilentlyContinue)) {
        return ($Command -replace "^\s*pnpm\b", "corepack pnpm")
    }

    return $Command
}

function Initialize-PnpmIfNeeded {
    $commands = @($INSTALL_CMD, $VERIFY_CMD, $START_CMD) -join " "
    if ($commands -notmatch "(^|\s)pnpm(\s|$)") {
        return
    }

    if (Get-Command "pnpm" -ErrorAction SilentlyContinue) {
        return
    }

    if (-not (Get-Command "corepack" -ErrorAction SilentlyContinue)) {
        throw "pnpm is required but was not found, and corepack is not available. Install pnpm or edit INSTALL_CMD, VERIFY_CMD, and START_CMD."
    }

    $pnpmSpec = Get-PnpmPackageSpec
    Invoke-ConfiguredCommand -Label "Preparing pnpm with Corepack" -Command "corepack prepare $pnpmSpec --activate"
}

Write-Host "Current directory:"
Write-Host (Get-Location).Path

Initialize-PnpmIfNeeded
Invoke-ConfiguredCommand -Label "Installing dependencies" -Command $INSTALL_CMD
Invoke-ConfiguredCommand -Label "Running verification" -Command $VERIFY_CMD

Write-Host ""
Write-Host "Verification passed."
Write-Host "Start command:"
Write-Host "    $START_CMD"

if ($env:RUN_START_COMMAND -eq "1") {
    Invoke-ConfiguredCommand -Label "Starting development server" -Command $START_CMD
}
else {
    Write-Host ""
    Write-Host 'Set RUN_START_COMMAND=1 before running .\init.ps1 to start the dev server automatically.'
}
