export function isEmail(v: unknown): v is string {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function isNonEmptyString(v: unknown, min = 1, max = 200): v is string {
  return typeof v === 'string' && v.trim().length >= min && v.trim().length <= max;
}

export function isPassword(v: unknown): v is string {
  return typeof v === 'string' && v.length >= 8 && v.length <= 200;
}
