# Maestro Auth Workspace

This folder contains the Android-first Maestro foundation for Tabby's auth flows.

## Layout

- `auth-foundation.yaml`: smoke flow that verifies the login and signup screens expose stable selectors
- `subflows/assert-login-screen.yaml`: reusable assertions for the login form
- `subflows/assert-signup-screen.yaml`: reusable assertions for the signup form
- `subflows/open-signup.yaml`: helper for moving from login to signup
- `subflows/open-login.yaml`: helper for moving from signup back to login
- `subflows/open-profile-tab.yaml`: helper for opening the profile tab after authentication
- `subflows/sign-out-if-needed.yaml`: helper for resetting back to login when a signed-in session already exists

## Local Android workflow

1. Start the Expo app on Android with `pnpm android`.
2. Wait for the auth screen or authenticated app shell to load on the emulator.
3. Run `pnpm maestro:auth:foundation` to validate the selectors and auth navigation helpers.

If you prefer raw Maestro commands, run `maestro test .maestro/auth-foundation.yaml` after the app is open.

## Deterministic test users

Use `pnpm maestro:user -- --seed <value>` to generate stable credentials for local runs.

Example:

```bash
pnpm maestro:user -- --seed auth-local
```

The same seed always returns the same name, email, and password. That gives you two reliable paths:

- Fresh signup path: reset the local SQLite auth database, rerun migrations, then sign up with the generated credentials
- Returning-user path: reuse the same seed and sign in with the previously created account

If you need a clean local auth slate, remove `tabby-finance.db`, `tabby-finance.db-shm`, and `tabby-finance.db-wal`, then run `pnpm db:migrate`.
