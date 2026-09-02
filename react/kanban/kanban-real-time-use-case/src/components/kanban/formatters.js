/**
 * formatters.js — small set of pure formatting helpers used by the
 * Kanban card templates.
 *
 * NOTE: Only helpers actually referenced by the pages live here.
 * The priority chip class for Sales (pipeline) cards is exported from
 * `src/data/pipelineData.js` (imported there as `priorityClass`).
 * The Healthcare page uses its own `StatusBadge` component, so no
 * urgency helper is needed here.
 */

/**
 * Format a number as USD currency, e.g. 25000 -> "$25,000".
 */
export const formatUsd = (n) => {
  if (n === null || n === undefined || isNaN(Number(n))) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(n));
};

/**
 * Format a 0-100 number as a percentage, e.g. 47 -> "47%".
 */
export const formatPercent = (n) => {
  if (n === null || n === undefined || isNaN(Number(n))) return '—';
  return `${Math.round(Number(n))}%`;
};

/**
 * Format an ISO date (or anything `new Date()` accepts) as
 * "Mon DD, YYYY". Returns "—" for null/invalid.
 */
export const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
};
