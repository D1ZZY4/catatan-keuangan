import { create, all } from "mathjs";

const math = create(all ?? {}, { number: "number" });

const ALLOWED_RE = /^[\d\s+\-*/().,%]+$/;

export function evaluateAmount(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/\./g, "").replace(/,/g, ".");
  if (!ALLOWED_RE.test(trimmed) && !ALLOWED_RE.test(normalized)) return null;
  try {
    const result = normalized;
    const value: unknown = math.evaluate(result);
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
    return value;
  } catch {
    return null;
  }
}

export function calcResult(expression: string): number | null {
  return evaluateAmount(expression);
}
