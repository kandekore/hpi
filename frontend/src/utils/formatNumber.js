// src/utils/formatNumber.js
export function formatNumber(value) {
  // If it's already a number and not NaN, use it as is
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toLocaleString('en-GB');
  }
  // If it's a string, try to parse
  const parsed = parseFloat(value);
  if (Number.isFinite(parsed)) {
    return parsed.toLocaleString('en-GB');
  }
  // Otherwise, fallback
  return 'N/A';
}
