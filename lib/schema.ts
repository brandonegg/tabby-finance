import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const simplefinConnections = sqliteTable("simplefin_connections", {
  id: text("id").primaryKey(),
  accessUrl: text("access_url").notNull(),
  createdAt: integer("created_at").notNull(),
  revokedAt: integer("revoked_at"),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  connectionId: text("connection_id")
    .notNull()
    .references(() => simplefinConnections.id),
  simplefinAccountId: text("simplefin_account_id").notNull(),
  name: text("name").notNull(),
  currency: text("currency").notNull(),
  balance: text("balance").notNull(),
  availableBalance: text("available_balance"),
  balanceDate: integer("balance_date").notNull(),
  orgName: text("org_name"),
  orgDomain: text("org_domain"),
  orgSfinUrl: text("org_sfin_url"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const transactions = sqliteTable(
  "transactions",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id),
    simplefinTransactionId: text("simplefin_transaction_id").notNull(),
    posted: integer("posted").notNull(),
    amount: text("amount").notNull(),
    description: text("description").notNull(),
    pending: integer("pending").default(0),
    transactedAt: integer("transacted_at"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("transactions_account_txn_unique").on(
      table.accountId,
      table.simplefinTransactionId,
    ),
  ],
);
