# Git Workflow

## Branch Structure

- **`main`** - Production branch (stable, deployed code)
- **`develop`** - Staging/Integration branch (for testing and review)
- **`feature/*`** - Individual feature branches (for development)

## Workflow Process

### 1. Creating a New Feature
```bash
# Start from develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Developing the Feature
```bash
# Make changes, commit regularly
git add .
git commit -m "feat: describe your changes"

# Push feature branch to remote
git push -u origin feature/your-feature-name
```

### 3. Merging Feature to Develop (Staging)
```bash
# When feature is ready for testing
git checkout develop
git pull origin develop
git merge feature/your-feature-name

# Push to develop branch
git push origin develop
```

### 4. Review and Testing on Develop
- All features merged to `develop` branch
- Review code on `develop` branch
- Run tests on `develop` branch
- Fix any issues directly on `develop` if needed

### 5. Merging to Main (Production)
```bash
# After all tests pass on develop
git checkout main
git pull origin main
git merge develop

# Push to main
git push origin main
```

## Current Active Branches

- `feature/issue-1-entity-form-dialog`
- `feature/issue-2-repository-seam`
- `feature/issue-3-services-adapter` (current)

## Next Steps

1. Merge your current feature branches to `develop` when ready
2. Test on `develop` branch
3. After testing, merge `develop` to `main`

## Commands Reference

```bash
# List all branches
git branch -a

# Switch branches
git checkout <branch-name>

# Merge branches
git merge <branch-name>

# Push to remote
git push origin <branch-name>
```
