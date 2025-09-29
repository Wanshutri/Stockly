export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isNonEmptyString(value: any) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function normalizePhone(value: any): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).replace(/\s+/g, '');
  return s;
}

export function isValidPhoneDigits(s: string) {
  return /^\d{9}$/.test(s);
}

export function isPositiveNumber(value: any) {
  const n = Number(value);
  return !Number.isNaN(n) && n >= 0;
}

export function isValidDate(value: any) {
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}
