# Syncfusion<sup>®</sup> React Gantt Samples

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](../LICENSE)
![GitHub stars](https://img.shields.io/github/stars/SyncfusionExamples/gantt-sdk-samples?style=social)

React-based samples for the **Syncfusion<sup>®</sup> Gantt SDK**. Each sample in
this directory is a small, self-contained React project that demonstrates a
specific Gantt Chart feature and serves as a starting point for your own
application.

> Official Gantt SDK overview: <https://help.syncfusion.com/gantt-sdk/overview>
>
> Back to repo root: [gantt-sdk-samples](../README.md)

---

## Sample Catalog

| Sample | Folder | Component | Demonstrates |
|---|---|---|---|
| Virtual Scrolling with Large Dataset | [virtual-scrolling-large-dataset](virtual-scrolling-large-dataset/) | Gantt Chart | Row & timeline virtualization with **50K – 100K** hierarchical tasks, auto date scheduling, inline editing, and real-time performance benchmarking |

This is the **only sample currently maintained** in this repository. New React
Gantt samples will be added to the table above.

---

## Prerequisites (common to every sample)

- **Node.js 18+** and **npm 9+** (or **yarn** / **pnpm**)
- **Syncfusion license key** — register once before app bootstrap:

  ```typescript
  import { registerLicense } from '@syncfusion/ej2-base';
  registerLicense('YOUR_LICENSE_KEY');
  ```

  Get a free **Community License** at
  <https://www.syncfusion.com/products/communitylicense>.

---

## Run a sample (manual step-by-step)

The following commands work for **every sample** under this folder. Replace
`<sample-folder>` with the name from the **Sample Catalog** table above (for
example, `virtual-scrolling-large-dataset`).

### 1. Clone the repo

```bash
git clone https://github.com/SyncfusionExamples/gantt-sdk-samples.git
cd gantt-sdk-samples/react-gantt/<sample-folder>
```

> You can also start from an already-cloned repo:
>
> ```bash
> cd gantt-sdk-samples
> cd react-gantt/<sample-folder>
> ```

### 2. Install dependencies

```bash
npm install
```

If the install fails on peer dependencies, use:

```bash
npm install --legacy-peer-deps
```

### 3. Start the development server

```bash
npm start
```

`npm start` is the **common dev-server command** used by every sample in this
folder. Once it boots, open <http://localhost:3000> in your browser. 

### 4. Build for production (optional)

```bash
npm run build
```

The production bundle is written to `build/` and is a static bundle ready to
deploy to any static host (Vercel, Netlify, GitHub Pages, S3, IIS, etc.).

> Static CSS for the status bar is inlined inside `public/index.html` — do
> not add a `src/index.css` file; it will be ignored.

---

## Documentation

Use the official user guide as the reference while exploring or extending any
sample in this folder.

- **React Gantt Chart UG** — <https://ej2.syncfusion.com/react/documentation/gantt/>

---