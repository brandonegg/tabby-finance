import path from "node:path";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

const databasePath = path.resolve(process.cwd(), "tabby-finance.db");

// Expo API routes are Metro-bundled; use the Node built-in SQLite runtime
// instead of native addons like better-sqlite3, which Metro cannot load.
const sqlite = new DatabaseSync(databasePath);
sqlite.exec("PRAGMA journal_mode = WAL");
sqlite.exec("PRAGMA foreign_keys = ON");

const remote = async (
  sql: string,
  params: Array<SQLInputValue>,
  method: "run" | "all" | "values" | "get",
) => {
  const statement = sqlite.prepare(sql);

  switch (method) {
    case "run":
      statement.run(...params);
      return { rows: [] as Array<unknown> };
    case "values":
      statement.setReturnArrays(true);
      return { rows: statement.all(...params) as Array<unknown> };
    case "get": {
      statement.setReturnArrays(true);
      const row = statement.get(...params) as Array<unknown> | undefined;
      return { rows: row as unknown as Array<unknown> };
    }
    default:
      statement.setReturnArrays(true);
      return { rows: statement.all(...params) as Array<unknown> };
  }
};

export const db = drizzle<typeof schema>(remote as Parameters<typeof drizzle<typeof schema>>[0], {
  schema,
});
export { sqlite };
