import React from 'react';

/**
 * DashboardStats — top-of-page summary KPI cards.
 * Renders a flexible grid of cards from a `metrics` array:
 *   [{ label, value, hint?, accent? }, ...]
 */
export default function DashboardStats({ metrics }) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <section className="dashboard" aria-label="Workflow summary">
      {metrics.map((m, idx) => (
        <article
          key={`${m.label}-${idx}`}
          className={`dashboard__card ${m.accent ? 'dashboard__card--accent' : ''}`}
          aria-label={`${m.label}: ${m.value}`}
        >
          <div className="dashboard__label">{m.label}</div>
          <div className="dashboard__value" aria-hidden={false}>
            {m.value}
          </div>
          {m.hint ? <div className="dashboard__hint">{m.hint}</div> : null}
        </article>
      ))}
    </section>
  );
}
