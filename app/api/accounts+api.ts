import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { accounts } from "@/lib/schema";

export async function GET() {
  const rows = await db.select().from(accounts).orderBy(desc(accounts.updatedAt));

  return Response.json({
    accounts: rows.map((account) => ({
      id: account.id,
      name: account.name,
      orgName: account.orgName,
      balance: account.balance,
      currency: account.currency,
      balanceDate: account.balanceDate,
      updatedAt: account.updatedAt,
    })),
  });
}
