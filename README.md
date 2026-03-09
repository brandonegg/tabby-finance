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
