---
description: Initialize Git repository and push to GitHub
---

# Git Initialization & Push

This workflow initializes the git repository, commits all changes, and pushes to the 'ondo-today' repository.

```powershell
# 1. Initialize Git
git init

# 2. Add all files
git add .

# 3. Create initial commit
git commit -m "feat: Finalize MVP with Living Diorama, Namsan Signal, and Winter Frost effects"

# 4. Add remote (Using standard GitHub URL format)
# Note: User will need to ensure the repo 'ondo-today' exists or is created
git remote add origin https://github.com/ilmagnificho/ondo-today.git

# 5. Push to main
# Using --set-upstream to establish tracking
git branch -M main
git push -u origin main
```
