import { Buffer } from "node:buffer";

export interface AccountSet {
  errors: Array<string>;
  accounts: Array<Account>;
}

export interface Account {
  org: Organization;
  id: string;
  name: string;
  currency: string;
  balance: string;
  "available-balance"?: string;
  "balance-date": number;
  transactions?: Array<Transaction>;
  extra?: Record<string, unknown>;
}

export interface Transaction {
  id: string;
  posted: number;
  amount: string;
  description: string;
  transacted_at?: number;
  pending?: boolean;
  extra?: Record<string, unknown>;
}

export interface Organization {
  domain?: string;
  "sfin-url": string;
  name?: string;
  url?: string;
  id?: string;
}

export interface ClaimSetupTokenOptions {
  fetch?: typeof globalThis.fetch;
  signal?: AbortSignal;
}

export interface FetchAccountsOptions {
  startDate?: string;
  endDate?: string;
  pending?: boolean;
  account?: string | Array<string>;
  balancesOnly?: boolean;
  fetch?: typeof globalThis.fetch;
  signal?: AbortSignal;
  onWarnings?: (errors: Array<string>) => void;
}

export class SimpleFinError extends Error {
  readonly code:
    | "invalid_setup_token"
    | "invalid_access_url"
    | "payment_required"
    | "access_revoked"
    | "http_error"
    | "network_error"
    | "invalid_response";
  readonly status?: number;

  constructor(
    code: SimpleFinError["code"],
    message: string,
    options?: { cause?: unknown; status?: number },
  ) {
    super(message, options);
    this.name = "SimpleFinError";
    this.code = code;
    this.status = options?.status;
  }
}

export async function claimSetupToken(
  setupToken: string,
  options?: ClaimSetupTokenOptions,
): Promise<string> {
  const claimUrl = decodeClaimUrl(setupToken);
  const response = await request(
    claimUrl,
    {
      method: "POST",
      body: "",
      headers: { "Content-Length": "0" },
      signal: options?.signal,
    },
    options?.fetch,
  );

  if (response.status === 403) {
    throw new SimpleFinError(
      "invalid_setup_token",
      "SimpleFIN setup token is invalid or has already been claimed.",
      { status: response.status },
    );
  }

  if (!response.ok) {
    throw await buildHttpError(
      response,
      "http_error",
      `SimpleFIN rejected the setup-token claim request with HTTP ${response.status}.`,
    );
  }

  const accessUrl = (await response.text()).trim();
  validateAccessUrl(accessUrl);
  return accessUrl;
}

export async function fetchAccounts(
  accessUrl: string,
  options?: FetchAccountsOptions,
): Promise<AccountSet> {
  const parsedAccessUrl = validateAccessUrl(accessUrl);
  const accountsUrl = buildAccountsUrl(parsedAccessUrl, options);
  const credentials = Buffer.from(
    `${decodeURIComponent(parsedAccessUrl.username)}:${decodeURIComponent(parsedAccessUrl.password)}`,
  ).toString("base64");

  const response = await request(
    accountsUrl,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${credentials}`,
      },
      signal: options?.signal,
    },
    options?.fetch,
  );

  if (response.status === 402) {
    throw new SimpleFinError(
      "payment_required",
      "SimpleFIN access requires an active subscription before account data can be fetched.",
      { status: response.status },
    );
  }

  if (response.status === 403) {
    throw new SimpleFinError(
      "access_revoked",
      "SimpleFIN access has been revoked or the access URL credentials are no longer valid.",
      { status: response.status },
    );
  }

  if (!response.ok) {
    throw await buildHttpError(
      response,
      "http_error",
      `SimpleFIN accounts request failed with HTTP ${response.status}.`,
    );
  }

  const payload = parseAccountSet(await response.json());

  if (payload.errors.length > 0) {
    if (options?.onWarnings) {
      options.onWarnings(payload.errors);
    } else {
      console.warn("SimpleFIN returned warnings:", payload.errors);
    }
  }

  return payload;
}

function buildAccountsUrl(accessUrl: URL, options?: FetchAccountsOptions): URL {
  const basePath = accessUrl.pathname.endsWith("/") ? accessUrl.pathname : `${accessUrl.pathname}/`;
  const accountsUrl = new URL(`${basePath}accounts`, `${accessUrl.protocol}//${accessUrl.host}`);

  if (options?.startDate) {
    accountsUrl.searchParams.set("start-date", options.startDate);
  }

  if (options?.endDate) {
    accountsUrl.searchParams.set("end-date", options.endDate);
  }

  if (options?.pending) {
    accountsUrl.searchParams.set("pending", "1");
  }

  if (options?.balancesOnly) {
    accountsUrl.searchParams.set("balances-only", "1");
  }

  const accounts = Array.isArray(options?.account)
    ? options.account
    : options?.account
      ? [options.account]
      : [];
  for (const account of accounts) {
    accountsUrl.searchParams.append("account", account);
  }

  return accountsUrl;
}

function decodeClaimUrl(setupToken: string): URL {
  const normalizedToken = normalizeBase64(setupToken);

  let decoded: string;
  try {
    decoded = Buffer.from(normalizedToken, "base64").toString("utf8").trim();
  } catch (error) {
    throw new SimpleFinError("invalid_setup_token", "SimpleFIN setup token is not valid base64.", {
      cause: error,
    });
  }

  try {
    return new URL(decoded);
  } catch (error) {
    throw new SimpleFinError(
      "invalid_setup_token",
      "SimpleFIN setup token did not decode to a valid claim URL.",
      { cause: error },
    );
  }
}

function validateAccessUrl(accessUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(accessUrl);
  } catch (error) {
    throw new SimpleFinError("invalid_access_url", "SimpleFIN access URL is not a valid URL.", {
      cause: error,
    });
  }

  if (!parsed.username || !parsed.password) {
    throw new SimpleFinError(
      "invalid_access_url",
      "SimpleFIN access URL must include embedded Basic Auth credentials.",
    );
  }

  return parsed;
}

function normalizeBase64(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new SimpleFinError("invalid_setup_token", "SimpleFIN setup token cannot be empty.");
  }

  const normalized = trimmed.replaceAll("-", "+").replaceAll("_", "/");
  const paddingLength = (4 - (normalized.length % 4)) % 4;
  return normalized.padEnd(normalized.length + paddingLength, "=");
}

async function request(
  input: URL,
  init: RequestInit,
  fetchImpl?: typeof globalThis.fetch,
): Promise<Response> {
  try {
    return await (fetchImpl ?? globalThis.fetch)(input, init);
  } catch (error) {
    throw new SimpleFinError("network_error", `Network request to ${input.origin} failed.`, {
      cause: error,
    });
  }
}

async function buildHttpError(
  response: Response,
  code: Extract<SimpleFinError["code"], "http_error">,
  message: string,
): Promise<SimpleFinError> {
  const responseText = (await response.text()).trim();
  const suffix = responseText ? ` Response body: ${responseText}` : "";
  return new SimpleFinError(code, `${message}${suffix}`, { status: response.status });
}

function parseAccountSet(value: unknown): AccountSet {
  const record = getRecord(value, "SimpleFIN accounts response must be an object.");
  return {
    errors: getStringArray(
      record.errors,
      "SimpleFIN accounts response `errors` must be a string array.",
    ),
    accounts: getArray(
      record.accounts,
      "SimpleFIN accounts response `accounts` must be an array.",
    ).map((account, index) => parseAccount(account, index)),
  };
}

function parseAccount(value: unknown, index: number): Account {
  const record = getRecord(value, `SimpleFIN account at index ${index} must be an object.`);
  const account: Account = {
    org: parseOrganization(record.org, index),
    id: getString(record.id, `SimpleFIN account at index ${index} is missing a string \`id\`.`),
    name: getString(
      record.name,
      `SimpleFIN account at index ${index} is missing a string \`name\`.`,
    ),
    currency: getString(
      record.currency,
      `SimpleFIN account at index ${index} is missing a string \`currency\`.`,
    ),
    balance: getString(
      record.balance,
      `SimpleFIN account at index ${index} is missing a string \`balance\`.`,
    ),
    "balance-date": getNumber(
      record["balance-date"],
      `SimpleFIN account at index ${index} is missing a numeric \`balance-date\`.`,
    ),
  };

  if (typeof record["available-balance"] === "string") {
    account["available-balance"] = record["available-balance"];
  }

  if (record.transactions !== undefined) {
    account.transactions = getArray(
      record.transactions,
      `SimpleFIN account at index ${index} has an invalid \`transactions\` array.`,
    ).map((transaction, transactionIndex) =>
      parseTransaction(transaction, index, transactionIndex),
    );
  }

  if (record.extra !== undefined) {
    account.extra = getRecord(
      record.extra,
      `SimpleFIN account at index ${index} has an invalid \`extra\` object.`,
    );
  }

  return account;
}

function parseTransaction(
  value: unknown,
  accountIndex: number,
  transactionIndex: number,
): Transaction {
  const record = getRecord(
    value,
    `SimpleFIN transaction ${transactionIndex} for account ${accountIndex} must be an object.`,
  );
  const transaction: Transaction = {
    id: getString(
      record.id,
      `SimpleFIN transaction ${transactionIndex} for account ${accountIndex} is missing a string \`id\`.`,
    ),
    posted: getNumber(
      record.posted,
      `SimpleFIN transaction ${transactionIndex} for account ${accountIndex} is missing a numeric \`posted\`.`,
    ),
    amount: getString(
      record.amount,
      `SimpleFIN transaction ${transactionIndex} for account ${accountIndex} is missing a string \`amount\`.`,
    ),
    description: getString(
      record.description,
      `SimpleFIN transaction ${transactionIndex} for account ${accountIndex} is missing a string \`description\`.`,
    ),
  };

  if (typeof record.transacted_at === "number") {
    transaction.transacted_at = record.transacted_at;
  }

  if (typeof record.pending === "boolean") {
    transaction.pending = record.pending;
  }

  if (record.extra !== undefined) {
    transaction.extra = getRecord(
      record.extra,
      `SimpleFIN transaction ${transactionIndex} for account ${accountIndex} has an invalid \`extra\` object.`,
    );
  }

  return transaction;
}

function parseOrganization(value: unknown, accountIndex: number): Organization {
  const record = getRecord(
    value,
    `SimpleFIN account at index ${accountIndex} is missing an \`org\` object.`,
  );
  const organization: Organization = {
    "sfin-url": getString(
      record["sfin-url"],
      `SimpleFIN account at index ${accountIndex} is missing org.\`sfin-url\`.`,
    ),
  };

  if (typeof record.domain === "string") {
    organization.domain = record.domain;
  }

  if (typeof record.name === "string") {
    organization.name = record.name;
  }

  if (typeof record.url === "string") {
    organization.url = record.url;
  }

  if (typeof record.id === "string") {
    organization.id = record.id;
  }

  return organization;
}

function getArray(value: unknown, message: string): Array<unknown> {
  if (!Array.isArray(value)) {
    throw new SimpleFinError("invalid_response", message);
  }

  return value;
}

function getRecord(value: unknown, message: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SimpleFinError("invalid_response", message);
  }

  return value as Record<string, unknown>;
}

function getString(value: unknown, message: string): string {
  if (typeof value !== "string") {
    throw new SimpleFinError("invalid_response", message);
  }

  return value;
}

function getNumber(value: unknown, message: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new SimpleFinError("invalid_response", message);
  }

  return value;
}

function getStringArray(value: unknown, message: string): Array<string> {
  return getArray(value, message).map((item) => getString(item, message));
}
