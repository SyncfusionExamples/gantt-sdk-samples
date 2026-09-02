/**
 * Sales CRM Pipeline — local JSON dataset, modeled after the Syncfusion
 * Sales CRM Showcase (PipelineCard shape).
 *
 * Field shape matches the reference:
 *   { id, title, content, stage, owner, account, amount,
 *     probability, priority, forecastCategory, expectedCloseDate,
 *     wonDate, lostDate, lossReason, salesCycleDays, tags }
 *
 * Stages (keyField values, PascalCase compound names) follow the
 * showcase's `stageOrder`:
 *   Qualification | Discovery | Proposal | Negotiation | ClosedWon | ClosedLost
 * The display labels are produced by `stageLabel()` (e.g. ClosedWon
 * -> "Closed Won").
 */

export const stageOrder = [
  'Qualification',
  'Discovery',
  'Proposal',
  'Negotiation',
  'ClosedWon',
  'ClosedLost'
];

export const activeForecastStages = new Set([
  'Qualification',
  'Discovery',
  'Proposal',
  'Negotiation'
]);

export const allowedForecastBadges = new Set([
  'Pipeline',
  'Best Case',
  'Commit',
  'Omitted'
]);

/**
 * Convert a PascalCase stage key to a friendly display label.
 *   ClosedWon  -> "Closed Won"
 *   Qualification -> "Qualification"
 */
export const stageLabel = (stage) =>
  String(stage || '').replace(/([a-z])([A-Z])/g, '$1 $2');

export const isTerminalStage = (card) =>
  card?.stage === 'ClosedWon' || card?.stage === 'ClosedLost';

export const showForecastBadge = (card) =>
  activeForecastStages.has(card?.stage) &&
  allowedForecastBadges.has(card?.forecastCategory);

export const terminalDateLabel = (card) =>
  card?.stage === 'ClosedWon' ? 'Won Date' : 'Lost Date';

export const terminalDateValue = (card) =>
  card?.stage === 'ClosedWon'
    ? card.wonDate || card.expectedCloseDate
    : card.lostDate || card.expectedCloseDate;

export const priorityClass = (priority) =>
  `priority-chip priority-${(priority || 'medium').toLowerCase()}`;

// ----------------------------------------------------------------------
// Static lookups (assignees, accounts) used in the page chrome.
// ----------------------------------------------------------------------

export const salesOwners = [
  'Daniel Carter', 'Iris Ng', 'Noah Williams', 'Nora Bennett',
  'Marc Whitfield', 'Victor Alvarez', 'Lena Fischer',
  'Sanjay Iyer', 'Priya Shah', 'Aisha Mohammed'
];

export const salesAccounts = [
  'BrightPath Advisory', 'Northstar Industrial Solutions', 'Litware Revenue Analytics',
  'Pioneer BioTech Labs', 'Clearwater SaaS Holdings', 'NovaPay Financial',
  'Cobalt Logistics', 'Meridian Health Group', 'Vertex Manufacturing',
  'Aurora Energy Partners', 'Helios Media Group', 'BlueRiver Software'
];

const titles = [
  'Commercial Terms Review', 'Implementation Timeline Review',
  'Executive Alignment', 'Security Review', 'Mutual Action Plan',
  'Pilot Program Kickoff', 'Integration Workshop', 'Procurement Discussion',
  'Pricing Negotiation', 'Technical Evaluation', 'Compliance Sign-off',
  'Onboarding Planning', 'Contract Finalization', 'Statement of Work Review',
  'Vendor Risk Assessment', 'Reference Call', 'Renewal Discussion',
  'Escalation Review', 'Discovery Workshop', 'Solution Demo'
];

const priorities = ['Low', 'Medium', 'High'];
const forecasts = ['Pipeline', 'Best Case', 'Commit', 'Omitted'];
const lossReasons = [
  'Budget cut', 'Chose competitor', 'Timing misalignment',
  'No decision-maker buy-in', 'Project deprioritized'
];

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const pick = (arr, i) => arr[i % arr.length];
const pickStable = (arr, seed) => arr[seed % arr.length];

/**
 * Build a balanced dataset that matches the showcase's column counts
 * (Qualification 9, Discovery 11, Proposal 9, Negotiation 11,
 *  Closed Won 9, Closed Lost 10 — total 59).
 */
function buildPipelineCards() {
  const target = {
    Qualification: 9,
    Discovery: 11,
    Proposal: 9,
    Negotiation: 11,
    ClosedWon: 9,
    ClosedLost: 10
  };

  const out = [];
  let idx = 0;
  Object.keys(target).forEach((stage) => {
    const count = target[stage];
    for (let i = 0; i < count; i++) {
      idx++;
      const isTerminal = stage === 'ClosedWon' || stage === 'ClosedLost';
      const owner = pickStable(salesOwners, idx + i);
      const account = pickStable(salesAccounts, idx + 1);
      const amount = 5000 + ((idx * 7919) % 295000); // 5k..300k
      const probability = isTerminal
        ? (stage === 'ClosedWon' ? 100 : 0)
        : 20 + ((idx * 7) % 70);
      out.push({
        id: `PIPE-${(1000 + idx).toString()}`,
        title: pick(titles, idx + i + stage.length),
        content: pick(titles, idx + i + stage.length), // showcase uses `content` too
        stage,
        owner,
        account,
        amount,
        probability,
        priority: pickStable(priorities, idx + i + stage.length),
        forecastCategory: pickStable(forecasts, idx + 2),
        expectedCloseDate: daysFromNow(((idx * 3) % 60) - 15),
        wonDate: stage === 'ClosedWon' ? daysFromNow(-((idx % 12) + 1)) : null,
        lostDate: stage === 'ClosedLost' ? daysFromNow(-((idx % 10) + 1)) : null,
        lossReason:
          stage === 'ClosedLost' ? pickStable(lossReasons, idx + 3) : null,
        salesCycleDays:
          stage === 'ClosedWon' ? 30 + ((idx * 11) % 80) : null,
        tags: [
          'enterprise',
          stage.toLowerCase(),
          pickStable(['priority', 'expansion', 'renewal', 'new-logo'], idx)
        ]
      });
    }
  });
  return out;
}

export const salesCards = buildPipelineCards();

/**
 * Distinct list of accounts (for the "Project / Dataset" dropdown).
 */
export const salesProjects = ['All Accounts', ...salesAccounts];
