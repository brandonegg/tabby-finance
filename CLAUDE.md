# Tabby Finance — Engineering Standards

## Git Workflow Policy

All engineering work MUST follow these rules:

1. **Never commit directly to `main` (or `master`).** Always create a feature branch first.
2. **Branch naming**: Use `<type>/<short-description>` (e.g., `feat/add-login-page`, `fix/api-timeout`, `chore/update-deps`).
3. **Commit on your feature branch**, then open a **pull request** targeting `main`.
4. **PRs require CTO review** before merging. Do not merge your own PRs.
5. **Keep PRs small and focused.** One logical change per PR.

### Workflow Summary

```
git checkout main && git pull
git checkout -b feat/my-feature
# ... do work, commit ...
git push -u origin feat/my-feature
gh pr create --title "..." --body "..."
# Wait for CTO review before merging
```

## Tech Stack

- **Framework**: Expo (React Native) with TypeScript
- **Package manager**: pnpm
