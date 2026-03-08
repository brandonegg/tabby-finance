import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { expo } from "@better-auth/expo";

const db = new Database("tabby-finance.db");

export const auth = betterAuth({
  database: db,
  plugins: [expo()],
  trustedOrigins: [
    "tabby-finance://",
    ...(process.env.NODE_ENV === "development"
      ? ["exp://", "exp://**", "exp://192.168.*.*:*/**"]
      : []),
  ],
  emailAndPassword: {
    enabled: true,
  },
});
