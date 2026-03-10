# Maestro Auth Workspace

This folder contains the Android-first Maestro flows for Tabby's auth coverage.

## Layout

- `auth-foundation.yaml`: smoke flow that verifies the login and signup screens expose stable selectors
- `auth-signup.yaml`: end-to-end signup flow that creates a seeded user, lands in the authenticated shell, and signs out
- `auth-login.yaml`: returning-user login flow that ensures a seeded user exists, asserts inline validation, and signs in
- `scripts/auth-fixture.js`: flow setup helper that calls the local dev fixture API before each auth run
- `subflows/assert-authenticated-shell.yaml`: reusable app-shell assertions after successful auth
- `subflows/assert-login-screen.yaml`: reusable assertions for the login form
- `subflows/assert-signup-screen.yaml`: reusable assertions for the signup form
- `subflows/fill-login-form.yaml`: reusable login field entry
- `subflows/fill-signup-form.yaml`: reusable signup field entry
- `subflows/open-signup.yaml`: helper for moving from login to signup
- `subflows/open-login.yaml`: helper for moving from signup back to login
- `subflows/open-profile-tab.yaml`: helper for opening the profile tab after authentication
- `subflows/sign-out-if-needed.yaml`: helper for resetting back to login when a signed-in session already exists

## Local Android workflow

1. Start the Expo app on Android with `pnpm android`.
2. Wait for the auth screen or authenticated app shell to load on the emulator.
3. Run `pnpm maestro:auth:foundation` to validate the selectors and auth navigation helpers.
4. Run `pnpm maestro:auth:signup` to cover signup, authenticated navigation, and sign-out.
5. Run `pnpm maestro:auth:login` to cover returning-user login and inline validation.

If you prefer raw Maestro commands, run `maestro test .maestro/auth-foundation.yaml` after the app is open.

The signup and login flows call a local development-only fixture API at `/api/test/maestro-auth-user` so each flow can reset or ensure its seeded user before the UI steps run. By default the flows target `http://localhost:8081`, but you can override that with `-e API_BASE_URL=http://<host>:<port>` when needed.

## Deterministic test users

Use `pnpm maestro:user -- --seed <value>` to generate stable credentials for local runs.

Example:

```bash
pnpm maestro:user -- --seed auth-local
```

The same seed always returns the same name, email, and password. That gives you two reliable paths:

- Fresh signup path: reset the local SQLite auth database, rerun migrations, then sign up with the generated credentials
- Returning-user path: reuse the same seed and sign in with the previously created account

Current seeded flow defaults:

- `auth-signup` -> `tabby+maestro-auth-signup-ebc6f8a450@example.com`
- `auth-login` -> `tabby+maestro-auth-login-7b9625603f@example.com`

If you need a clean local auth slate, remove `tabby-finance.db`, `tabby-finance.db-shm`, and `tabby-finance.db-wal`, then run `pnpm db:migrate`.

## CI workflow

Use `pnpm maestro:auth:ci` when you want the GitHub Actions path locally:

1. Boot an Android emulator and install the Maestro CLI.
2. Run `pnpm maestro:auth:ci`.
3. The script runs `pnpm db:migrate`, starts Expo Go on the emulator with `expo start --go --android --localhost`, waits for Metro to report healthy, then executes the foundation, signup, and login flows in sequence.
4. Results are written to `.maestro/results/`, including JUnit XML, Maestro debug output, the Metro log, and Android logcat output.
