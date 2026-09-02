# Presale Kanban Showcase

A real-world **Syncfusion React Kanban** presales sample combining two
business workflows in a single React JavaScript application:

1. **Sales CRM Pipeline** — 6-stage deal flow (New Lead → Lost) with
   owner swimlanes, forecasting, and CRUD operations.
2. **Healthcare Waitlist** — 4-stage patient flow (Waiting → Completed)
   with provider swimlanes, urgency priorities, and CRUD operations.

## Highlights

- **Single Syncfusion theme** — `@syncfusion/ej2-tailwind3-theme` (overall
  single theme package, imported once in `src/main.jsx`).
- **Greenfield design system** — custom CSS variables (OKLCH) +
  semantic classes, all defined in `src/styles/tokens.css` and
  `src/styles/app.css`.
- **React Router** for SPA navigation between the two pages.
- **Functional components & hooks** throughout.
- **Local JSON dataset** — `src/data/pipelineData.js`,
  `src/data/waitlistData.js`.
- **Responsive layout** — 320 / 768 / 1024 / 1280 breakpoints.
- **WCAG 2.1 AA** — semantic HTML, ARIA labels, 44px+ touch targets,
  reduced-motion support.

## Syncfusion components used

| Component | Package | Purpose |
|---|---|---|
| `KanbanComponent` | `@syncfusion/ej2-react-kanban` | Workflow board |
| `DialogComponent` | `@syncfusion/ej2-react-popups` | View / Edit / Create / Delete modal |
| `ButtonComponent` | `@syncfusion/ej2-react-buttons` | "New Task" / Clear / dialog actions |
| `DropDownListComponent` | `@syncfusion/ej2-react-dropdowns` | Project / Assignee filter |
| `TextBoxComponent`, `TextAreaComponent`, `NumericTextBoxComponent` | `@syncfusion/ej2-react-inputs` | Search & form fields |
| `DatePickerComponent`, `DateRangePickerComponent` | `@syncfusion/ej2-react-calendars` | Date / range filtering |
| `ToastComponent` | `@syncfusion/ej2-react-notifications` | Action confirmations |

## Project structure

```
.
├── apm.yml
├── component-mapping.json
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                    # Entry — imports Syncfusion single theme first
    ├── App.jsx                     # Router + AppBar + PageTabs + Toast
    ├── styles/
    │   ├── tokens.css              # Design tokens (CSS variables)
    │   └── app.css                 # Global app styles
    ├── data/
    │   ├── pipelineData.js         # 59 sales deals across 6 stages
    │   └── waitlistData.js         # 50 patient entries across 4 stages
    ├── components/
    │   ├── layout/
    │   │   ├── AppHeader.jsx
    │   │   ├── PageTabs.jsx
    │   │   ├── ToastBridge.jsx
    │   │   └── ErrorBoundary.jsx
    │   └── kanban/
    │       ├── DashboardStats.jsx
    │       ├── FilterBar.jsx
    │       ├── CardDialog.jsx
    │       └── formatters.js
    └── pages/
        ├── SalesPipelinePage.jsx
        └── HealthcareWaitlistPage.jsx
```

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle
npm run preview  # serve the production build
```

## Optional: Syncfusion license

The app runs with the community-license Syncfusion banner. To remove it,
register a key in `src/main.jsx`:

```js
import { registerLicense } from '@syncfusion/ej2-base';
registerLicense('YOUR_LICENSE_KEY');
```
