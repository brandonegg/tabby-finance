import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accounts, transactions } from "@/lib/schema";

export async function GET(request: Request, { id }: { id: string }) {
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);
  const offset = Number(url.searchParams.get("offset")) || 0;
  const pendingOnly = url.searchParams.get("pending") === "1";

  const account = await db.query.accounts.findFirst({
    where: eq(accounts.id, id),
  });

  if (!account) {
    return Response.json({ error: "Account not found" }, { status: 404 });
  }

  const conditions = [eq(transactions.accountId, id)];
  if (pendingOnly) {
    conditions.push(eq(transactions.pending, 1));
  }

  const rows = await db
    .select()
    .from(transactions)
    .where(and(...conditions))
    .orderBy(desc(transactions.posted))
    .limit(limit)
    .offset(offset);

  return Response.json({
    account: {
      id: account.id,
      name: account.name,
      balance: account.balance,
      currency: account.currency,
      availableBalance: account.availableBalance,
      balanceDate: account.balanceDate,
      orgName: account.orgName,
    },
    transactions: rows,
    pagination: { limit, offset, count: rows.length },
  });
}
