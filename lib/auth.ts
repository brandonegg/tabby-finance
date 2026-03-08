import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { sqlite } from "./db";

export const auth = betterAuth({
  database: sqlite,
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
