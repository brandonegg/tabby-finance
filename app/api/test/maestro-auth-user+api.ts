import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, verification } from "@/lib/schema";

const fixtureHeader = "x-tabby-e2e-fixture";
const fixtureHeaderValue = "maestro";

type FixtureAction = "reset" | "ensure";

interface FixtureRequestBody {
  action?: unknown;
  name?: unknown;
  email?: unknown;
  password?: unknown;
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (request.headers.get(fixtureHeader) !== fixtureHeaderValue) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: FixtureRequestBody;

  try {
    body = (await request.json()) as FixtureRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = normalizeAction(body.action);
  const name = normalizeString(body.name);
  const email = normalizeString(body.email);
  const password = normalizeString(body.password);

  if (!action || !name || !email || !password) {
    return Response.json(
      {
        error: "Expected action, name, email, and password.",
      },
      { status: 422 },
    );
  }

  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  if (action === "reset") {
    await deleteFixtureUser(email, existingUser?.id ?? null);

    return Response.json({
      action,
      existed: Boolean(existingUser),
      ok: true,
    });
  }

  // Rebuild the fixture user on every ensure so the requested credentials are
  // always valid, even if a stale `user` row exists without its auth account.
  await deleteFixtureUser(email, existingUser?.id ?? null);

  await auth.api.signUpEmail({
    body: {
      email,
      name,
      password,
    },
  });

  return Response.json({
    action,
    created: !existingUser,
    existed: Boolean(existingUser),
    ok: true,
  });
}

async function deleteFixtureUser(email: string, userId: string | null) {
  if (userId) {
    await db.delete(user).where(eq(user.id, userId));
  }

  await db.delete(verification).where(eq(verification.identifier, email));
}

function normalizeAction(value: unknown): FixtureAction | null {
  if (value === "reset" || value === "ensure") {
    return value;
  }

  return null;
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}
