import { create, all } from "mathjs";

// Restricted mathjs instance: only number arithmetic, no symbolic / matrix / unit
// surface area, no `import`/`createUnit` so user expressions can't extend it.
const math = create(all, { number: "number" });

math.import(
  {
    import: function noop() {
      throw new Error("import disabled");
    },
    createUnit: function noop() {
      throw new Error("createUnit disabled");
    },
    evaluate: function noop() {
      throw new Error("evaluate disabled");
    },
    parse: function noop() {
      throw new Error("parse disabled");
    },
    simplify: function noop() {
      throw new Error("simplify disabled");
    },
    derivative: function noop() {
      throw new Error("derivative disabled");
    },
  },
  { override: true },
);

const ALLOWED_RE = /^[\d\s+\-*/().,%]+$/;

/**
 * Safely evaluate a numeric expression entered in the amount field.
 * Returns null on invalid input.
 */
export function evaluateAmount(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Allow comma as decimal separator (id-ID).
  const normalized = trimmed.replace(/\./g, "").replace(/,/g, ".");
  if (!ALLOWED_RE.test(trimmed) && !ALLOWED_RE.test(normalized)) return null;
  try {
    const value = math.evaluate(normalized) as unknown;
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    return value;
  } catch {
    return null;
  }
}
