# Tabby Finance

A personal finance app built with Expo (React Native), TypeScript, and SQLite.

## Prerequisites

- [Node.js](https://nodejs.org/) v22+
- [pnpm](https://pnpm.io/) v9+ (`corepack enable` to activate)
- iOS Simulator (macOS) or Android Emulator for mobile development

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Copy the example environment file and adjust as needed:

```bash
cp .env.example .env
```

Required variables:

| Variable             | Description                          | Default                         |
| -------------------- | ------------------------------------ | ------------------------------- |
| `BETTER_AUTH_SECRET`  | Secret key for authentication        | _(must be set)_                 |
| `BETTER_AUTH_URL`     | Base URL for the auth server         | `http://localhost:8081`         |
| `EXPO_PUBLIC_API_URL` | Public base URL used by Expo clients | `http://localhost:8081`         |

### 3. Run database migrations

```bash
pnpm db:generate
pnpm db:migrate
```

### 4. Start the development server

```bash
pnpm start
```

This launches the Expo dev server. From here you can:

- Press **`w`** to open in a web browser
- Press **`i`** to open in iOS Simulator
- Press **`a`** to open in Android Emulator
- Scan the QR code with [Expo Go](https://expo.dev/go) on a physical device

Or start directly for a specific platform:

```bash
pnpm ios       # iOS Simulator
pnpm android   # Android Emulator
pnpm web       # Web browser
```

## Maestro E2E Foundation

Tabby includes an Android-first Maestro workspace in `.maestro/` for auth selector coverage and reusable auth helpers.

### Maestro prerequisites

- Install the Maestro CLI locally before running the flows
- Start an Android emulator
- Boot the Expo app with `pnpm android`

### Run the foundation flow

Once the app is open on the emulator, run:

```bash
pnpm maestro:auth:foundation
```

That flow checks the login screen, navigates to signup, verifies the signup selectors, and returns to login using stable `testID` selectors instead of text matching.

### Run the auth journey flows

After the app is open on Android, run the new end-to-end auth flows individually:

```bash
pnpm maestro:auth:signup
pnpm maestro:auth:login
```

The signup flow resets a seeded test user, creates the account through the UI, verifies the authenticated shell, and signs out. The login flow ensures a seeded returning user exists, checks inline validation on the login form, and signs in through the UI. Both flows use the local development fixture API at `/api/test/maestro-auth-user`, which defaults to `http://localhost:8081` and can be overridden with `API_BASE_URL` if your Expo API server is exposed elsewhere.

If Expo Go does not already have the project open, the shared Maestro recovery subflow will reopen it through Expo Go with `LOGIN_EXPO_URL`. On the Android emulator it defaults to `exp://127.0.0.1:8081/--/login`. Override it if you are using a different Metro port, host binding, or a physical device, for example:

```bash
LOGIN_EXPO_URL=exp://192.168.1.25:8081/--/login pnpm maestro:auth:signup
LOGIN_EXPO_URL=exp://192.168.1.25:8081/--/login pnpm maestro:auth:login
```

### Run the CI-style Android auth suite locally

If you want to exercise the same path GitHub Actions uses, install the Maestro CLI, boot an Android emulator, and run:

```bash
pnpm maestro:auth:ci
```

That command runs `pnpm db:migrate`, starts Expo Go on the emulator through Expo CLI, waits for Metro to come up on `127.0.0.1:8081`, and then executes the foundation, signup, and login flows sequentially. It writes JUnit XML, Maestro debug output, the Metro log, and Android logcat to `.maestro/results/`.

By default the script targets `127.0.0.1`, which matches the stable local Android emulator path for Expo Go and the fixture API. On Linux CI runners, Expo may advertise the host-side Metro status endpoint on `localhost` instead. Override `METRO_STATUS_URL=http://localhost:8081/status` in that case so only the readiness probe switches hostnames while the emulator-facing Expo deep link stays on `127.0.0.1`.

### GitHub Actions auth coverage

Pull requests to `main` and pushes to `main` now run a dedicated `Maestro Auth E2E` workflow in `.github/workflows/maestro-auth.yml`. The job:

- reuses the existing pnpm cache pattern
- boots an Android API 34 emulator on `ubuntu-22.04`
- installs Maestro CLI
- runs `pnpm maestro:auth:ci`
- uploads `.maestro/results/` as a workflow artifact for failure triage

The current workflow does not require any GitHub repository secrets. It sets local-only auth values inline for CI:

- `METRO_STATUS_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `EXPO_PUBLIC_API_URL`
- `LOGIN_EXPO_URL`

If the Metro host, port, or Expo deep link changes, update those workflow env values to match.

### Generate deterministic auth users

Use the helper script to generate stable local credentials from a seed:

```bash
pnpm maestro:user -- --seed auth-local
```

The same seed always returns the same name, email, and password. That makes it easy to reuse an existing local account for login flows or create a predictable signup target after clearing the local SQLite database.

To reset the local auth state entirely, remove `tabby-finance.db`, `tabby-finance.db-shm`, and `tabby-finance.db-wal`, then run:

```bash
pnpm db:migrate
```

## Project Structure

```
app/
├── (app)/          # Authenticated app screens (accounts, profile)
├── (auth)/         # Login and signup screens
├── api/            # API routes (auth, transactions)
├── _layout.tsx     # Root layout
└── index.tsx       # Entry redirect
lib/
├── auth.ts         # Auth server configuration
├── auth-client.ts  # Auth client for React Native
├── db.ts           # SQLite database connection
└── schema.ts       # Drizzle ORM schema
drizzle/            # Generated SQL migrations
```

## Available Scripts

| Command              | Description                                |
| -------------------- | ------------------------------------------ |
| `pnpm start`         | Start Expo dev server                      |
| `pnpm ios`           | Start on iOS Simulator                     |
| `pnpm android`       | Start on Android Emulator                  |
| `pnpm web`           | Start in web browser                       |
| `pnpm maestro:auth:foundation` | Run the local Maestro auth foundation flow |
| `pnpm maestro:auth:signup` | Run the local Maestro signup journey |
| `pnpm maestro:auth:login` | Run the local Maestro returning-user login journey |
| `pnpm maestro:auth:ci` | Run the CI-style Android Maestro auth suite locally |
| `pnpm maestro:auth:all` | Run every flow under `.maestro/`        |
| `pnpm maestro:user -- --seed auth-local` | Generate deterministic local auth credentials |
| `pnpm lint`          | Run Biome linter                           |
| `pnpm lint:fix`      | Run Biome linter with auto-fix             |
| `pnpm format`        | Check formatting with Biome                |
| `pnpm format:fix`    | Fix formatting with Biome                  |
| `pnpm db:generate`   | Generate Drizzle migration files           |
| `pnpm db:migrate`    | Run database migrations                    |
| `pnpm db:studio`     | Open Drizzle Studio (database browser)     |

## Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native) with [Expo Router](https://docs.expo.dev/router/introduction/)
- **Language**: TypeScript
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Database**: SQLite via [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Linting/Formatting**: [Biome](https://biomejs.dev/)
- **Git Hooks**: [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged)
