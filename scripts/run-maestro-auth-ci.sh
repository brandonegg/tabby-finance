#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MAESTRO_WORKSPACE_DIR="$ROOT_DIR/.maestro"
RESULTS_DIR_REL="${MAESTRO_RESULTS_DIR_REL:-results}"
RESULTS_DIR_ABS="$MAESTRO_WORKSPACE_DIR/$RESULTS_DIR_REL"
METRO_PORT="${METRO_PORT:-8081}"
APP_URL="${LOGIN_EXPO_URL:-exp://127.0.0.1:${METRO_PORT}/--/login}"
API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:${METRO_PORT}}"
METRO_LOG="$RESULTS_DIR_ABS/metro.log"
LOGCAT_LOG="$RESULTS_DIR_ABS/android-logcat.txt"

mkdir -p "$RESULTS_DIR_ABS"

cleanup() {
  local exit_code=$?

  if command -v adb >/dev/null 2>&1; then
    adb logcat -d >"$LOGCAT_LOG" 2>&1 || true
  fi

  if [[ -n "${EXPO_PID:-}" ]] && kill -0 "$EXPO_PID" >/dev/null 2>&1; then
    kill "$EXPO_PID" >/dev/null 2>&1 || true
    wait "$EXPO_PID" >/dev/null 2>&1 || true
  fi

  exit "$exit_code"
}

wait_for_metro() {
  local attempt
  for attempt in $(seq 1 90); do
    if ! kill -0 "$EXPO_PID" >/dev/null 2>&1; then
      echo "Expo dev server exited before Metro became ready." >&2
      return 1
    fi

    if curl -fsS "http://127.0.0.1:${METRO_PORT}/status" | grep -q "packager-status:running"; then
      return 0
    fi

    sleep 2
  done

  echo "Timed out waiting for Metro on port ${METRO_PORT}." >&2
  return 1
}

wait_for_expo_go() {
  local attempt
  for attempt in $(seq 1 60); do
    if adb shell pm list packages host.exp.exponent | grep -q "host.exp.exponent"; then
      return 0
    fi

    if ! kill -0 "$EXPO_PID" >/dev/null 2>&1; then
      echo "Expo dev server exited before Expo Go was installed." >&2
      return 1
    fi

    sleep 2
  done

  echo "Timed out waiting for Expo Go to install on the emulator." >&2
  return 1
}

run_flow() {
  local name="$1"
  local flow="$2"

  mkdir -p "$RESULTS_DIR_ABS/$name"

  (
    cd "$MAESTRO_WORKSPACE_DIR"
    maestro test "$flow" \
      --format junit \
      --output "$RESULTS_DIR_REL/${name}.xml" \
      --test-output-dir "$RESULTS_DIR_REL/$name" \
      --debug-output "$RESULTS_DIR_REL/$name" \
      --flatten-debug-output \
      -e API_BASE_URL="$API_BASE_URL" \
      -e LOGIN_EXPO_URL="$APP_URL"
  )
}

trap cleanup EXIT

export CI="${CI:-1}"
export EXPO_NO_TELEMETRY=1
export BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET:-tabby-finance-maestro-ci-secret}"
export BETTER_AUTH_URL="${BETTER_AUTH_URL:-$API_BASE_URL}"
export EXPO_PUBLIC_API_URL="${EXPO_PUBLIC_API_URL:-$API_BASE_URL}"

cd "$ROOT_DIR"

adb wait-for-device
pnpm db:migrate

pnpm exec expo start --go --android --localhost --port "$METRO_PORT" >"$METRO_LOG" 2>&1 &
EXPO_PID=$!

wait_for_metro
adb reverse "tcp:${METRO_PORT}" "tcp:${METRO_PORT}" || true
wait_for_expo_go
adb shell am start -W -a android.intent.action.VIEW -d "$APP_URL" host.exp.exponent >/dev/null

run_flow auth-foundation auth-foundation.yaml
run_flow auth-signup auth-signup.yaml
run_flow auth-login auth-login.yaml
