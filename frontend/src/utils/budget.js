export const BUDGET_MIN = 5000;
export const BUDGET_MAX = 100000;
export const BUDGET_STEP = 1000;
export const RENT_STEP = 500;

/**
 * Normalizes a stored budget object (or legacy scalar value) without inventing bounds.
 */
export function parseBudgetRange(rawBudget) {
  if (rawBudget == null || rawBudget === '') {
    return { min: 0, max: 0, hasValue: false, isSingle: false };
  }

  if (typeof rawBudget === 'number' || typeof rawBudget === 'string') {
    const num = Number(rawBudget);
    if (!Number.isFinite(num) || num <= 0) {
      return { min: 0, max: 0, hasValue: false, isSingle: false };
    }
    return { min: num, max: num, hasValue: true, isSingle: true };
  }

  const minRaw = Number(rawBudget?.min ?? 0);
  const maxRaw = Number(rawBudget?.max ?? 0);
  const min = Number.isFinite(minRaw) && minRaw > 0 ? minRaw : 0;
  const max = Number.isFinite(maxRaw) && maxRaw > 0 ? maxRaw : 0;

  if (min === 0 && max === 0) {
    return { min: 0, max: 0, hasValue: false, isSingle: false };
  }

  if (min > 0 && max === 0) {
    return { min, max: 0, hasValue: true, isSingle: true };
  }

  if (min === 0 && max > 0) {
    return { min: 0, max, hasValue: true, isSingle: true };
  }

  if (min === max) {
    return { min, max, hasValue: true, isSingle: true };
  }

  return {
    min: Math.min(min, max),
    max: Math.max(min, max),
    hasValue: true,
    isSingle: false,
  };
}

/**
 * Extracts editable min/max values for slider/input controls without inventing ±15% offsets.
 * Legacy single-value accounts map to min === max so UI reflects the single amount cleanly.
 */
export function getEditableBudgetBounds(rawBudget, fallbackMin = 15000, fallbackMax = 35000) {
  const parsed = parseBudgetRange(rawBudget);
  if (!parsed.hasValue) {
    return { min: fallbackMin, max: fallbackMax, hasStoredValue: false };
  }
  const effectiveMin = parsed.min > 0 ? parsed.min : parsed.max;
  const effectiveMax = parsed.max > 0 ? parsed.max : parsed.min;
  return {
    min: effectiveMin,
    max: Math.max(effectiveMin, effectiveMax),
    hasStoredValue: true,
  };
}

/**
 * Formats a budget range or single budget value consistently in INR.
 * Examples:
 * - Single or min === max: "₹35,000/month"
 * - Range (min < max): "₹15,000–₹35,000/month"
 */
export function formatBudgetLabel(rawBudget, { suffix = '/month', emptyText = '' } = {}) {
  const parsed = parseBudgetRange(rawBudget);
  if (!parsed.hasValue) return emptyText;

  if (parsed.isSingle) {
    const val = parsed.min > 0 ? parsed.min : parsed.max;
    return `₹${val.toLocaleString('en-IN')}${suffix}`;
  }

  return `₹${parsed.min.toLocaleString('en-IN')}–₹${parsed.max.toLocaleString('en-IN')}${suffix}`;
}

export function formatSingleAmount(amount, { suffix = '/month', emptyText = '₹0/month' } = {}) {
  const num = Number(amount ?? 0);
  if (!Number.isFinite(num) || num <= 0) return emptyText;
  return `₹${num.toLocaleString('en-IN')}${suffix}`;
}
