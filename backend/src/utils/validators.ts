export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function is_non_empty_string(value: any) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function normalize_phone(value: any): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).replace(/\s+/g, '');
  return s;
}

export function is_valid_phone_digits(s: string) {
  return /^\d{9}$/.test(s);
}

export function is_positive_number(value: any) {
  const n = Number(value);
  return !Number.isNaN(n) && n >= 0;
}

export function is_valid_date(value: any) {
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}
