/**
 * Healthcare Waitlist — local JSON dataset.
 *
 * Mirrors the Syncfusion Healthcare Appointment Operations Showcase's
 * `WaitlistEntryDto` returned by the `/api/v1/waitlist` endpoint. The
 * showcase serves this data from a live ASP.NET backend; here we
 * replicate the same data model and the same column distribution
 * (Open 26 / Matched 17 / ClosedExpired 4 / ClosedCancelled 3) using a
 * local array — same shape, same statuses, same urgency taxonomy.
 *
 * Schema (one-to-one with WaitlistEntryDto):
 *   {
 *     waitlistId, patientId, patientName,
 *     preferredProviderId, preferredProviderName,
 *     preferredDepartmentId, preferredDepartmentName,
 *     preferredLocationName, preferredDateRangeStart,
 *     preferredDateRangeEnd, priorityScore,
 *     urgencyLevel, requestedAppointmentType, requestDateTime,
 *     status, matchedAppointmentId
 *   }
 *
 * Status enum (mirrors showcase):
 *   'Open' | 'Matched' | 'ClosedExpired' | 'ClosedCancelled'
 *
 * Urgency enum (mirrors showcase):
 *   'Routine' | 'Urgent' | 'Emergency'
 */

// ---------- Reference data (departments / locations / providers / appt types) ----------

export const waitlistStages = [
  { key: 'Open',             label: 'Open' },
  { key: 'Matched',          label: 'Matched' },
  { key: 'ClosedExpired',    label: 'Closed Expired' },
  { key: 'ClosedCancelled',  label: 'Closed Cancelled' }
];

export const urgencyLevels = ['Routine', 'Urgent', 'Emergency'];

export const waitlistDepartments = [
  { id: 'cardiology',  name: 'Cardiology' },
  { id: 'orthopedics', name: 'Orthopedics' },
  { id: 'neurology',   name: 'Neurology' },
  { id: 'pediatrics',  name: 'Pediatrics' },
  { id: 'dermatology', name: 'Dermatology' },
  { id: 'oncology',    name: 'Oncology' },
  { id: 'ent',         name: 'ENT' },
  { id: 'gastro',      name: 'Gastroenterology' }
];

export const waitlistLocations = [
  { name: 'Meridian' },
  { name: 'Central Health' },
  { name: 'Lakeside' },
  { name: 'Northridge' }
];

export const waitlistClinics = [
  'Eastview', 'Northfield', 'Westpark', 'Riverside', 'Southbay',
  'Pinecrest', 'Hilltop', 'Lakeview', 'Garden District', 'Old Town',
  'Cedar Heights', 'Maple Glen'
];

export const waitlistProviders = [
  'Melissa Tucker', 'James Whitman', 'Aisha Mohammed',
  'Sanjay Iyer', 'Lena Fischer', 'Robert Chen', 'Priya Shah',
  'Marcus Aurelio', 'Janet Robinson', 'David O\'Brien',
  'Sofia Martinez', 'Hiroshi Tanaka', 'Olivia Bennett'
];

export const waitlistAppointmentTypes = [
  'Urgent Care', 'Follow-up', 'Consultation', 'Diagnostic',
  'Pre-op Assessment', 'Therapy Session', 'Lab Review', 'Specialist Referral',
  'Annual Physical', 'Imaging Review', 'Post-op Check', 'Vaccination',
  'Chronic Care Management', 'Sleep Study'
];

// ---------- Helpers ----------

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

const isoDate = (n) => daysFromNow(n).slice(0, 10);
const isoDateTime = (n) => daysFromNow(n);

const pick = (arr, i) => arr[i % arr.length];
const pickStable = (arr, seed) => arr[seed % arr.length];

// ---------- Showcase-aligned patient names ----------
// (Realistic names that look like a healthcare SaaS dataset.)

const firstNames = [
  'David', 'Sarah', 'Michael', 'Jennifer', 'Robert', 'Linda', 'Maria',
  'Christopher', 'Patricia', 'Daniel', 'Barbara', 'Matthew', 'Susan',
  'Anthony', 'Jessica', 'Mark', 'Karen', 'Steven', 'Nancy', 'Paul',
  'Lisa', 'Andrew', 'Margaret', 'Kenneth', 'Carol', 'Joshua', 'Sharon',
  'Kevin', 'Donna', 'Brian', 'Ruth', 'Edward', 'Sandra', 'Ronald',
  'Ashley', 'Timothy', 'Kimberly', 'Jason', 'Emily', 'Jeffrey',
  'Olivia', 'Ryan', 'Carolyn', 'Jacob', 'Janet', 'Gary', 'Frances',
  'Nicholas', 'Catherine', 'Eric', 'Christine', 'Jonathan', 'Deborah',
  'Stephanie', 'Benjamin', 'Rebecca', 'Samuel', 'Sharon', 'Frank',
  'Rachel', 'Gregory', 'Janice', 'Raymond', 'Martha', 'Patrick'
];
const lastNames = [
  'Nelson', 'Carter', 'Mitchell', 'Roberts', 'Phillips', 'Parker',
  'Evans', 'Edwards', 'Collins', 'Stewart', 'Morris', 'Reed', 'Cook',
  'Morgan', 'Bell', 'Murphy', 'Bailey', 'Cooper', 'Howard', 'Ward',
  'Brooks', 'Gray', 'Hughes', 'Price', 'Sanders', 'Bennett', 'Wood',
  'Barnes', 'Ross', 'Henderson', 'Coleman', 'Jenkins', 'Perry',
  'Powell', 'Long', 'Patterson', 'Flores', 'Washington', 'Butler',
  'Simmons', 'Foster', 'Hendricks', 'Gonzales', 'Buchanan', 'Meadows',
  'Davenport', 'Caldwell', 'Holloway', 'Fitzgerald', 'Schmidt', 'Vargas'
];

// ---------- Build the dataset ----------

/**
 * Tiny deterministic PRNG so the dataset is stable across reloads
 * but distributes across all departments / locations / clinics
 * instead of concentrating in just one or two swimlanes.
 */
function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const pickRandom = (arr, rng) => arr[Math.floor(rng() * arr.length) % arr.length];

/**
 * Build a list of swimlanes — one per (department, location, clinic)
 * combo. We deliberately limit to ~10 swimlane rows so each row
 * gets 2+ items per status and the kanban board stays dense rather
 * than scrolling forever. A real waitlist typically has a smaller
 * number of active department+location combinations; the showcase
 * surfaces ~10-15 swimlanes for a board of this size.
 */
function buildSwimlaneList() {
  // Hand-picked (department, location, clinic) triples chosen to span
  // the catalog naturally. 10 rows are enough that each (row × status)
  // cell gets ≥ 2 entries.
  const triples = [
    { dept: 'Cardiology',      loc: 'Meridian',        clinic: 'Eastview' },
    { dept: 'Cardiology',      loc: 'Lakeside',        clinic: 'Lakeview' },
    { dept: 'Orthopedics',     loc: 'Central Health',  clinic: 'Westpark' },
    { dept: 'Orthopedics',     loc: 'Meridian',        clinic: 'Northfield' },
    { dept: 'Neurology',       loc: 'Northridge',      clinic: 'Southbay' },
    { dept: 'Pediatrics',      loc: 'Meridian',        clinic: 'Hilltop' },
    { dept: 'Pediatrics',      loc: 'Central Health',  clinic: 'Riverside' },
    { dept: 'Dermatology',     loc: 'Lakeside',        clinic: 'Garden District' },
    { dept: 'Oncology',        loc: 'Northridge',      clinic: 'Pinecrest' },
    { dept: 'Gastroenterology', loc: 'Central Health', clinic: 'Cedar Heights' }
  ];
  return triples.map(({ dept, loc, clinic }) => {
    const department = waitlistDepartments.find((d) => d.name === dept);
    const location   = waitlistLocations.find((l) => l.name === loc);
    return {
      department,
      location,
      clinic,
      swimlaneKey: `${department.id}-${location.name}-${clinic}`,
      swimlaneText: `${department.name} — ${location.name} — ${clinic}`
    };
  });
}

/**
 * Build the full waitlist dataset.
 *
 * Strategy: explicit (swimlane × status) grid — each cell gets a
 * baseline of items, then the surplus entries are distributed in
 * round-robin order. This guarantees:
 *   - Every visible swimlane has 2+ items per status column
 *   - The total per status matches the showcase's column counts
 *   - The distribution is deterministic across reloads
 */
function buildWaitlistEntries() {
  const swimlanes = buildSwimlaneList();           // ~22 rows
  // Target column counts (must match the showcase)
  const target = {
    Open: 26,
    Matched: 17,
    ClosedExpired: 4,
    ClosedCancelled: 3
  };

  const out = [];
  let idx = 0;

  // For each status, determine how many items per swimlane.
  // Each (swimlane, status) cell gets `base` items, plus a surplus
  // distributed to the first `surplusSwimlanes` so totals match.
  Object.entries(target).forEach(([status, total]) => {
    const base = Math.floor(total / swimlanes.length);
    const surplus = total - base * swimlanes.length;
    // Use a per-status RNG for clinic/jitter only (not for swimlane choice).
    const rng = makeRng(7001 + status.length * 13);

    // Walk swimlanes cyclically, giving each `base` items, then the
    // first `surplus` swimlanes in the list get one extra so the
    // grand total hits exactly `total`.
    swimlanes.forEach((sl, slIdx) => {
      const slotCount = base + (slIdx < surplus ? 1 : 0);
      for (let i = 0; i < slotCount; i++) {
        idx++;

        const department = sl.department;
        const location   = sl.location;
        const clinic     = sl.clinic;

        // ~75% have a provider.
        const hasProvider = rng() > 0.25;
        const provider = hasProvider
          ? pickRandom(waitlistProviders, rng)
          : null;

        // Urgency: tied loosely to status.
        let urgency;
        if (status === 'Open') {
          urgency = pickStable(urgencyLevels, (idx * 7) % urgencyLevels.length);
        } else if (status === 'Matched') {
          urgency = pickStable(urgencyLevels, (idx * 5 + 1) % urgencyLevels.length);
        } else if (status === 'ClosedExpired') {
          urgency = pickStable(urgencyLevels, (idx * 3 + 2) % urgencyLevels.length);
        } else {
          urgency = pickStable(urgencyLevels, (idx * 4 + 1) % urgencyLevels.length);
        }

        const priorityScore = urgency === 'Emergency' ? 88 + ((idx * 3) % 12)
          : urgency === 'Urgent' ? 55 + ((idx * 4) % 30)
          : 25 + ((idx * 5) % 35);

        const requestDaysAgo = 1 + Math.floor(rng() * 60);
        const apptType = pickRandom(waitlistAppointmentTypes, rng);

        const rangeStartOffset = urgency === 'Emergency' ? 1 + (i % 3)
          : urgency === 'Urgent' ? 5 + (i % 7)
          : 14 + (i % 21);
        const rangeEndOffset = rangeStartOffset + 14 + (i % 14);

        out.push({
          waitlistId: `WL-${(200 + idx).toString()}`,
          patientId: `PT-${(10000 + idx * 7).toString()}`,
          patientName: `${pick(firstNames, idx + i)} ${pick(lastNames, idx + 3)}`,
          preferredProviderId: provider
            ? `PR-${(100 + (idx % waitlistProviders.length)).toString()}`
            : null,
          preferredProviderName: provider,
          preferredDepartmentId: department.id,
          preferredDepartmentName: department.name,
          preferredLocationName: location.name,
          preferredDateRangeStart: isoDate(rangeStartOffset),
          preferredDateRangeEnd: isoDate(rangeEndOffset),
          priorityScore,
          urgencyLevel: urgency,
          requestedAppointmentType: apptType,
          requestDateTime: isoDateTime(-requestDaysAgo),
          status,
          matchedAppointmentId:
            status === 'Matched' ? `APT-${(30000 + idx).toString()}` : null,
          // Computed display fields for the swimlane.
          swimlaneText: sl.swimlaneText,
          swimlaneKey:  sl.swimlaneKey
        });
      }
    });
  });
  return out;
}

export const waitlistEntries = buildWaitlistEntries();

/**
 * Project / dataset dropdown uses the department list.
 */
export const waitlistProjects = [
  'All Departments',
  ...waitlistDepartments.map((d) => d.name)
];
