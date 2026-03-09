import { createHash } from "node:crypto";

const args = process.argv.slice(2);
const inlineSeedArg = args.find((arg) => arg.startsWith("--seed="));
const seedValueArgIndex = args.findIndex((arg) => arg === "--seed");
const positionalSeed =
  seedValueArgIndex >= 0 ? args[seedValueArgIndex + 1] : args.find((arg) => !arg.startsWith("--"));
const seed = (
  inlineSeedArg
    ? inlineSeedArg.slice("--seed=".length)
    : positionalSeed ?? "local-auth"
).trim();

if (!seed) {
  console.error("Provide a non-empty seed, for example: pnpm maestro:user -- --seed local-auth");
  process.exit(1);
}

const slug = seed
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 24);

const hash = createHash("sha256").update(seed).digest("hex");
const suffix = hash.slice(0, 10);
const email = `tabby+maestro-${slug || "seed"}-${suffix}@example.com`;
const password = `Tabby-${hash.slice(0, 12)}!`;
const name = seed
  .split(/[^a-zA-Z0-9]+/)
  .filter(Boolean)
  .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
  .join(" ");

console.log(
  JSON.stringify(
    {
      seed,
      name: name || "Maestro Local User",
      email,
      password,
    },
    null,
    2,
  ),
);
