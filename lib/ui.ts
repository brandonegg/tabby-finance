export const tabbyColors = {
  canvas: "#f4efe6",
  paper: "#fffaf2",
  cloud: "#edf1eb",
  ink: "#13261e",
  inkMuted: "#365247",
  muted: "#67756d",
  line: "#d8ded5",
  accent: "#245c4a",
  accentStrong: "#173d30",
  accentSoft: "#dce8df",
  positive: "#2e7d57",
  positiveSoft: "#e4f1e8",
  warning: "#8f6a2a",
  warningStrong: "#876221",
  warningSoft: "#f6ebcf",
  danger: "#b65245",
  dangerStrong: "#a5483c",
  dangerSoft: "#f7e4df",
  white: "#ffffff",
} as const;

export const cardShadow = {
  shadowColor: tabbyColors.ink,
  shadowOpacity: 0.08,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  elevation: 6,
} as const;

export function formatCurrency(amount: number | string, currency: string): string {
  const num = typeof amount === "number" ? amount : Number.parseFloat(amount);

  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(num);
  } catch {
    return `${num.toFixed(2)} ${currency}`;
  }
}

export function normalizeTimestamp(timestamp: number): number {
  return timestamp > 1_000_000_000_000 ? timestamp : timestamp * 1000;
}

export function formatDate(timestamp: number): string {
  return new Date(normalizeTimestamp(timestamp)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const deltaMs = now - normalizeTimestamp(timestamp);
  const deltaHours = Math.round(deltaMs / (1000 * 60 * 60));

  if (deltaHours <= 1) {
    return "just now";
  }

  if (deltaHours < 24) {
    return `${deltaHours}h ago`;
  }

  const deltaDays = Math.round(deltaHours / 24);
  if (deltaDays < 7) {
    return `${deltaDays}d ago`;
  }

  return formatDate(timestamp);
}

export function getInitials(name?: string | null): string {
  if (!name) {
    return "?";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
