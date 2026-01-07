# push-to-github.ps1
# Commit + push automatiquement tous les changements locaux vers GitHub (branche main)

$ErrorActionPreference = "Stop"

# ⚠️ Mets l'URL exacte de ton repo (avec .git)
$repoUrl = "https://github.com/Samuel-BAHIA/Budget-FullStack.git"

function Write-Step($msg) {
  Write-Host "`n==> $msg" -ForegroundColor Cyan
}

try {
  Write-Step "Vérification: on est bien dans un repo git"
  git rev-parse --is-inside-work-tree *> $null

  Write-Step "Configuration du remote origin"
  $hasOrigin = (git remote) -contains "origin"
  if ($hasOrigin) {
    git remote set-url origin $repoUrl
  } else {
    git remote add origin $repoUrl
  }

  Write-Step "Passage sur la branche main (création si besoin)"
  $currentBranch = (git branch --show-current).Trim()
  if ($currentBranch -ne "main") {
    # Si main existe déjà: switch, sinon création
    $mainExists = (git branch --list "main").Count -gt 0
    if ($mainExists) {
      git switch main
    } else {
      git switch -c main
    }
  }

  Write-Step "Ajout de tous les changements (add -A)"
  git add -A

  Write-Step "Vérification: y a-t-il quelque chose à commit ?"
  # Si rien à commit, git diff --cached --quiet retourne 0
  git diff --cached --quiet
  $hasStagedChanges = ($LASTEXITCODE -ne 0)

  if (-not $hasStagedChanges) {
    Write-Host "Aucun changement à commit. Push inutile." -ForegroundColor Yellow
    exit 0
  }

  # Message de commit auto, avec timestamp
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $commitMsg = "Auto-commit: $timestamp"

  Write-Step "Commit: $commitMsg"
  git commit -m $commitMsg

  Write-Step "Push vers origin/main"
  git push -u origin main

  Write-Host "`n✅ Changements envoyés sur GitHub !" -ForegroundColor Green
}
catch {
  Write-Host "`n❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
