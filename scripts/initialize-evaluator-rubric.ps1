param(
    [string]$Path = "evaluator-rubric.md",
    [string]$Updated = "TBD"
)

$ErrorActionPreference = "Stop"

function Get-ResolvedFilePath {
    param([string]$InputPath)

    $resolvedPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($InputPath)
    if (-not (Test-Path -LiteralPath $resolvedPath -PathType Leaf)) {
        throw "Evaluator rubric file not found: $resolvedPath"
    }

    return $resolvedPath
}

function Reset-ScorecardSection {
    param([string]$Text)

    $match = [regex]::Match($Text, "(?ms)(## Scorecard\s*\r?\n)(.*?)(?=\r?\n## |\z)")
    if (-not $match.Success) {
        throw "Could not find required section: ## Scorecard"
    }

    $heading = $match.Groups[1].Value
    $body = $match.Groups[2].Value
    $denominator = "150"
    $scoreMatch = [regex]::Match($body, "Current score:\s*.*?/\s*([0-9]+)")
    if ($scoreMatch.Success) {
        $denominator = $scoreMatch.Groups[1].Value
    }

    $lines = $body -split "\r?\n"
    $outLines = New-Object System.Collections.Generic.List[string]
    $scoreLineWritten = $false

    foreach ($line in $lines) {
        if ($line -match "^\s*\|\s*Criterion\s*\|\s*Points\s*\|\s*Current\s*\|\s*Evidence\s*\|\s*$") {
            $outLines.Add("| Criterion | Points | Current | Evidence |")
            continue
        }

        if ($line -match "^\s*\|\s*-+\s*\|\s*:?-+:?\s*\|\s*:?-+:?\s*\|\s*-+\s*\|\s*$") {
            $outLines.Add("| --- | ---: | ---: | --- |")
            continue
        }

        if ($line -match "^\s*\|.*\|\s*$") {
            $columns = $line.Trim() -split "\|"
            $cells = @()
            foreach ($column in $columns) {
                $cell = $column.Trim()
                if ($cell.Length -gt 0) {
                    $cells += $cell
                }
            }

            if ($cells.Count -ge 4) {
                $outLines.Add("| $($cells[0]) | $($cells[1]) | 0 | TBD |")
                continue
            }
        }

        if ($line -match "^\s*Current score:") {
            if (-not $scoreLineWritten) {
                $outLines.Add("Current score: 0 / $denominator")
                $scoreLineWritten = $true
            }
            continue
        }

        if ($line.Trim().Length -eq 0) {
            $outLines.Add($line)
        }
    }

    if (-not $scoreLineWritten) {
        if ($outLines.Count -gt 0 -and $outLines[$outLines.Count - 1].Trim().Length -ne 0) {
            $outLines.Add("")
        }
        $outLines.Add("Current score: 0 / $denominator")
    }

    $replacement = $heading + (($outLines -join "`n").TrimEnd()) + "`n"
    return $Text.Remove($match.Index, $match.Length).Insert($match.Index, $replacement)
}

function Reset-MarkdownSection {
    param(
        [string]$Text,
        [string]$Heading,
        [string]$Body
    )

    $escapedHeading = [regex]::Escape($Heading)
    $pattern = "(?ms)($escapedHeading\s*\r?\n)(.*?)(?=\r?\n## |\z)"
    $match = [regex]::Match($Text, $pattern)
    $replacement = "$Heading`n`n$Body`n"

    if ($match.Success) {
        return $Text.Remove($match.Index, $match.Length).Insert($match.Index, $replacement)
    }

    $verdictMatch = [regex]::Match($Text, "(?m)^## Verdict\s*$")
    if ($verdictMatch.Success) {
        return $Text.Insert($verdictMatch.Index, "$replacement`n")
    }

    return $Text.TrimEnd() + "`n`n$replacement"
}

$resolvedPath = Get-ResolvedFilePath -InputPath $Path
$content = [System.IO.File]::ReadAllText($resolvedPath)

if ($content -match "(?m)^Updated:\s*.*$") {
    $content = [regex]::Replace($content, "(?m)^Updated:\s*.*$", "Updated: $Updated", 1)
} else {
    $titleMatch = [regex]::Match($content, "(?m)^# .*$")
    if ($titleMatch.Success) {
        $insertAt = $titleMatch.Index + $titleMatch.Length
        $content = $content.Insert($insertAt, "`n`nUpdated: $Updated")
    } else {
        $content = "Updated: $Updated`n`n$content"
    }
}

$content = Reset-ScorecardSection -Text $content
$content = Reset-MarkdownSection -Text $content -Heading "## Findings" -Body "- TBD"
$content = Reset-MarkdownSection -Text $content -Heading "## Verification Evidence" -Body "- TBD"
$content = Reset-MarkdownSection -Text $content -Heading "## Verdict" -Body "TBD"
$content = $content.TrimEnd() + "`n"

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($resolvedPath, $content, $utf8NoBom)

Write-Host "Initialized evaluator rubric: $resolvedPath"
