# push-to-github-new-design.ps1
# Commit + push automatiquement tous les changements locaux vers GitHub (branche new-design)

$ErrorActionPreference = "Stop"

# ⚠️ Mets l'URL exacte de ton repo (avec .git)
$repoUrl = "https://github.com/Samuel-BAHIA/Budget-FullStack.git"

# Nom de branche cible
$targetBranch = "new-design"

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

  Write-Step "Passage sur la branche $targetBranch (création si besoin)"
  $currentBranch = (git branch --show-current).Trim()
  if ($currentBranch -ne $targetBranch) {
    # Si la branche existe déjà en local, switch, sinon création
    $branchExists = (git branch --list $targetBranch).Count -gt 0
    if ($branchExists) {
      git switch $targetBranch
    } else {
      git switch -c $targetBranch
    }
  }

  Write-Step "Ajout de tous les changements (add -A)"
  git add -A

  Write-Step "Vérification: y a-t-il quelque chose à commit ?"
  git diff --cached --quiet
  $hasStagedChanges = ($LASTEXITCODE -ne 0)

  if (-not $hasStagedChanges) {
    Write-Host "Aucun changement à commit. Push inutile." -ForegroundColor Yellow
    exit 0
  }

  # Message de commit auto, avec timestamp
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $commitMsg = "Auto-commit ($targetBranch): $timestamp"

  Write-Step "Commit: $commitMsg"
  git commit -m $commitMsg

  Write-Step "Push vers origin/$targetBranch"
  git push -u origin $targetBranch

  Write-Host "`n✅ Changements envoyés sur GitHub (branche $targetBranch) !" -ForegroundColor Green
}
catch {
  Write-Host "`n❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
